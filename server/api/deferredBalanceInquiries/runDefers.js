import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import _ from 'lodash';
import querystring from 'querystring';
import uuid from 'node-uuid';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import config from '../../config/environment';
import DaemonError from '../daemonError/daemonError.model';
import Inventory from '../inventory/inventory.model';
import Retailer from '../retailer/retailer.model';
import User from '../user/user.model';
import {determineSellTo} from '../card/card.helpers';
import {DocumentNotFoundException, SellLimitViolationException} from '../../exceptions/exceptions';
import {syncWithBi} from '../retailer/retailer.controller';
import {updateInventory} from '../card/card.socket';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

const biUpdateInteralLength = 1000 * 60 * 60 * 5;
const daemonEmail = 'daemon@daemon.com';
const intervalLength = 5000;
let daemonUser;
let dbDeferred;
let interval, biInterval;
let promises = [];


// If I use the http library I can't include http:. If I switch, I should add it back
// Liquidation API URL
export const activityPath = 'sell/activity';
export const csvRatesPath = 'sell/smp/update_rate/csv';
export const deletePath = 'giftcard/delete';
export const liquidationApiKey = '1W7dti8ocRGLl7U';
export const liquidationApiPort = 8080;
export const liquidationApiUrl = 'http://localhost';
export const ratesPath = 'sell/retailers/rates';
export const smpMaxMinPath = 'sell/smp/max_min';
export const updateRatesFromLqPath = 'sell/retailers/rates?combine=true';
export const updateRatesPath = 'sell/retailers/update';
export const updateRetailerPath = 'sell/update_retailer';

// SMP codes
export const SAVEYA = '1';
export const CARDCASH = '2';
export const CARDPOOL = '3';
export const GIFTCARDRESCUE = '4';
export const INVALID = '0';

// Default margin
export const defaultMargin = 0.03;

/**
 * Get request options for a particular request
 * @param queryParams Object of query params
 * @param path API path
 * @param overrides
 */
export function getRequestOptions(queryParams, path, overrides = {}) {
  // Initial liquidation communication object
  return Object.assign({
    host: liquidationApiUrl,
    port: liquidationApiPort,
    path: path + '?' + querystring.stringify(queryParams),
    headers: {apiKey: liquidationApiKey},
    method: 'post'
  }, overrides);
}

/**
 * Lock/unlock all inventories
 * @param inventories
 * @param lock Lock or unlock
 * @return {Promise.<*>}
 */
function lockInventories(inventories, lock = true) {
  const promises = [];
  inventories.forEach(inventory => {
    inventory.locked = lock;
    promises.push(inventory.save());
  });
  return Promise.all(promises);
}

/**
 * Sell cards which have been added to the liquidation API
 */
