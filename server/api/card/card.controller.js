import fs from 'fs';
import csv from 'fast-csv';
import child_process from 'child_process';
import _ from 'lodash';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Card from './card.model';
import CardUpdate from '../cardUpdates/cardUpdates.model';
import DeferredInquiries from '../deferredBalanceInquiries/deferredBalanceInquiries.model';
import Inventory from '../inventory/inventory.model';
import Customer from '../customer/customer.model';
import '../company/companySettings.model';
import Company from '../company/company.model';
import ErrorLog from '../errorLog/errorLog.model';
import Receipt from '../receipt/receipt.model';
import Retailer from '../retailer/retailer.model';
import Batch from '../batch/batch.model';
import DenialPayment from '../denialPayment/denialPayment.model';
import User from '../user/user.model';
import path from 'path';
import moment from 'moment';
import config, {smpIds} from '../../config/environment';
import BiRequestLog from '../biRequestLog/biRequestLog.model';
import Callback from '../callbackLog/callback';
import {retailerSetBuyAndSellRates} from '../retailer/retailer.controller';
import {determineSellTo} from '../card/card.helpers';
import {recalculateTransactionAndReserve} from '../card/card.helpers';
import {getGitRev} from '../../helpers/errors';

// Default user name
const defaultName = '__default__';

/**
 * Test cards
 */
const testRetailerIds = ['952', '1045'];
const testNumbers = ['55555', '44444', '33333', '22222'];
const allowTest = true;

// Output BI results for testing
export const testBiMockData = [];

/**
 * Create an update record when a card is updated
 * @param userId User ID of the user making the request
 * @param biResponse Response from balance inquiry service
 * @param card Card document
 * @param balance Card balance
 * @returns {*}
 */
function createCardUpdate(userId, biResponse, card, balance) {
  // Create update record
  const update = new CardUpdate();
  update.card = card._id;
  update.user = [userId];
  const manualCodes = [config.biCodes.timeout, config.biCodes.headerError, config.biCodes.authenticationError,
                       config.biCodes.invalid, config.biCodes.retailerNotSupported, config.biCodes.retailerDisabled,
                       config.biCodes.inStoreBalanceOnly, config.biCodes.phoneBalanceOnly, config.biCodes.systemDown];
  // Retailer not supported
  if (manualCodes.indexOf(biResponse.responseCode) !== -1 || /error/i.test(biResponse)) {
    update.balanceStatus = 'manual';
    // Success
  } else if (biResponse.responseCode === config.biCodes.success) {
    update.balanceStatus = 'received';
    update.balance = balance;
    // Default to defer
  } else {
    update.balanceStatus = 'deferred';
  }
  return update.save();
}

/**
 * Update BI log
 * @param log BI log
 * @param biResponse Response from BI
 * @param balance Balance
 * @return {*}
 */
function updateBiLog(log, biResponse, balance) {
  if (typeof balance !== 'undefined') {
    log.balance = balance;
  }
  // Update unless unknown, auth error, or system problems
  if ([config.biCodes.unknownRequest, config.biCodes.headerError, config.biCodes.systemDown].indexOf(log.responseCode) === -1) {
    log.verificationType = biResponse.verificationType;
    log.responseDateTime = biResponse.responseDateTime;
    // Insert request ID
    if (typeof log.requestId === 'undefined') {
      log.requestId = biResponse.requestId;
    }
    log.responseCode = biResponse.responseCode;
    log.responseMessage = biResponse.responseMessage;
    if ([config.biCodes.success, config.biCodes.invalid, config.biCodes.retailerNotSupported, config.biCodes.inStoreBalanceOnly, config.biCodes.phoneBalanceOnly].indexOf(log.responseCode) > -1) {
      log.finalized = true;
    }
  }
  return log;
}

/**
 * Update a card during a balance inquiry
 * @param dbCard Card document
 * @param update Update document
 * @param balance Card balance
 * @param biResponse Exact response from BI
 * @returns {*}
 */
function updateCardDuringBalanceInquiry(dbCard, update, balance, biResponse) {
  if (config.debug) {
    console.log('**************UPDATE CARD DURING BALANCE INQUIRY**********');
    console.log(dbCard);
    console.log(update);
    console.log(balance);
    console.log(biResponse);
  }
  // Push update onto card
  dbCard.updates.push(update._id);
  // Update card info
  dbCard.balanceStatus = update.balanceStatus;
  // Bad card
  if (dbCard.balanceStatus === 'bad' || dbCard.balanceStatus === 'manual') {
    // Set invalid
    if (dbCard.balanceStatus === 'bad') {
      dbCard.valid = false;
    }
    return dbCard.save();
  }
  // Successful balance
  const hasBalance = typeof balance !== 'undefined';
  // For when we don't have a card
  const biSearchParams = {
    number: dbCard.number,
    retailerId: dbCard.retailer._id
  };
  if (dbCard.pin) {
    biSearchParams.pin = dbCard.pin;
  }

  // Update log if we have one
  BiRequestLog.findOne({
    $or: [{
      card: dbCard._id
    }, biSearchParams]
  })
  .then(log => {
    if (log) {
      // Update BI log
      log = updateBiLog(log, biResponse, balance);
      return log.save();
    } else {
      return false;
    }
  })
  // Create log if we don't have one
  .then(log => {
    // Create BiLog
    if (log === false) {
      const biParams = {
        number: dbCard.number,
        retailerId: dbCard.retailer._id,
        card: dbCard._id,
        responseDateTime: biResponse.response_datetime,
        requestId: biResponse.requestId,
        responseCode: biResponse.responseCode,
        responseMessage: update.balanceStatus
      };
      if (dbCard.pin) {
        biParams.pin = dbCard.pin;
      }
      if (hasBalance) {
        biParams.balance = balance;
      }
      log = new BiRequestLog(biParams);
      return log.save()
    }
  })
  // Update card and inventory
  .then(() => {
    // Have inventory, update it
    if (hasBalance && dbCard.inventory) {
      dbCard.inventory.verifiedBalance = balance;
      dbCard.inventory.save().then(() => {});
      // No inventory, set VB on card
    } else if (hasBalance) {
      dbCard.verifiedBalance = balance;
    }

    return dbCard.save();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'updateCardDuringBalanceInquiry',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    console.log('**************ERR IN updateCardDuringBalanceInquiry**********');
    console.log(e);
  });
}

/**
 * Handle BI response
 * @param resolve
 * @param reject
 * @param _id
 * @param userId
 * @param error
 * @param stdout Example: { verificationType: 'PJVT_BOT',
                            balance: 'Null',
                            response_datetime: '2017-08-17 12:06:30.343142',
                            responseMessage: 'Delayed Verification Required',
                            requestId: '2085642553683708326',
                            responseCode: '010',
                            request_id: '2085642553683708326',
                            responseDateTime: '2017-08-17 12:06:30.343142',
                            recheck: 'True',
                            recheckDateTime: '2017-08-17 13:06:31.230734' }
 * @param stderr
 * @return {*}
 */
