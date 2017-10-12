'use strict';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Inventory from '../inventory/inventory.model';
import DenialPayment from '../denialPayment/denialPayment.model';
import BiRequestLogs from '../biRequestLog/biRequestLog.model';
import CompanySettings from '../company/companySettings.model';
import Company from '../company/company.model';
import Customer from '../customer/customer.model';
import ErrorLog from '../errorLog/errorLog.model';
import Retailer from '../retailer/retailer.model';
import {recalculateTransactionAndReserve} from '../card/card.helpers';
import {DocumentNotFoundException, SellLimitViolationException} from '../../exceptions/exceptions';
import {resendCallback} from '../callbackLog/callbackLog.controller';
import {lqCustomerFind, apiCustomerValues} from '../lq/lq.controller';
import Card from '../card/card.model';
import {biCodes, retailersNoPin} from '../../config/environment';
import _ from 'lodash';
import {isObjectId} from '../../helpers/validation';
import mailer from '../mailer';
import {getGitRev} from '../../helpers/errors';
import moment from 'moment';


/**
 * Get denials since the last time reconciliation was closed
 */
export async function getDenials(req, res) {
  // Get the last time reconciliation was closed
  // Check for denials since the reconciliation close
  const {pageSize = 10, page = 0} = req.params;
  let begin = req.params.begin;
  let end = req.params.end;
  begin = moment.utc(begin).startOf('day');
  end = moment.utc(end).endOf('day');
  let retailersWithDenials = [];
  let searchQuery = {};

  if(req.query.hasOwnProperty('companyId')) {
    if(req.query.hasOwnProperty('storeId')) {
      searchQuery = {
        company: req.query.companyId,
        store: req.query.storeId
      }
    } else {
      searchQuery = {
        company: req.query.companyId
      }
    }
  }
  else if(req.query.hasOwnProperty('storeId')) {
    searchQuery = {
      store: req.query.storeId
    }
  }
  searchQuery.created = {$gt: begin.toDate(), $lt: end.toDate()};

  try {
    const retailersCount = await Retailer.count({});
    const retailers = await Retailer.find({})
      .limit(parseInt(pageSize))
      .skip(parseInt(page) * parseInt(pageSize)).lean();

    for(let retailer of retailers) {
      let query = Object.assign({}, searchQuery);
      query.retailer = retailer._id;
      const inventoriesThisRetailer = await Inventory.count(query);
      query.rejected = true;
      const rejectedInventories = await Inventory.count(query);
      if(inventoriesThisRetailer && rejectedInventories) {
        retailer['percentOfDenials'] = rejectedInventories / inventoriesThisRetailer * 100;
      } else {
        retailer['percentOfDenials'] = 0;
      }
      retailersWithDenials.push(retailer);
    }

    return res.json({
      data: retailersWithDenials,
      total: retailersCount
    });
  }
  catch(e) {
    console.log('********************ERR IN ADMIN GETDENIALS***********************');
    console.log(e);
    return res.status(500).json({err: e});
  }
}

/**
 * Set card statuses
 */