export async function sellCardsInLiquidation() {
  try {
    const inventories = await Inventory.find({
      soldToLiquidation: false,
      // Only if allowed to proceed
      proceedWithSale: {$ne: false},
      disableAddToLiquidation: { $nin: ['sell', 'all'] },
      // Don't sell disabled cards
      type: {$ne: 'DISABLED'},
      locked: {$ne: true},
      // Don't run transactions
      isTransaction: {$ne: true}
    })
    .limit(10);

    for (let inventory of inventories) {
      // Stop if inventory got locked by another server
      inventory = await Inventory.findById(inventory._id)
      .populate('card')
      .populate('retailer')
      .populate('company');
      if (inventory.locked) {
        continue;
      }
      // Lock inventory
      inventory.locked = true;
      await inventory.save();
      // Get retailer with merch values
      const retailer = inventory.retailer.populateMerchValues(inventory);
      if (retailer) {
        const companySettings = await inventory.company.getSettings();
        const sellTo = determineSellTo(retailer, inventory.balance, companySettings);
        inventory.soldToLiquidation = true;
        // No sale
        if (!sellTo || sellTo.smp === null) {
          sellTo.smp = '0';
          inventory.status = 'SALE_FAILED';
          // Sale
        } else {
          inventory.smp = sellTo.smp;
          inventory.liquidationRate = sellTo.rate;
          inventory.type = sellTo.type;
        }
        if (inventory.smp === '0') {
          inventory.status = 'SALE_FAILED';
          inventory.type = 'DISABLED';
        } else {
          inventory.status = 'SALE_NON_API';
          let balance = inventory.balance;
          let liquidationRate = inventory.liquidationRate;
          if (typeof balance !== 'number') {
            balance = 0 ;
          }
          if (typeof liquidationRate !== 'number') {
            liquidationRate = 0;
          }
          inventory.liquidationSoldFor = liquidationRate * balance;
          inventory.cqTransactionId = uuid();
        }
        // Unlock card
        inventory.locked = false;
        await inventory.save();
        // Notify frontend
        updateInventory.socketUpdate(inventory);
      }
    }
  } catch (err) {
    console.log('**************SELL CARDS ERR**********');
    console.log(err);
    await ErrorLog.create({
      method: 'sellCardsInLiquidation',
      controller: 'runDefers',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
  }
}

/**
 * Determine SMP
 * @param sellTo { rate: 0.58, smp: 'cardCash', type: 'electronic' }
 * @param inventory
 * @return {*}
 */
function determineSmp(sellTo, inventory) {
  // No sale
  if (!sellTo || sellTo.smp === null) {
    sellTo.smp = '0';
    inventory.status = 'SALE_FAILED';
    // Sale
  } else {
    inventory.smp = sellTo.smp;
    inventory.liquidationRate = sellTo.rate;
    inventory.type = sellTo.type;
  }
  if (inventory.smp === '0') {
    inventory.status = 'SALE_FAILED';
    inventory.type = 'DISABLED';
  } else {
    inventory.status = 'SALE_NON_API';
    let balance = inventory.balance;
    let liquidationRate = inventory.liquidationRate;
    if (typeof balance !== 'number') {
      balance = 0 ;
    }
    if (typeof liquidationRate !== 'number') {
      liquidationRate = 0;
    }
    inventory.liquidationSoldFor = liquidationRate * balance;
    inventory.cqTransactionId = uuid();
  }
  return inventory;
}

/**
 * Finalize transaction values
 * @param inventory
 * @param dbCompanySettings
 * @param recalculating Recalculating a transaction which was previously calculated
 * @return {Promise.<*>}
 */
export async function finalizeTransaction(inventory, dbCompanySettings, recalculating = false) {
  // Use either array of settings or a single settings
  const companySettings = dbCompanySettings[inventory._id] ? dbCompanySettings[inventory._id] : dbCompanySettings;
  let retailer;
  // Populate retailer if we have a plain object
  let retailerId = null;
  // Make sure we have a valid retailer object
  if (inventory.retailer.constructor.name === 'model') {
    retailer = inventory.retailer;
  } else {
    if (_.isPlainObject(inventory.retailer)) {
      retailerId = inventory.retailer._id;
    } else if (inventory.retailer instanceof ObjectId) {
      retailerId = inventory.retailer;
    }
    retailer = await Retailer.findById(retailerId);
  }
  if (!retailer) {
    throw new DocumentNotFoundException('Retailer not found', 404);
  }
  retailer = retailer.populateMerchValues(inventory);
  // Don't redetermine SMP if we're recalculating, since SMP might have changes since original purchase
  if (!recalculating) {
    // Sell to rates
    const sellTo = determineSellTo(retailer, inventory.balance, companySettings);
    // Unable to sell card
    if (!sellTo) {
      throw new SellLimitViolationException('Card violates sell limits', 400);
    }
    inventory = determineSmp(sellTo, inventory);
  }
  // Service fee RATE
  const serviceFeeRate = typeof inventory.serviceFee !== 'undefined' ? inventory.serviceFee : companySettings.serviceFee;
  const margin = typeof inventory.margin !== 'undefined' ? inventory.margin : companySettings.margin;
  const balance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : inventory.balance;
  // Service fee dollar value
  inventory.transaction.serviceFee = parseFloat((serviceFeeRate * (balance * (inventory.liquidationRate - margin))).toFixed(3));
  inventory.margin = typeof inventory.margin !== 'undefined' ? inventory.margin : companySettings.margin;
  // Lock
  inventory.soldToLiquidation = true;
  // Determine amount paid
  const cqPaid = Inventory.getCqPaid(balance, (inventory.liquidationRate - inventory.margin));
  // Create reserve
  const reserveAmount = Inventory.getReserveAmount(balance, config.reserveRate);
  inventory.transaction.reserveAmount = reserveAmount;
  // Get transaction values
  inventory = inventory.getTransactionValues(reserveAmount, cqPaid, balance);
  return inventory.save();
}

/**
 * Calculate transaction values
 * @param dbInventories
 * @param dbCompanySettings
 * @return {Promise.<*>}
 */
export async function finalizeTransactionValues(dbInventories, dbCompanySettings) {
  const finalInventories = [];
  for (let inventory of dbInventories) {
    finalInventories.push(await finalizeTransaction(inventory, dbCompanySettings));
  }
  return finalInventories;
}

/**
 * Create reserve for inventories
 * @param inventories
 * @return {Promise.<Array|*>}
 */
async function createInventoryReserves(inventories) {
  let final = [];
  for (let inventory of inventories) {
    final.push(await inventory.createReserve());
  }
  return final;
}

/**
 * Sell cards for transactions
 */
export async function completeTransactions() {
  const dbCompanySettings = {};
  let dbInventories;
  let dbReserves;
  return Inventory.find({
    soldToLiquidation: false,
    // Only if allowed to proceed
    proceedWithSale: {$ne: false},
    disableAddToLiquidation: { $nin: ['sell', 'all'] },
    // Don't sell disabled cards
    type: {$ne: 'DISABLED'},
    locked: {$ne: true},
    // Don't run transactions
    isTransaction: true,
    // Make sure not invalid
    valid: {$ne: false}
  })
  .populate('card')
  .populate('retailer')
  .populate('company')
  .populate('store')
  .limit(10)
  .then(inventories => lockInventories(inventories))
  .then(inventories => {
    dbInventories = inventories;
    const promises = [];
    inventories.forEach(inventory => {
      promises.push(inventory.company.getSettings());
    });
    return Promise.all(promises);
  })
  .then(settings => {
    settings.forEach((setting, index) =>{
      dbCompanySettings[dbInventories[index]._id] = setting;
    });
  })
  // Create reserve
  .then(async () => {
    // Calculate values for transactions
    let inventories = await finalizeTransactionValues(dbInventories, dbCompanySettings);
    return await createInventoryReserves(inventories);
  })
  // Add reserve reference to inventory, store, and company
  .then(async reserves => {
    dbReserves = reserves;
    for (let reserve of reserves) {
      await Inventory.addToRelatedReserveRecords(reserve);
    }
  })
  .then(inventories => lockInventories(dbInventories, false))
  .then(() => {})
  .catch(async err => {
    await ErrorLog.create({
      method: 'completeTransactions',
      controller: 'runDefers',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    console.log('**************RESOLVE TRANSACTION ERR**********');
    console.log(err);
    // Unlock on fuck up
    lockInventories(dbInventories, false).then(() => {})
  });
}

/**
 * Update bi active every 5 hours
 */
function updateBiActive() {
  const fakeRes = {json: () => {}, status: () => {
    return {
      json: () => {}
    };
  }};
  syncWithBi({}, fakeRes);
}

/**
 * Begin the process
 */
function startInterval() {
  promises = [];
  // Find daemon
  User.findOne({email: daemonEmail})
  .then(daemon => {
    // Use daemon for making BI requests
    if (daemon) {
      daemonUser = daemon;
    } else {
      throw 'Could not find daemon';
    }
  })
  .then(() => {
    interval = setInterval(() => {
      // Attempt to sell any cards already in liquidation
      sellCardsInLiquidation();
      completeTransactions();
    }, intervalLength);
    biInterval = setInterval(() => {
      // Update BI active
      updateBiActive();
    }, biUpdateInteralLength);
  });
}

/**
 * Write errors to the Db
 */
function writeErrors() {
  const daemonError =  new DaemonError();
  daemonError.referenceId = dbDeferred._id;
  daemonError.referenceModel = 'DeferredBalanceInquiry';
  daemonError.save()
  .catch(err => {
    console.log('**************DAEMON ERROR SAVE ERROR**********');
    console.log(err);
  });
}
/**
 * Continually perform balance inquiries on those cards which were returned deferred
 *
 * @todo I need to run this using forever.js, just need to figure out how to get socket into it
 */
export default function runDefers() {
  try {
    startInterval();
  } catch (e) {
    console.log('**************CATCH RUN DEFERS**********');
    console.log(e);
    // Make note of the error
    writeErrors();
    // Kill the old
    clearInterval(interval);
    clearInterval(biInterval);
    // Bring in the new
    startInterval();
  }
}

/*
 We care about balance, remove buy rate and buy amount
 We need CQ buy amount and CQ buy rate
 We need what we're supposed to pay the customer
 We need to total the columns after filtering

 We really need how much we pay and how much our rate is
 We want to see the rate that we got from secondary market at the time which it is sold
 */