function handleBiResponse(resolve, reject, _id, userId, error, stdout, stderr) {
  console.log('**************HANDLE BI RES**********');
  console.log(arguments);
  console.log(stdout);
  console.log(stderr);
  let biResponse;
  if (config.debug) {
    console.log('**************BI STDOUT**********');
    console.log(stdout);
  }
  if (stderr) {
    // No card
    if (_id === null) {
      return resolve({response: 'Unable to retrieve balance'});
    }
    return reject(stderr);
  }

  try {
    // BI response output
    biResponse = JSON.parse(stdout);
  } catch (err) {
    if (err.constructor.name === 'SyntaxError') {
      return null;
    }
  }
  // Check response
  if (config.debug) {
    console.log('**************BI RESPONSE**********');
    console.log(biResponse);
  }
  // Ignore BI errors
  if (typeof biResponse === 'string') {
    return resolve(biResponse);
  }
  let success;
  // Success or failure of BI request
  if (biResponse.responseMessage) {
    success = biResponse.responseMessage === 'success';
  }
  let balance = null;
  // Parse successful response
  if (success) {
    // Balance
    balance = parseFloat(biResponse.balance);
    // Balance is null
    if (isNaN(balance)) {
      balance = null;
    }
    // No card ID, just return balance, don't update card
    if (_id === null) {
      const final = Object.assign(biResponse, {balance});
      return resolve(final);
    }
  } else {
    // No card ID, just return balance, don't update card
    if (_id === null) {
      if (typeof biResponse === 'string') {
        biResponse = {error: biResponse}
      }
      return resolve(biResponse);
    }
  }
  // Existing card
  let dbCard = {};
  // Find card
  return Card.findById(_id)
  .populate('retailer')
  .populate('inventory')
  // Update record
  .then(card => {
    dbCard = card;
    // Create update record
    return createCardUpdate(userId, biResponse, card, balance);
  })
  // Update card
  .then(update => updateCardDuringBalanceInquiry(dbCard, update, balance, biResponse))
  .then(() => {
    // Attach request ID
    if (!_.isPlainObject(dbCard)) {
      dbCard = dbCard.toObject();
      dbCard.requestId = biResponse.requestId;
    }
    resolve(dbCard);
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'handleBiResponse',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: userId
    });
    reject(err)
  });
}

/**
 * Perform the actual balance inquiry
 * @param retailerId Retailer ID
 * @param number Card number
 * @param pin Card pin
 * @param _id Card record ID
 * @param userId User ID making request
 * @param companyId Company ID
 * @param requestId Request ID for deferred checks
 */
export function balanceInquiry(retailerId, number, pin, _id, userId, companyId, requestId) {
  const helpersPath = path.resolve(__dirname, '../../../helpers');
  let exec;
  let env;
  // If vista, use vista
  const script = companyId && Array.isArray(config.vistaBiUser) &&
                 config.vistaBiUser.indexOf(companyId.toString()) > -1 ? 'balanceInquiry-vista.php' :
                 'balanceInquiry.php';
  if (config.env === 'development' || config.env === 'test') {
    env = 'development=true staging=false';
  } else if (config.isStaging === 'true') {
    env = 'development=false staging=true';
  } else {
    env = 'development=false staging=false';
  }
  if (requestId) {
    exec = `${env} php -f ${helpersPath}/${script} ${requestId}`;
  } else {
    if (pin) {
      exec = `${env} php -f ${helpersPath}/${script} ${retailerId} ${number} ${pin}`;
    } else {
      exec = `${env} php -f ${helpersPath}/${script} ${retailerId} ${number}`;
    }
  }
  // Separate out the BI response for testing purposes
  if (config.env === 'test') {
    return new Promise((resolve, reject) => {
      const handleBiResponseBound = handleBiResponse.bind(this, resolve, reject,  _id, userId);
      handleBiResponseBound(null, JSON.stringify(testBiMockData[testBiMockData.length - 1].params), null);
    });
  } else {
    console.log('**************EXEC**********');
    console.log(exec);
  }
  return new Promise((resolve, reject) => {
    const handleBiResponseBound = handleBiResponse.bind(this, resolve, reject, _id, userId);
    child_process.exec(exec, handleBiResponseBound);
  });
}

/**
 * Check a card balance
 */