export async function setCardStatus(req, res) {
  try {
    await Inventory.update(
      {
        _id: {
          $in: req.body.cardIds
        }
      },
      {
        $set: {
          activityStatus: req.body.status
        }
      },
      {multi: true});
    res.json({});
  }
  catch(err) {
    console.log('**************ERR IN SET CARD STATUS**********');

    await ErrorLog.create({
      method: 'setCardStatus',
      controller: 'admin.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 * Recreate rejection history
 */
export function recreateRejectionHistory(req, res) {
  DenialPayment.find({})
  .then(denialPayments => {
    const promises = [];
    denialPayments.forEach(denial => {
      promises.push(denial.remove());
    });
    return Promise.all(promises);
  })
  .then(() => {
    return Inventory.find({
      rejected: true
    })
    .populate('customer');
  })
  .then(inventories => {
    const promises = [];
    inventories.forEach(inventory => {
      // Update rejection amounts
      const buyAmount = inventory.buyAmount;
      // Buy amount after adjustment
      const realBuyAmount = inventory.buyRate * inventory.verifiedBalance;
      if (realBuyAmount < buyAmount) {
        const rejectAmount = buyAmount - realBuyAmount;
        // Set rejected
        inventory.rejectedDate = Date.now();
        inventory.rejectAmount = rejectAmount;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  })
  .then(inventories => {
    const customers = {};
    inventories.forEach(inventory => {
      // Create collection of customers with inventories
      if (!customers[inventory.customer._id]) {
        customers[inventory.customer._id] = {
          inventories: [],
          rejectionTotal: 0,
          customer: inventory.customer
        };
      }
      customers[inventory.customer._id].inventories.push(inventory);
    });
    return customers;
  })
  .then(customers => {
    const promises = [];
    _.forEach(customers, customer => {
      customer.rejectionTotal = customer.inventories.reduce((curr, next) => {
        return curr + next.rejectAmount;
      }, 0);
      let currentRejectionTotal = 0;
      // Get current reject value
      try {
        if (_.isNumber(currentRejectionTotal)) {
          currentRejectionTotal = customer.customer.rejectionTotal;
        }
      } catch (e) {
        currentRejectionTotal = 0;
      }
      let denialPayment = null;
      // If less than it should be, create a denial payment
      if (currentRejectionTotal < customer.rejectionTotal) {
        denialPayment = new DenialPayment({
          customer: customer.customer._id,
          amount: customer.rejectionTotal - currentRejectionTotal
        });
        promises.push(denialPayment.save());
      }
      promises.push(customer.customer.save());
    });
  })
  .then(() => res.json({}));
}

/**
 * Add deduction
 */
export function addDeduction(req, res) {
  const {ach, inventory} = req.body;
  let company;

  Inventory.find({cqAch: ach})
  .then(inventories => {
    if (! inventories.length) {
      throw 'achNotFound';
    }

    if (inventories.length > 1) {
      const companies = new Set();
      inventories.forEach(inv => {
        companies.add(inv.company.toString());
      });

      if (companies.size > 1) {
        throw 'multipleCompanies';
      }
    }

    company = inventories[0].company;

    return Inventory.findById(inventory);
  })
  .then(dbInventory => {
    if (! dbInventory) {
      throw 'inventoryNotFound';
    }

    if (dbInventory.company.toString() !== company.toString()) {
      throw 'differentCompany';
    }

    dbInventory.deduction = ach;
    dbInventory.save();

    return res.json({});
  })
  .catch(async err => {

    if (err === 'achNotFound') {
      return res.status(400).json({error: "The ACH could not be found in the database."});
    }

    if (err === 'inventoryNotFound') {
      return res.status(400).json({error: "Invalid inventory specified."});
    }

    if (err === 'multipleCompanies') {
      return res.status(400).json({error: "This ACH belongs to multiple companies."});
    }

    if (err === 'differentCompany') {
      return res.status(400).json({error: "This ACH belongs to a different company."});
    }

    console.log('**************ERR IN ADDDEDUCTION**************');
    console.log(err);

    await ErrorLog.create({
      method: 'addDeduction',
      controller: 'admin.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json({error: "Something went wrong."});
  });
}

/**
 * Fill in system time on existing cards
 */
export function systemTime(req, res) {
  Inventory.find()
  .then(inventories => {
    const promises = [];
    inventories.forEach(inventory => {
      if (!inventory.systemTime) {
        inventory.systemTime = inventory.created;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  })
  .then(() => res.json({}))
}

export function testCallback(req, res) {
  console.log(req.body);
  res.json({});
}

async function getInventory(cardId) {
  return Inventory.findOne({card: cardId});
}

/**
 * Fix BI log duplications
 * @return {Promise.<void>}
 */
export async function fixBiLogDuplications(req, res) {
  const duplicateLogs = {};
  const allLogs = {};
  let logs;
  logs = await BiRequestLogs.find({}).sort({created: -1});
  for (const log of logs) {
    const key = `${log.retailerId.toString()}.${log.number}.${log.pin}`;
    // Duplicate
    if (allLogs[key]) {
      // Duplicate already exists in structure
      if (duplicateLogs[key]) {
        duplicateLogs[key].push(log._id);
      // First duplicate instance, push duplicate and original
      } else {
        duplicateLogs[key] = [log._id];
      }
    } else {
      allLogs[key] = log._id;
    }
  }
  // Remove duplicates
  for (const dup in duplicateLogs) {
    await BiRequestLogs.remove({
      _id: {$in: duplicateLogs[dup]}
    });
  }
  return res.json({});
}

/**
 * Calculate an inventory's "completeness" score
 * @param inventory
 * @return {number}
 */
function calculateInventoryWeight(inventory) {
  // Assign partial weight to activity status, since we need to compare them, but giving entire points would throw everything off
  const activityStatusValues = {
    'notShipped': 0,
    shipped: 0.2,
    receivedCq: 0.4,
    sentToSmp: 0.6,
    receivedSmp: 0.8,
    rejected: 0.1
  };
  // Inventory "score" to see how complete it is based on admin activity interaction
  let score = 0;
  // Iterate the values typically modified from admin activity
  ['orderNumber', 'cqAch', 'smpAch', 'credited', 'rejected', 'activityStatus'].forEach(property => {
    if (inventory[property]) {
      score = score + 1;
    }
    if (property === 'activityStatus') {
      const activityStatusValue = activityStatusValues[inventory[property]];
      if (!isNaN(activityStatusValue)) {
        score = score + activityStatusValue;
      }
    }
  });
  return score;
}

/**
 * Fix inventory duplications (find multiple inventories which apply to the same card)
 */
export async function fixInventoryDuplications(req, res) {
  const inventories = await Inventory.find({created: {$gt: new Date('2017-06-01')}});
  const cards = {};
  const duplicates = {}     ;
  for (const inventory of inventories) {
    // First instance
    if (!cards[inventory.card.toString()]) {
      cards[inventory.card.toString()] = inventory;
    // Not first instance
    } else {
      // First duplicate
      if (!duplicates[inventory.card.toString()]) {
        duplicates[inventory.card.toString()] = [cards[inventory.card.toString()], inventory];
      // Additional duplicates
      } else {
        duplicates[inventory.card.toString()].push(inventory);
      }
    }
  }
  const inventoriesToDelete = {};
  for (const [id, inventories] of Object.entries(duplicates)) {
    for (const [index, inventory] of inventories.entries()) {
      // Init new comparison, assume it's the first one to delete
      if (!index) {
        inventoriesToDelete[inventory.card.toString()] = [];
      }

      const score = calculateInventoryWeight(inventory);
      // inventoriesToDelete[inventory.card.toString()].push({score, inventory: inventory._id});
      const inventoryValues = {
        '_id'           : inventory._id,
        'orderNumber'   : inventory.orderNumber,
        'cqAch'         : inventory.cqAch,
        'smpAch'        : inventory.smpAch,
        'credited'      : inventory.credited,
        'rejected'      : inventory.rejected,
        'activityStatus': inventory.activityStatus
      };
      inventoriesToDelete[inventory.card.toString()].push({score, inventory: inventoryValues});
    }
  }
  for (const [cardId, inventoryWeightTuples] of Object.entries(inventoriesToDelete)) {
    // Remove those which are marked duplicate
    for (const tuple of inventoryWeightTuples) {
      if (tuple.inventory.orderNumber && tuple.inventory.orderNumber.toLowerCase() === 'duplicate') {
        await Inventory.remove({_id: tuple.inventory._id});
      }
    }
    // make sure we don't delete all inventories
    let allZeroValues = false;
    // Delete all of the 0 scored
    for (const tuple of inventoryWeightTuples) {
      if (tuple.score > 0) {
        allZeroValues = true;
      }
    }
    // If we have a zero value, delete it so long as there are other inventories
    if (!allZeroValues) {
      for (const tuple of inventoryWeightTuples) {
        await Inventory.remove({_id: tuple.inventory._id});
      }
    // All zero values, just delete all but one
    } else {
      const count = inventoryWeightTuples.length;
      for (const inventory of inventoryWeightTuples.entries()) {
        // Remove all but one at random
        if (inventory[0] < count) {
          await Inventory.remove({_id: inventory[1].inventory._id});
        }
      }
    }
  }
  return res.json({});
}

/***
 * Recalculate transaction values
 */
export async function recalculateTransactions(req, res) {
  const {inventories, dateBegin = null, dateEnd = null} = req.body;
  let findParams = {};
  if (inventories) {
    findParams = {
      _id: {
        $in: inventories
      },
      isTransaction: true
    };
  } else if (dateBegin && dateEnd) {
    findParams = {
      created: {
        $gt: new Date(dateBegin),
        $lt: new Date(dateEnd)
      },
      isTransaction: true
    };
  } else {
    return res.status(400).json({err: 'inventories or dateBegin and dateEnd are needed'})
  }
  try {
    const dbInventories = await Inventory.find(findParams)
    .populate('retailer');
    // Redo calculations for each transaction
    for (let inventory of dbInventories) {
      const companyId = inventory.company;
      // Get settings
      let companySettings = await CompanySettings.findById(companyId);
      // No settings yet
      if (!companySettings) {
        const company = await Company.findById(companyId);
        companySettings = await company.getSettings();
      }
      await recalculateTransactionAndReserve(inventory);
    }
    return res.json({});
  } catch (err) {
    console.log('**************ADMIN RECALCULATE TRANSACTION ERROR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'recalculateTransactions',
      controller: 'admin.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    if (err instanceof DocumentNotFoundException || err instanceof SellLimitViolationException) {
      return res.status(err.code).json({err: err.message});
    } else {
      res.status(500).json({err: 'Unable to recalculate transactions'});
    }
  }
}

/**
 * Update customer rejections or credits
 * @param apiCustomer Default API customer
 * @param customer Correct company customer
 * @param inventory Inventory on wrong customer
 * @param type "rejection" or "credit" or "none"
 * @return {Promise.<*>}
 */
async function updateCustomerRejectionCredit(apiCustomer, customer, inventory, type = 'none') {
  let pullType = 'credits';
  let multiplier = 1;
  let amountType = 'creditAmount';
  if (type === 'rejection') {
    pullType = 'rejections';
    multiplier = -1;
    amountType = 'rejectAmount';
  }
  // Set customer on inventory
  await inventory.update({
    $set: {
      customer: customer._id
    }
  });
  // Nothing to do on non-rejection/credits
  if (type === 'none') {
    return Promise.resolve([apiCustomer, customer]);
  } else {
    if (type === 'credit') {
      // Remove the existing denial payment
      DenialPayment.remove({
        customer: apiCustomer._id,
        amount: inventory[amountType]
      });
      // Add in new denial payment
      await DenialPayment.create({
        customer: customer._id,
        amount: inventory[amountType]
      });
    }
    // Update API customer
    apiCustomer[pullType].splice(apiCustomer[pullType].indexOf(inventory._id), 1);
    apiCustomer.rejectionTotal = apiCustomer.rejectionTotal - (inventory[amountType] * multiplier);
    apiCustomer = await apiCustomer.save();
    // Update correct customer
    customer[pullType].splice(customer[pullType].indexOf(inventory._id, 1));
    customer.rejectionTotal = customer.rejectionTotal - (inventory[amountType] * multiplier);
    customer = await customer.save();
    return Promise.resolve([apiCustomer, customer]);
  }
}

/**
 * Change generic API_CUSTOMER to a company specific API customer
 */
export async function fixLqApiCustomerCompany(req, res) {
  const ps = await Company.findOne({name: /posting/i});
  // Get
  let apiCustomer = await Customer.find(Object.assign({}, lqCustomerFind, {$or: [
    {company: {$exists: false}},
    {company: ps._id}
  ]}));
  // Make sure we're not running this multiple times, as it might have some crazy side effects
  if (apiCustomer.length > 1) {
    return res.status(400).json({err: 'Already run'});
  }
  apiCustomer = apiCustomer[0];
  // Found customer
  if (apiCustomer) {
    // Make the default customer into PS's
    if (!apiCustomer.company) {
      apiCustomer.company = ps._id;
      await apiCustomer.save();
    }
  } else {
    // // Don't allow this to be run more than once
    return res.status(400).json({err: 'Unable to find API customer'});
  }
  // Get all inventories by the API customer
  const inventories = await Inventory.find({customer: apiCustomer._id, company: {$ne: ps._id}});

  // Find inventories which do not belong to PS
  for (const inventory of inventories) {
    // Non-PS
    if (inventory.company.toString() !== ps._id.toString()) {
      // Create API customer for this company if it doesn't already exist
      let customer = await Customer.findOne(apiCustomerValues(inventory.company));
      if (!customer) {
        customer = await Customer.create(apiCustomerValues(inventory.company));
      }
      let type = 'none';
      if (inventory.credited || inventory.rejected) {
        type = inventory.credited ? 'credit' : 'rejection'
      }
      // See if this inventory has rejections/credits that need to be moved
      [apiCustomer, customer] = await updateCustomerRejectionCredit(apiCustomer, customer, inventory, type);
    }
  }
  return res.json({});
}

/**
 * Send a cqPaymentInitiated callback for each inventory specified in the request body
 */
export async function sendCallbackFromActivity(req, res) {
  const {inventories, type = 'cqPaymentInitiated', force = false} = req.body;
  let types = [];
  if (type === 'denial') {
    types = ['denial', 'credit'];
  } else {
    types = [type];
  }

  for (const inventory of inventories) {
    const dbInventory = await Inventory.findById(inventory).populate('card');
    const card = Object.assign({}, dbInventory.card.toObject());
    card.inventory = dbInventory.toObject();
    for (const thisType of types) {
      await resendCallback(null, card, thisType, force);
    }
  }

  return res.json({});
}

/**
 * Retrieve card from log
 * @param log
 * @return {Promise.<*>}
 */
async function getCardFromBiLog(log) {
  let findParams = {};
  if (log.card) {
    findParams.card = log.card;
  } else {
    findParams = {
      retailer: log.retailer,
      number: log.number,
    };
    if (log.pin) {
      findParams.pin = log.pin;
    }
  }
  return await Card.findOne(findParams);
}

/**
 * Clean up BI logs with the following logic:
 *
 * First, check for any duplicates. If duplicates were found, we'd prioritise
 * the ones that have verifiedBalance set, followed by the date they were created.
 * Any duplicates that don't have responseCode will be deleted.
 * Lastly, delete any remaining logs that have no responseCode, even if they're not duplicates.
 */
export async function cleanUpBILogs(req, res) {
  try {
    await BiRequestLogs.remove({created: {$lt: new Date('2017-07-01')}});
    const dupes = await BiRequestLogs.aggregate([
      {
        $group: {
          _id: {number: "$number", retailerId: "$retailerId"},
          count: {$sum: 1},
          biRequestLogs: {$push: "$$ROOT"}
        }
      },
      {
        $match: {count: {$gt: 1}}
      },
    ]);
    let hasMultipleCards = 0;
    let hasNoCards = 0;

    for (const dupe of dupes) {
      let card;
      let logs = dupe.biRequestLogs.sort((a, b) => {
        // Sort by date
        if (a.created === b.created) {
          return 0;
        }
        return a.created < b.created ? 1 : -1;
      });

      let hasValidLog = false;
      let numValid = 0;
      // Make sure any group that requires PINs doesn't have multiple results
      for (const log of logs) {
        if (retailersNoPin[log.retailerId.toString()]) {
          break;
        }
        if (typeof log.balance === 'number' && !(log.balance === 0 && log.responseCode !== biCodes.invalid)) {
          hasValidLog = true;
          numValid++;
        }
      }
      if (hasValidLog && numValid > 1) {
        console.log('**************NUM VALID**********');
        console.log(numValid);
        console.log(logs);
      }
      // Make sure any group doesn't have multiple prefixes
      let hasPrefix = false;
      let numPrefix = 0;
      for (const log of logs) {
        if (log.prefix) {
          hasPrefix = true;
          numPrefix++;
        }
      }
      if (hasPrefix) {
        console.log('**************HAS PREFIX**********');
        console.log(numPrefix);
      }
      // Find the ones with cards attached
      const indexWithCards = [];
      for (const [index, log] of logs.entries()) {
        card = await getCardFromBiLog(log);
        if (card) {
          indexWithCards.push(index);
        }
      }
      if (!indexWithCards.length) {
        hasNoCards++;
      } else if (indexWithCards.length > 1) {
        hasMultipleCards++;
      } else {
        hasNoCards++;
      }
      // logs = logs.map(log => log.toObject());
      /**
       * Now that we know we have a steady set, find the ones to delete
       * @type {Array}
       */
      // keep logs with a balance, if only one has a balance
      logs = logs.map(log => {
        if (typeof log.balance === 'number' && log.balance > 0) {
          log.keep = true;
        }
        return log;
      });
      const numKeep = logs.filter(log => log.keep);
      if (numKeep === 1) {
        for (const log of logs) {
          if (!log.keep) {
            await BiRequestLogs.remove({_id: log._id});
            logs = logs.filter(thisLog => thisLog._id.toString() !== log._id.toString());
          }
        }
      }
      //
      if (logs.length === 1) {
        continue;
      }
      // If we still have logs, remove all but the most recent
      for (const [index, log] of logs.entries()) {
        if (index) {
          await BiRequestLogs.remove({_id: log._id});
        }
      }
    }

    return res.json({});
  }
  catch (err) {
    console.log('***************************ERR IN CLEANUPBILOGS***************************');
    console.log(err);

    await ErrorLog.create({
      method: 'cleanUpBILogs',
      controller: 'admin.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 * Sends an email
 */
export async function sendAccountingEmail(req, res) {
  const {companyId} = req.params;
  const {emailSubject, emailBody} = req.body;

  const company = await Company.findById(companyId);
  const emails = company.bookkeepingEmails.split(',');
  const recipients = [];
  emails.forEach(email => {
    if (email.trim().length) {
      recipients.push(email.trim());
    }
  });

  if (recipients.length) {
    try {
      mailer.sendAccountingEmail(recipients, emailSubject, emailBody, async err => {
        if (! err) {
          return res.json({});
        } else {
          console.log('**************************ERR IN SENDEMAILS**************************');
          console.log(err);
          console.log(err.response.body.errors);

          await ErrorLog.create({
            method: 'sendAccountingEmail',
            controller: 'admin.controller',
            revision: getGitRev(),
            stack: err.stack,
            error: err,
            user: req.user._id
          });

          return res.status(500).json({
            invalid: 'An error has occurred.'
          });
        }
      });
    } catch (err) {
      console.log('**************************ERR IN SENDEMAILS**************************');
      console.log(err);

      await ErrorLog.create({
        method: 'sendAccountingEmail',
        controller: 'admin.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    }

    return;
  }

  return res.json({});
}