export async function checkBalance(req, res) {
  let dbRetailer;
  let {retailer, number, pin = '', _id = null, requestId = null} = req.body;
  try {
    // Retailer object with BI IDs
    if (_.isPlainObject(retailer) && (retailer.gsId || retailer.aiId)) {
      const params = {$or: []};
      if (typeof retailer.gsId !== 'undefined') {
        params.$or.push({gsId: retailer.gsId});
      }
      if (typeof retailer.aiId !== 'undefined') {
        params.$or.push({aiId: retailer.aiId});
      }
      dbRetailer = await Retailer.findOne(params);
    } else if (typeof retailer === 'string') {
      dbRetailer = await Retailer.findById(retailer);
    } else {
      return res.status(400).json({err: 'Retailer not found'});
    }
    // Get log
    const log = await BiRequestLog.findOne({
      number, pin, retailer: dbRetailer._id
    });
    // BI already finished
    if (log && 'responseCode' in log && (log.responseCode === '000' || log.responseCode === '900011')) {
      const card = await Card.findOne({
        number, pin, retailer: dbRetailer
      });
      if (log.responseCode === '000' && log.balance) {
        card.verifiedBalance = log.balance;
        card.balanceStatus = 'received';
      } else if (log.responseCode === '900011') {
        card.verifiedBalance = log.balance;
        card.balanceStatus = 'received';
      }
      return await card.save();
      // No log, begin BI
    } else {
      return await balanceInquiry(dbRetailer.gsId || dbRetailer.aiId, number, pin, _id, req.user._id, req.user.company, requestId);
    }
  } catch (err) {
    await ErrorLog.create({
      method: 'handleBiResponse',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************CHECK BALANCE ERR**********');
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * Check to see if a BI ID exists for a retailer
 * @param retailer
 */
function checkBiIdExists(retailer) {
  if (!(retailer.gsId || retailer.aiId)) {
    throw 'biUnavailableThisRetailer';
  }
}

/**
 * Check to see if a retailer is available for BI
 * @param retailerId
 * @return {Promise.<null|*>}
 */
async function checkBiAvailable(retailerId) {
  const retailer = await Retailer.findById(retailerId);
  checkBiIdExists(retailer);
  return retailer;
}

/**
 * Checks a card balance
 *
 * @param {Object|String} retailer
 * @param {String} number
 * @param {String} pin
 * @param {String} cardId
 * @param {String} requestId
 * @param userId
 * @param companyId
 */
export async function checkCardBalance(retailer, number, pin, cardId, requestId, userId, companyId) {
  let retailerToUse;
  // Plain object retailer
  if (_.isPlainObject(retailer) && (retailer.gsId || retailer.aiId)) {
    checkBiIdExists(retailer);
    retailerToUse = retailer;
  } else if (retailer.constructor.name === 'model') {
    checkBiIdExists(retailer);
    retailerToUse = retailer;
  // Object ID as string or actual object ID
  } else if (typeof retailer === 'string' || retailer.constructor.name === 'ObjectID') {
    retailerToUse = await checkBiAvailable(retailer);
    checkBiIdExists(retailer);
  } else {
    throw 'biUnavailableThisRetailer';
  }

  return balanceInquiry(retailerToUse.gsId || retailerToUse.aiId, number, pin, cardId, userId, companyId, requestId);
}

/**
 * Update card balance
 */
export async function updateBalance(req, res) {
  try {
    const userid = req.user._id.toString();
    const _card = await Card.findOne({_id: req.body._id});
    if (!_card) {
      return res.status(404).json({err: 'Card does not exist'});
    }
    if (_card.user.toString() !== userid) {
      return res.status(401).json({err: 'Card does not belong to this customer'});
    }
    const card = req.body;
    await Card.findByIdAndUpdate(card._id, {
      $set: {
        balance: card.balance
      }
    });
    return res.json({});
  } catch (err) {
    await ErrorLog.create({
      method: 'updateBalance',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************ERR IN UPDATE BALANCE**********');
    console.log(err);
    return res.status(500).json(err);
  }
}

/**
 * Find cards which already exist in the DB
 * @param retailer
 * @param number
 * @param customer
 * @param pin
 */
function findCards(retailer, number, customer, pin) {
  if (retailer && number && customer) {
    return Card.findOne({
      retailer,
      number,
      customer
    });
  } else if (typeof retailer !== 'undefined' && typeof number !== 'undefined') {
    if (pin) {
      return Card.findOne({
        retailer,
        number,
        pin
      })
    } else {
      return Card.findOne({
        retailer,
        number
      })
    }
  }
}

/**
 * Create a default user if necessary
 * @param body Request body
 * @param reqUser Current user
 * @returns {Promise}
 */
function createDefaultCustomer(body, reqUser) {
  return new Promise((resolve) => {
    if (body.customer === 'default') {
      // Find default user this company
      Customer.findOne({
        company: reqUser.company,
        firstName: defaultName,
        lastName: defaultName
      })
      .then(customer => {
        // No default customer, create one
        if (!customer) {
          const customer = new Customer({
            firstName: defaultName,
            lastName: defaultName,
            stateId: defaultName,
            address1: defaultName,
            city: defaultName,
            state: defaultName,
            zip: defaultName,
            phone: defaultName,
            company: reqUser.company
          });
          customer.save()
          .then(customer => {
            resolve(customer._id);
          })
        } else {
          // Default user exists
          resolve(customer._id);
        }
      });
    } else {
      resolve(body.customer);
    }
  });
}

/**
 * Check if this is a test card
 * @param card
 * @returns {boolean}
 */
function isTestCard(card) {
  return allowTest && testRetailerIds.indexOf(card.uid) !== -1 && testNumbers.indexOf(card.number) !== -1;
}

/**
 * Input a new card
 */
export async function newCard(req, res){
  const body = req.body;
  const user = req.user;
  const store = body.store || user.store;
  let pin;
  try {
    pin = body.pin;
  } catch (e) {
    pin = null;
  }
  let dbCard, dbCustomer;
  return createDefaultCustomer(body, user)
  .then(customer => {
    dbCustomer = customer;
    // See if this card already exists
    return findCards(body.retailer, body.number, null, pin)
      .populate('retailer')
  })
  // If card exists, throw error
  .then(card => {
    if (card) {
      // Don't overwrite test card
      if (!isTestCard(card) && !card.inventory) {
        return card;
      }
      dbCard = card;
      res.status(500).json({reason: 'cardExists'});
      throw 'cardExists';
    }
  })
  .then(card => {
    if (typeof card === 'undefined') {
      card = new Card(body);
    }
    card.user = user._id;
    card.balanceStatus = 'unchecked';
    // User time when card was created
    const tzOffset = body.userTime.substr(-6);
    card.userTime = moment.utc().add(parseInt(tzOffset), 'hours').toDate();
    card.created = moment.utc().add(parseInt(tzOffset), 'hours').toDate();
    card.customer = dbCustomer;
    dbCard = card;
    // Save
    return card.save()
  })
  .then(card => {
    if (!card) {
      return false;
    }
    // Retrieve card with retailer
    return Card.findById(card._id)
      .populate({
        path: 'retailer',
        populate: {
          path: 'buyRateRelations',
          model: 'BuyRate'
        }
      })
      .populate('customer');
  })
  // Return
  .then(card => {
    if (!card) {
      return false;
    }
    dbCard = card;
    return Company.findById(user.company)
      .populate({
        path: 'settings',
        populate: {
          path: 'autoBuyRates',
          model: 'AutoBuyRate'
        }
      });
  })
    // Get card buy and sell rate
  .then(company => {
    if (!company) {
      return false;
    }
    const settings = company.settings ? company.settings : {margin: 0.03};
    // Populate merch
    let retailer = dbCard.retailer.populateMerchValues(dbCard);
    retailer = retailerSetBuyAndSellRates(retailer, settings, store, null, dbCard.balance);
    dbCard.buyRate = retailer.buyRate;
    dbCard.sellRate = retailer.sellRate;
    return dbCard.save();
  })
  .then(card => {
    if (card) {
      return res.json(card);
    }
    return res.status(500).json({error: 'Unable to create card'});
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'newCard',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************NEW CARD ERR**********');
    console.log(err);
    throw err;
  });
}

/**
 * Get existing cards
 */
export async function getExistingCards(req, res) {
  try {
    const customerId = req.params.customerId;
    const userCompany = req.user.company;
    // Make sure that the customer being queried belongs to the company that the user belongs to
    const customer = await Customer.findOne({_id: customerId, company: userCompany});
    if (!customer) {
      return res.status(401).json({err: 'Customer does not belong to this company'});
    }
    // Get cards for this customer
    const cards = await Card.find({
      customer,
      inventory: {$exists: false}
    })
    .populate('retailer')
    .sort({created: -1});
    return res.json({data: cards});
  } catch (err) {
    await ErrorLog.create({
      method: 'getExistingCards',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({err});
  }
}

/**
 * Get existing cards for receipt
 */
export function getExistingCardsReceipt(req, res) {
  let customer = req.params.customerId;
  // Find inventories for the default customer for this store
  if (customer === 'default') {

  } else {
    Inventory
    // Find cards in inventory that have not been reconciled
    .find({
      reconciliation: {$exists: false},
      customer
    })
    .sort({created: -1})
    .populate('retailer')
    .populate('card')
    .then(inventories => res.json({data: inventories}))
    .catch(async err => {
      await ErrorLog.create({
        method: 'getExistingCardsReceipt',
        controller: 'card.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });
      return res.status(500).json(err);
    });
  }
}

/**
 * Edit an existing card
 */
export async function editCard(req, res) {
  const {_id, number, pin, retailer: {retailerId}, merchandise} = req.body;
  const userid = req.user._id.toString();

  const _card = await Card.findOne({_id: _id});
  if (!_card) {
    return res.status(404).json({err: 'Card does not exist'});
  }
  if (_card.user.toString() !== userid) {
    return res.status(401).json({err: 'Card does not belong to this customer'});
  }
  let dbCard;
  // Find and update card
  await Card.findById(_id)
  .populate('retailer')
  .then(card => {
    dbCard = card;
    dbCard.number = number;
    dbCard.pin = pin;
    dbCard.merchandise = merchandise;
    return dbCard.save();
  })
  // Remove any existing deferred
  .then((card) => {
    dbCard = card;
    return DeferredInquiries.remove({card: _id});
  })
  .then(() => {
    return Company.findById(req.user.company);
  })
  .then(company => {
    return company.getSettings();
  })
  // Recalculate buy and sell rates
  .then(settings => {
    const retailer = retailerSetBuyAndSellRates(dbCard.retailer, settings, req.user.store, null, dbCard.merchandise);
    dbCard.buyRate = retailer.buyRate;
    dbCard.sellRate = retailer.sellRate;
    return dbCard.save();
  })
  // return response
  .then(() => {
    return res.json(dbCard);
  })
  // Begin balance inquiry
  .then(() => {
    return balanceInquiry(retailerId, number, pin, _id, req.user._id, req.user.company)
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'editCard',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    res.status(500).json(err);
  });
}

/**
 * Remove a card
 * @param cardId Card ID
 * @param user User making the request
 * @returns {*}
 */
async function removeCard(cardId, user) {
  const card = await Card.findById(cardId);
  // Card not found
  if (!card) {
    return 'notFound';
  }
  let cardCompany = card.company;
  if (!cardCompany) {
    const cardUser = await User.findOne(card.user[0]);
    cardCompany = cardUser.company;
  }
  // Card does not belong to the requesting user
  if (user.role === 'corporate-admin' && (cardCompany.toString() !== user.company.toString())) {
    return 'unauthorized';
  } else if (user.role === 'employee' && (card.user[0].toString() !== user._id.toString())) {
    return 'unauthorized';
  }
  // Card cannot be removed because an inventory is attached
  if (card.inventory) {
    return 'inventoryAttached';
  }
  const deferredResponse = await DeferredInquiries.remove({card: cardId});
  const cardUpdateResponse = await CardUpdate.remove({card: cardId});
  if(deferredResponse.result.ok && cardUpdateResponse.result.ok){
   return 'CardRemoved';
  }
}

/**
 * handle the response from removing a card
 * @param res
 * @param removeValue Return value from remove card
 * @return {*}
 */
function handleRemoveCardResponse(res, removeValue) {
  if (removeValue) {
    switch (removeValue) {
      case 'notFound':
        res.status(404).send('');
        return true;
      case 'unauthorized':
        res.status(401).send('');
        return true;
      case 'inventoryAttached':
        res.status(400).json({err: 'Cannot remove a card with an inventory attached'});
        return true;
      case 'CardRemoved':
        res.status(200).send('Card successfully removed');
        return true;
    }
  }
  return false;
}

/**
 * Delete a card
 */
export async function deleteCard(req, res) {
  try {
    // Remove card
    const _cardId = req.params.cardId;
    const removeValue = await removeCard(_cardId, req.user);

    // Attempt to remove card
    if (!handleRemoveCardResponse(res, removeValue)) {
      return res.status(500).json({err: 'Unable to handle card removal'});
    }
  }
   catch (err) {
    console.log('**************DELETE CARD ERR**********');
    console.log(err);
     await ErrorLog.create({
       method: 'deleteCard',
       controller: 'card.controller',
       revision: getGitRev(),
       stack: err.stack,
       error: err,
       user: req.user._id
     });
    return res.status(500).json(err);
  }
}

/**
 * Make sure we have a valid number for inventory props
 * @param input
 */
function ensureValidInventoryNumber(input) {
  if (isNaN(input)) {
    return 0;
  }
  if (typeof input !== 'number') {
    return 0;
  }
  return input;
}

/**
 * Create inventories
 * @param cards
 * @param userTime
 * @param user
 * @param companySettings
 * @param tzOffset Timezone offset
 * @param store Store override
 * @param realUserTime Calculated userTime
 * @param transaction Transaction data, if transaction
 * @param callbackUrl Callback URL for when verified balance is retrieved
 */
function createInventory(cards, userTime, user, companySettings, tzOffset, store = null, realUserTime, transaction = false, callbackUrl) {
  const inventoryPromises = [];
  _.forEach(cards, card => {
    const inventory = new Inventory();
    // Save the local time that the user created this inventory
    inventory.userTime = userTime;
    let balance = parseFloat(card.balance);
    const buyRate = parseFloat(card.buyRate);
    const buyAmount = parseFloat(card.buyAmount);
    inventory.card = card._id;
    inventory.user = user._id;
    inventory.store = store || user.store;
    inventory.company = user.company;
    inventory.balance = ensureValidInventoryNumber(balance);
    inventory.buyRate = ensureValidInventoryNumber(buyRate);
    inventory.buyAmount = ensureValidInventoryNumber(buyAmount);
    inventory.customer = card.customer;
    inventory.retailer = card.retailer._id;
    // Auto-sell
    inventory.proceedWithSale = companySettings ? companySettings.autoSell : true;
    // Margin
    inventory.margin = companySettings ? companySettings.margin : 0.03;
    // Merchandise
    inventory.merchandise = card.merchandise;
    // Transaction
    inventory.isTransaction = !!transaction;
    inventory.transaction = transaction;
    inventory.callbackUrl = callbackUrl;
    inventory.serviceFee = typeof companySettings.serviceFee === 'number' ? companySettings.serviceFee : config.serviceFee;
    // Card is already populated with merch values
    const sellTo = determineSellTo(card.retailer, inventory.balance, companySettings);
    if (sellTo) {
      // Rate at the time of purchase
      inventory.sellRateAtPurchase = sellTo.rate;
      // Timezone offset
      inventory.tzOffset = tzOffset;
      inventory.created = realUserTime;
      inventory.userTime = realUserTime;
      inventoryPromises.push(inventory.save());
    }
  });
  return Promise.all(inventoryPromises);
}

/**
 * Add inventory records to cards after inventory is created
 * @param cards
 * @param dbInventories
 */
function addInventoryToCards(cards, dbInventories) {
  const cardPromises = [];
  // Iterate cards
  cards.forEach(card => {
    // iterate inventories and find the corresponding inventory for each card
    dbInventories.forEach(dbInventory => {
      if (card._id.toString() === dbInventory.card.toString()) {
        card.inventory = dbInventory._id;
        cardPromises.push(card.save());
      }
    });
  });
  return Promise.all(cardPromises);
}

/**
 * Roll back additions to inventory
 * @param dbCards
 * @param dbInventories
 */
function rollBackInventory(dbCards, dbInventories) {
  const errorPromises = [];
  // Roll back cards
  dbCards.forEach(card => {
    delete card.inventory;
    errorPromises.push(card.save());
  });
  // Remove inventories
  dbInventories.forEach(inventory => {
    errorPromises.push(inventory.remove());
  });
  return Promise.all(errorPromises);
}

/**
 * Determine sale total for display on receipt (reducer)
 * @returns Number
 */
function determineOrderTotal(curr, next) {
  // Use buy amount explicitly set
  if (typeof next.buyAmount === 'number') {
    return curr + next.buyAmount;
  }
  const balance = parseFloat(next.balance);
  const buyRate = parseFloat(next.buyRate);
  // No balance, ain't worth it
  if (!balance || !buyRate || isNaN(balance) || isNaN(buyRate)) {
    return curr + 0;
  }
  // Use buy rate and balance
  if (next.buyRate) {
    return curr + (buyRate * balance);
  }
  // Give up on life, your hopes, your dreams
  return curr + 0;
}

/**
 * Add to inventory
 */
export async function addToInventory(req, res) {
  let dbCards = [];
  let dbInventories = [];
  try {
    const {userTime, modifiedDenials, store, transaction = null, callbackUrl = null} = req.body;
    const user = req.user;
    let {cards} = req.body;
    let rejectionTotal = 0, thisOrderPurchaseAmount = 0;
    const tzOffset = userTime.substr(-6);
    const realUserTime = moment.utc().add(parseInt(tzOffset), 'hours').toDate();
    let company;
    let noSmpCards = [];
    company = await Company.findById(user.company);
    const dbCompanySettings = await company.getSettings();
    // Set buyAmount and balance for each card
    for (const thisCard of cards) {
      const $set = {
        balance: parseFloat(thisCard.balance),
      };
      if (thisCard.buyAmount) {
        $set.buyAmount = parseFloat(thisCard.buyAmount);
      }
      const dbCard = await Card.findByIdAndUpdate(thisCard._id, {
        $set
      }).populate('retailer');
      dbCards.push(await dbCard.save());
    }
    let continueSale = true;
    // Check to make sure we can sell all cards
    dbCards.forEach(card => {
      // Assign merch values, assume default if not set
      const retailer = card.retailer.populateMerchValues(card);
      const sellTo = determineSellTo(retailer, card.balance, dbCompanySettings);
      if (!sellTo) {
        continueSale = false;
        noSmpCards.push(card);
      }
    });
    // Don't continue
    if (!continueSale) {
      return res.status(400).json({reason: 'noSmp', cards: noSmpCards});
    }
    // Remove any inventories which might exist for whatever reason
    for (const thisCard of dbCards) {
      if (thisCard.inventory) {
        await Inventory.remove({
          card: thisCard._id
        });
      }
    }
    // Get customer
    let customer = await Customer.findOne({_id: cards[0].customer});
    rejectionTotal = parseFloat(customer.rejectionTotal);
    // Only subtract a specified amount from this sale if we have modified
    thisOrderPurchaseAmount = cards.reduce(determineOrderTotal, 0);
    // If we have a pending denial amount
    if (customer && (typeof modifiedDenials === 'number' && modifiedDenials < rejectionTotal) ||
        (!isNaN(rejectionTotal) && rejectionTotal)) {
      let denialPayment;
      // This amount is still owed
      if (rejectionTotal > thisOrderPurchaseAmount || modifiedDenials) {
        // Modified denials
        const paidTowardsRejection = typeof modifiedDenials === 'number' && modifiedDenials ? modifiedDenials : thisOrderPurchaseAmount;
        customer.rejectionTotal = rejectionTotal - paidTowardsRejection;
        denialPayment = new DenialPayment({
          amount: paidTowardsRejection,
          userTime,
          customer: customer._id
        });
        // No further amount owed
      } else {
        customer.rejectionTotal = 0;
      }
      // Make sure we didn't screw up here
      customer.rejectionTotal = customer.rejectionTotal < 0 ? 0 : customer.rejectionTotal;
      if (denialPayment) {
        denialPayment = await denialPayment.save();
      }
      await Promise.all([
        customer.save(),
        denialPayment ? denialPayment.save() : null
      ]);
    }
    // Create inventories
    dbInventories = await createInventory(dbCards, userTime, req.user, dbCompanySettings, tzOffset, store, realUserTime, transaction, callbackUrl);
    // Requery updated cards
    const cardIds = [];
    for (const inventory of dbInventories) {
      cardIds.push(inventory.card);
    }
    dbCards = await Card.find({
      '_id': {$in: cardIds}
    });
    // Add inventory to cards
    await addInventoryToCards(dbCards, dbInventories);
    let receipt = new Receipt();
    // Create receipts
    dbInventories.forEach((inventory, key) => {
      if (!key) {
        receipt.customer = inventory.customer;
        receipt.userTime = realUserTime;
        receipt.user = user._id;
        receipt.store = store || req.user.store;
        receipt.company = req.user.company;
        // Amount of pending denials
        receipt.rejectionTotal = rejectionTotal;
        // Total amount of receipt
        receipt.total = thisOrderPurchaseAmount;
        // Applied towards denials
        receipt.appliedTowardsDenials = 0;
        // Grand total
        receipt.grandTotal = 0;
        // Amount remaining
        receipt.remainingDenials = 0;
        // Modified denial amount if we have one
        if (typeof modifiedDenials === 'number') {
          receipt.modifiedDenialAmount = modifiedDenials;
        }
        // Determine amount applied towards denials
        if (rejectionTotal) {
          // Apply modified amount
          if (modifiedDenials) {
            receipt.appliedTowardsDenials = modifiedDenials;
            // Apply full amount
          } else if (rejectionTotal >= thisOrderPurchaseAmount) {
            receipt.appliedTowardsDenials = thisOrderPurchaseAmount;
            // All denials paid, but receipt is higher value
          } else {
            receipt.appliedTowardsDenials = rejectionTotal;
          }
          receipt.grandTotal = thisOrderPurchaseAmount - receipt.appliedTowardsDenials;
          // No denials, all cash
        } else {
          receipt.grandTotal = thisOrderPurchaseAmount;
        }
      }
      receipt.inventories.push(inventory._id);
    });
    receipt = await receipt.save();
    // Add receipt to inventories
    for (const inventory of dbInventories) {
      inventory.receipt = receipt._id;
      await inventory.save();
    }
    return res.json(receipt);
  } catch (err) {
    await ErrorLog.create({
      method: 'addToInventory',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************ADD TO INVENTORY ERR**********');
    console.log(err);
    // Roll back inventory actions
    await rollBackInventory(dbCards, dbInventories);
    res.status(500).json(err);
  }
}

/**
 * Modify an inventory item (admin)
 */
export function modifyInventory(req, res) {
  const body = req.body;
  // Find the current inventory
  Inventory.findById(body.inventory._id)
  .then(inventory => {
    switch (body.value) {
      case 'notAddedToLiquidation':
        inventory.addedToLiquidation = false;
        inventory.soldToLiquidation = false;
        break;
      case 'addedToLiquidation':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'rateVerified':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'rateVerifiedNotAcceptable':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'soldToLiquidation':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = true;
        break;
    }
    inventory.save();
  })
  .then(inventory => res.json(inventory))
  .catch(async err => {
    await ErrorLog.create({
      method: 'modifyInventory',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************MODIFY INVENTORY ERROR**********');
    console.log(err);
    return res.status(500).json(err);
  });
}

/**
 * Update specific value on an inventory
 * @param inventory Inventory
 * @param key Key
 * @param value Value
 */
function updateInventoryValue(inventory, key, value) {
  if (typeof value !== 'undefined') {
    switch (key) {
      case 'created':
        inventory.created = new Date(value);
        inventory.userTime = new Date(value);
        break;
      // Update SMP rate and SMP paid
      case 'liquidationRate':
        value = parseFloat(value);
        value = value > 1 ? value / 100 : value;
        const balance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : inventory.balance;
        inventory.liquidationRate = value;
        inventory.liquidationSoldFor = balance * value;
        break;
      default:
        inventory[key] = value;
        inventory.card[key] = value;
    }
  }
  return inventory;
}


/**
 * Change SMP, PIN, or number for a card
 * @param req
 * @param res
 */
export function updateDetails(req, res) {
  const ids = req.body.ids;
  const {smp, activityStatus, cqAch, batch} = req.body;
  const body = req.body;
  // SMPs
  const smps = smpIds;
  Inventory.find({
    _id: {
      $in: ids
    }
  })
  .populate('card')
  .populate('batch')
  .then(async inventories => {
    for (let inventory of inventories) {
      // I have no idea why there are multiple values for liquidationSoldFor
      const mutable = ['activityStatus', 'orderNumber', 'smpAch', 'cqAch', 'liquidationSoldFor', 'liquidationSoldFor2', 'liquidationRate',
                       'customer', 'number', 'pin', 'created', 'user', 'store', 'margin', 'serviceFee', 'retailer'];
      // Update mutable values
      for (let key of mutable) {
        inventory = updateInventoryValue(inventory, key, body[key])
      }
      if (smp) {
        inventory.smp = smps[smp.toUpperCase()];
      }
      if (batch) {
        const oldBatch = inventory.batch;
        // Remove from old batch
        await oldBatch.update({
          $pull: {
            inventories: inventory._id
          }
        });
        // Add to new batch
        await Batch.update({_id: batch}, {
          $addToSet: {
            inventories: inventory._id
          }
        });
        // Update inventory batch
        inventory.batch = batch;
      }
      await inventory.card.save();
      await inventory.save();
    }
    // Send notification
    if (typeof cqAch !== 'undefined' || activityStatus === 'sentToSmp') {
      const callback = new Callback();
      ids.map(id => {
        Card.findOne({inventory: id})
        .populate('inventory')
        .then(card => {
          if (!card || !card.inventory) {
            return;
          }
          callback.sendCallback(card, card.inventory.cqAch ? 'cqPaymentInitiated' : 'cardFinalized');
        });
      });
    }
    res.json();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'updateDetails',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************ERR IN CHANGE SMP**********');
    console.log(err);
    return res.status(500).json(err);
  });
}



/**
 * Create fake cards
 */
export function createFakeCards(req, res) {
  const {count, customer} = req.body;
  let dbCustomer, dbRetailer;
  const cards = [];
  let promise;
  if (customer) {
    promise = Customer.findById(customer);
  } else {
    promise = Customer.findOne();
  }
  promise
  .then(customer => {
    dbCustomer = customer;
    return Retailer.find()
      .limit(20);
  })
  .then(retailers => {
    retailers.forEach(retailer => {
      if (retailer.sellRates.sellTo !== 'saveya') {
        dbRetailer = retailer;
      }
    });
  })
  .then(() => {
    for (let i = 0; i < count; i++) {
      cards.push(createNewFakeCard(req.user, {
        number: i,
        retailer: dbRetailer._id,
        uid: 1,
        pin: i,
        customer: dbCustomer._id,
        userTime: new Date(),
        balance: '1111'
      }));
    }
    return Promise.all(cards);
  })
  .then(cards => {
    return res.json({cards});
  })
  .catch(err => {
    console.log('**************FAKE CARD ERR**********');
    console.log(err);
    return res.status(500).json();
  });
}

/**
 * Create a fake card record
 * @param user
 * @param body
 */
function createNewFakeCard(user, body) {
  let dbCustomer, dbCard;
  return createDefaultCustomer(body, user)
  .then(customer => {
    dbCustomer = customer;
    // See if this card already exists
    return findCards(body.retailer, body.number)
    .populate('retailer')
  })
  // If card exists, throw error
  .then(async card => {
    if (card) {
      // Don't overwrite test card
      if (!isTestCard(card) && !card.inventory) {
        const removeValue = await removeCard(req.params.cardId);
        // In this case, we don't care about the response, since this is only dealing with fake cards, so errors can be ignored
        handleRemoveCardResponse(res, removeValue);
      }
      dbCard = card;
      throw Error('Card has already been added to system');
    }
  })
  .then(() => {
    const card         = new Card(body);
    card.user          = user._id;
    card.balanceStatus = 'unchecked';
    // User time when card was created
    card.userTime      = body.userTime;
    card.customer      = dbCustomer;
    // Save
    return card.save()
  })
  .then(card => {
    // Retrieve card with retailer
    return Card.findById(card._id)
    .populate({
      path    : 'retailer',
      populate: {
        path : 'buyRateRelations',
        model: 'BuyRate'
      }
    })
    .populate('customer');
  })
  // Return
  .then(card => {
    dbCard = card;
    return Company.findById(user.company)
    .populate({
      path    : 'settings',
      populate: {
        path : 'autoBuyRates',
        model: 'AutoBuyRate'
      }
    });
  })
  // Get card buy and sell rate
  .then(company => {
    const settings  = company.settings || {margin: 0.03};
    const retailer  = retailerSetBuyAndSellRates(dbCard.retailer, settings, user.store, null, dbCard.merchandise);
    dbCard.buyRate  = retailer.buyRate;
    dbCard.sellRate = retailer.sellRate;
    return dbCard.save();
  })
  .catch(err => {
    return res.status(500).json(err);
  })
}

/**
 * Upload cards
 */
export function uploadCards(req, res) {
  const file = req.files[0];
  const cards = [];
  const body = req.body;
  let dbCustomer, dbCard;
  const fileName = `${__dirname}/uploads/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const user = req.user;
  let cardCount = 0;
  const csvStream = csv()
    .on("data", function(record){
      if (cardCount === 0) {
        cardCount++;
        return;
      }
      /**
       * Fields:
       * 1) Retailer ID (either BI, GS, or GCMGR)
       * 2) Merchant name
       * 3) Card number
       * 4) Card pin
       * 5) Balance
       */
      // Create record
      const thisRecord = {
        retailerId: record[0],
        retailerName: record[1],
        number: record[2]
      };
      if (typeof record[3] !== 'undefined' && record[3]) {
        thisRecord['pin'] = record[3];
      }
      if (typeof record[4] !== 'undefined' && record[4]) {
        thisRecord['balance'] = record[4];
      }
      cards.push(thisRecord);
      cardCount++;
    })
    .on('end', () => {
      const promises = [];
      cards.forEach(thisCard => {
        promises.push(// let dbRetailer;
          new Promise(resolve => {
            // Find retailer by ID
            if (/^[0-9a-fA-F]{24}$/.test(thisCard.retailerId)) {
              return resolve(Retailer.findById(thisCard.retailerId));
            } else {
              return resolve(Retailer.findOne({
                $or: [{gsId: thisCard.retailerId}, {retailerId: thisCard.retailerId}]
              }));
            }
          })
            .then(retailer => {
              return new Promise(resolve => {
                createDefaultCustomer(body, user)
                  .then(customer => {
                    resolve({
                      retailer,
                      customer
                    });
                  })
              });
            })
            .then(data => {
              return new Promise(resolve => {
                findCards(data.retailer._id, thisCard.number).populate('retailer')
                  .then(card => {
                    // dbCustomer = data.customer;
                    resolve({
                      card,
                      customer: data.customer,
                      retailer: data.retailer
                    });
                  })
              });
            })
            .then(data => {
              if (data.card) {
                console.log('**************CARD ALREADY EXISTS DURING UPLOAD**********');
                console.log(data.card);
              } else {
                return data;
              }
            })
            .then(data => {
              if (!data) {
                return;
              }
              const newCard = new Card(thisCard);
              newCard.user = user._id;
              newCard.balanceStatus = 'unchecked';
              // User time when newCard was created
              newCard.userTime = Date.now();
              newCard.customer = data.customer;
              newCard.retailer = data.retailer._id;
              newCard.uid = data.retailer.uid;
              // Save
              return newCard.save()
            })
            .then(newCard => {
              if (!newCard) {
                return;
              }
              // Retrieve card with retailer
              return Card.findById(newCard._id)
                .populate({
                  path: 'retailer',
                  populate: {
                    path: 'buyRateRelations',
                    model: 'BuyRate'
                  }
                })
                .populate('customer');
            })
            // Return
            .then(newCard => {
              if (!newCard) {
                return;
              }
              return new Promise(resolve => {
                Company.findById(user.company)
                  .populate({
                    path: 'settings',
                    populate: {
                      path: 'autoBuyRates',
                      model: 'AutoBuyRate'
                    }
                  })
                  .then(company => {
                    resolve({
                      company,
                      card: newCard
                    });
                  });
              });
            })
            // Get card buy and sell rate
            .then(data => {
              if (!data) {
                return;
              }
              const retailer = retailerSetBuyAndSellRates(data.card.retailer, data.company.settings, user.store, null, data.card.merchandise);
              data.card.buyRate = retailer.buyRate;
              data.card.sellRate = retailer.sellRate;
              return data.card.save();
            })
            .catch(err => {
              console.log('**************UPLOAD ERR**********');
              console.log(err);
            }));
      });
      Promise.all(promises)
        .then(() => res.json());
    });

  stream.pipe(csvStream);
}

function findRetailerFix(retailerName) {
  return Retailer.findOne({
    name: new RegExp(retailerName, 'i')
  })
}

/**
 * Find card, or else create it
 * @param params DB search params
 * @param input Input from CSV
 * @param user Current user
 */
function findCardToFix(params, input, user) {
  let foundCard;
  return Card.find(params)
    .then(dbCards => {
      if (dbCards.length === 0) {
        return findRetailerFix(input.retailerName);
        // Multiple values (there are none)
      } else if (dbCards.length > 1) {
        console.log('**************FOUND MULTIPLE**********');
        console.log(params);
        console.log(input);
        return false;
      } else {
        foundCard = dbCards[0];
        return findRetailerFix(input.retailerName);
      }
    })
    .then(retailer => {
      if (!retailer) {
        return;
      }
      // Update retailer name
      if (foundCard) {
        foundCard.retailer = retailer._id;
        return foundCard.save();
      }
      const newCardValues = {
        retailer: retailer._id,
        number: input.number,
        uid: retailer.uid,
        buyRate: retailer.sellRates.best - 0.1,
        sellRate: retailer.sellRates.best - 0.03,
        user: user._id,
        customer: '575a44043c01e9134aa2a558'
      };
      if (input.pin) {
        newCardValues.pin = input.pin;
      }
      if (input.balance) {
        newCardValues.balance = input.balance;
      }
      // Create new card
      const newCard = new Card(newCardValues);
      return newCard.save();
    });
}

/**
 * Upload fixes
 */
export function uploadFixes(req, res) {
  const file = req.files[0];
  const cards = [];
  const fileName = `${__dirname}/uploads/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      /**
       * Fields:
       * 1) Retailer ID (either BI, GS, or GCMGR)
       * 2) Merchant name
       * 3) Card number
       * 4) Card pin
       * 5) Balance
       */
        // Create record
      const thisRecord = {
          retailerName: record[1],
          number: record[2]
        };
      if (typeof record[3] !== 'undefined' && record[3]) {
        thisRecord['pin'] = record[3];
      }
      if (typeof record[4] !== 'undefined' && record[4]) {
        thisRecord.balance = record[4].replace(/[^\d.]/g, '');
      }
      cards.push(thisRecord);
    })
    .on('end', () => {
      const promises = [];
      // Run cards
      cards.forEach(card => {
        // Find card
        const cardParams = {
          number: new RegExp(card.number, 'i'),
        };
        if (card.pin) {
          cardParams.pin = new RegExp(card.pin, 'i');
        }
        if (card.balance) {
          cardParams.balance = card.balance;
        }
        promises.push(findCardToFix(cardParams, card, req.user));
      });
      Promise.all(promises)
        .then(() => res.json());
    });

  stream.pipe(csvStream);
}

/**
 * Run BI
 */
export function runBi(req, res) {
  const cards = req.body.cards;
  const dbCards = [];
  cards.forEach(card => {
    dbCards.push(Card.findById(card)
      .populate('retailer'));
  });
  Promise.all(dbCards)
    .then(foundCards => {
      let currentCard = 0;
      const thisInt = setInterval(() => {
        const dbCard = foundCards[currentCard];
        currentCard++;
        if (!dbCard) {
          clearInterval(thisInt);
          return res.json();
        }
        let retailer;
        if (dbCard.retailer.gsId) {
          retailer = dbCard.retailer.gsId;
        }
        if (retailer) {
          balanceInquiry(retailer, dbCard.number, dbCard.pin, dbCard._id, req.user._id, req.user.company);
        }
      }, 500);
    });
}

/**
 * Move cards over to Upload Sales for sale
 */
export function moveForSale(req, res) {
  let dbCustomer;
  Customer.findById('5764baef5f244aff7abe6160')
  .then(customer => {
    if (!customer) {
      throw 'noCustomer';
    }
    dbCustomer = customer;
    return Card.find({
      balance: {$exists: true},
      customer: req.body.customerId
    })
    .populate('retailer');
  })
  .then(cards => {
    const cardPromises = [];
    cards.forEach(card => {
      let sellRate, buyRate;
      try {
        if (card.sellRate) {
          sellRate = card.sellRate;
        } else {
          sellRate = card.retailer.sellRates.best - 0.03;
        }
        if (card.buyRate) {
          buyRate = card.buyRate;
        } else {
          buyRate = card.retailer.sellRates.best - 0.1;
        }
      } catch (e) {
        throw 'noSellRate';
      }
      cardPromises.push(card.update({
        sellRate,
        buyRate,
        customer: dbCustomer._id
      }));
    });
    return Promise.all(cardPromises);
  })
  .then(() => {
    return res.json();
  })
  .catch(err => {
    console.log('**************ERR**********');
    console.log(err);
    if (err === 'noCustomer') {
      return res.status(500).json({customer: false});
    }
    if (err === 'noSellRate') {
      return res.status(500).json({sellRate: false});
    }
  });
}

/**
 * Perform balance update for a single card
 * @param cardId
 * @param balance
 * @param userRole
 */
function updateInventoryBalance(cardId, balance) {
  return Inventory.findById(cardId)
    .populate('card')
    .then(inventory => {
      inventory.balance = balance;
      return inventory.save();
    })
    .then(inventory => {
      return Card.update({
        _id: inventory.card._id
      }, {
        $set: {
          balance
        }
      });
    });
}

/**
 * Edit card balance (admin)
 */
export function editBalance(req, res) {
  const {cardId, balance, ids} = req.body;
  if (cardId) {
    return updateInventoryBalance(cardId._id, balance, req.user.role)
    .then(() => res.json())
    .catch(async err => {
      await ErrorLog.create({
        method: 'editBalance',
        controller: 'card.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });
    });
  } else if (ids) {
    const promises = [];
    ids.forEach(id => {
      promises.push(updateInventoryBalance(id, balance, req.user.role));
    });
    Promise.all(promises)
    .then(() => res.json())
    .catch(async err => {
      await ErrorLog.create({
        method: 'editBalance',
        controller: 'card.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });
    });
  }
}

/**
 * Get inventory fr
 * @param cardId
 * @return {Promise.<void>}
 */
async function getInventoryFromCard(cardId) {
  return Card.findById(cardId).populate('inventory');
}

/**
 * Set inventory ship status
 */
export async function setCardValue(req, res) {
  const {status, type, transaction, cardId} = req.body;
  let inventoryId = req.body.inventoryId;
  const {companyId} = req.params;
  // Staging testing
  if (config.isStaging) {
    const card = await getInventoryFromCard(cardId);
    if (card) {
      try {
        inventoryId = card.inventory._id.toString();
      } catch (e) {
        console.log('**************IGNORE**********');
      }
    }
  }
  return new Promise((resolve, reject) => {
    // Corporate
    if (companyId) {
      Inventory.findById(inventoryId)
        .populate('company')
        .then(inventory => {
          if (inventory.company._id.toString() !== companyId) {
            return reject();
          }
          // Modify transaction
          if (transaction) {
            inventory.transaction[type] = status;
          } else {
            inventory[type] = status;
          }
          resolve(inventory.save());
        });
    // Admin
    } else {
      let promises = [];
      Promise.all(promises)
      .then(() => {
        Inventory.findById(inventoryId)
        .then(inventory => {
          inventory[type] = status;
          resolve(inventory.save());
        });
      });
    }
  })
    .then(() => {
      if (type === 'activityStatus' && status === 'sentToSmp') {
        Card.findOne({inventory: inventoryId})
        .populate('inventory')
        .then(card => {
          if (card) {
            (new Callback()).sendCallback(card, 'cardFinalized');
          }
        });
      }

      res.json();
    })
    .catch(async err => {
      await ErrorLog.create({
        method: 'setCardValue',
        controller: 'card.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });
      console.log('**************UNABLE TO SET SHIP STATUS**********');
      console.log(err);
      return res.status(500).json(err);
    });
}

/**
 * Mass update inventories
 */
export function massUpdate(req, res) {
  const {ids, values} = req.body;
  const {companyId} = req.params;
  const updateParams = {
    '_id': {$in: ids}
  };
  if (companyId) {
    updateParams.company = companyId;
  }
  Inventory.update(updateParams, {
    $set: values
  }, {multi: true})
    .then(inventories => res.json(inventories))
    .catch(async err => {
      await ErrorLog.create({
        method: 'massUpdate',
        controller: 'card.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });
      console.log('**************ERR IN MASS UPDATE**********');
      console.log(err);
      return res.status(err).json(err);
    });
}

/**
 * Handle rejection of inventory
 * @param inventory Inventory record
 * @param customerUpdates Customer updates to make
 * @return {Promise.<*>}
 */
async function handleInventoryReject(inventory, customerUpdates) {
  const customerId = inventory.customer._id;
  if (!customerUpdates[customerId]) {
    customerUpdates[customerId] = {
      credits: Array.isArray(inventory.customer.credits) ? inventory.customer.credits : [],
      rejections: Array.isArray(inventory.customer.rejections) ? inventory.customer.rejections : [],
      amount: typeof inventory.customer.rejectionTotal === 'number' ? inventory.customer.rejectionTotal : 0
    };
  }
  // Set rejection amount based on difference between paid and what should have been paid
  if (inventory.verifiedBalance !== 'undefined') {
    // Original buy amount
    let buyAmount = inventory.buyAmount;
    // Assume 10% for API, which has a bug until recently which didn't set buyAmount
    if (!buyAmount) {
      buyAmount = inventory.balance * 0.9;
    }
    let buyRate = inventory.buyRate > 1 ? inventory.buyRate / 100 : inventory.buyRate;

    if (inventory.isApi) {
      buyRate = inventory.card.sellRate - 0.1;
    }

    // Buy amount after adjustment
    const realBuyAmount = buyRate * inventory.verifiedBalance;

    if (realBuyAmount !== buyAmount) {
      // Reset amount of previous rejection
      if (inventory.rejected && inventory.rejectAmount) {
        customerUpdates[customerId].amount = customerUpdates[customerId].amount - inventory.rejectAmount;
      }

      // Reset amount of previous credit
      if (inventory.credited && inventory.creditAmount) {
        customerUpdates[customerId].amount = customerUpdates[customerId].amount + inventory.creditAmount;
      }

      const deltaAmount = buyAmount - realBuyAmount;
      customerUpdates[customerId].amount += deltaAmount;

      if (deltaAmount > 0) {
        // Add to rejection list
        if (customerUpdates[customerId].rejections.indexOf(inventory._id) === -1) {
          customerUpdates[customerId].rejections.push(inventory._id);
        }

        // Remove from credit list
        if (customerUpdates[customerId].credits.indexOf(inventory._id) !== -1) {
          customerUpdates[customerId].credits.splice(
            customerUpdates[customerId].credits.indexOf(inventory._id),
            1
          );
        }
      } else {
        // Add to credit list
        if (customerUpdates[customerId].credits.indexOf(inventory._id) === -1) {
          customerUpdates[customerId].credits.push(inventory._id);
        }

        // Remove from rejection list
        if (customerUpdates[customerId].rejections.indexOf(inventory._id) !== -1) {
          customerUpdates[customerId].rejections.splice(
            customerUpdates[customerId].rejections.indexOf(inventory._id),
            1
          );
        }
      }

      inventory.rejected = deltaAmount > 0;
      inventory.rejectedDate = inventory.rejected ? Date.now() : null;
      inventory.rejectAmount = inventory.rejected ? deltaAmount : null;
      inventory.credited = deltaAmount < 0;
      inventory.creditedDate = inventory.credited ? Date.now() : null;
      inventory.creditAmount = inventory.credited ? Math.abs(deltaAmount) : null;
      return await inventory.save();
    }
  }
  Promise.resolve(false);
}

/**
 * Reject selected inventories
 */
export async function rejectCards(req, res) {
  const {inventories: ids} = req.body;
  const customerUpdates = {};
  Inventory.find({
    _id: {
      $in: ids
    }
  })
  .populate('customer')
  .populate('card')
  .populate('retailer')
  .then(async inventories => {
    let inventoriesFinal = [];
    // Handle reject on each inventory
    for (let inventory of inventories) {
      inventory = await handleInventoryReject(inventory, customerUpdates);
      if (inventory === false) {
        res.status(400).json({err: 'Unable to find inventory to reject'});
      } else {
        inventoriesFinal.push(inventory);
      }
    }
    // Send callbacks for credit/rejection
    for (let inventory of inventories) {
      if (inventory.card && inventory.isTransaction) {
        await recalculateTransactionAndReserve(inventory);
      }
    }
    const promises = [];
    _.forEach(customerUpdates, (update, id) => {
      promises.push(Customer.update({
        _id: id
      }, {
        $set: {
          rejectionTotal: update.amount,
          rejections: update.rejections,
          credits: update.credits
        }
      }).then(() => ({})));
    });
  })
  .then(() => {
    res.json();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'rejectCards',
      controller: 'card.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    console.log('**************ERR ADDING REJECTIONS**********');
    console.log(err);
    return res.status(500).json({});
  });
}

/**
 * Resell cards which have not already been sent to an SMP to determine new best rates
 */
export function resellCards(req, res) {
  const {inventories} = req.body;
  // Find inventories not sent to SMP, and without a transaction ID
  Inventory.find({
    _id: {$in: inventories}
  })
  .populate('card')
  .then(inventories => {
    const promises = [];
    inventories.forEach(inventory => {
      // Don't resell already sold cards
      if (inventory.smp !== '1' && inventory.smp !== 'saveya' &&
          ['sentToSmp', 'receivedSmp', 'rejected'].indexOf(inventory.activityStatus) === -1 && inventory.card) {
        inventory.soldToLiquidation = false;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  })
  .then(() => res.json())
  .catch(err => {
    console.log('**************ERR IN RESELL CARDS**********');
    console.log(err);
    return res.status(500).json();
  });
}
