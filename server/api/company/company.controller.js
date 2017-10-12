'use strict';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../inventory/liquidationError.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Company from './company.model';
import CompanySettings from './companySettings.model';
import Settings from './companySettings.model';
import Customer from '../customer/customer.model';
import User from '../user/user.model';
import Inventory from '../inventory/inventory.model';
const Retailer = require('../retailer/retailer.model');
const Store = require('../stores/store.model');
const BuyRate = require('../buyRate/buyRate.model');
const Reconciliation = require('../reconciliation/reconciliation');
const Card = require('../card/card.model');
const CardUpdate = require('../cardUpdates/cardUpdates.model');
const DeferredBalanceInquiry = require('../deferredBalanceInquiries/deferredBalanceInquiries.model');
import DenialPayments from '../denialPayment/denialPayment.model';
import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';
import {smpNames, serverApiUrl, serviceFee} from '../../config/environment';
import {isEmail} from '../../helpers/validation';
import _ from 'lodash';
import moment from 'moment';
const passport = require('passport');
import Batch from '../batch/batch.model';
import Receipt from '../receipt/receipt.model';
import InventoryParamCache from '../inventory/inventoryParamCache.model';
import mongoose from 'mongoose';
const isValidObjectId = mongoose.Types.ObjectId.isValid;
import CsvWriter from 'csv-write-stream';
import environment from '../../config/environment';
import fs from 'fs';

import ReceiptService from '../receipt/receipt.service';

/**
 * General error response
 */
const generalError = (res, err) => {
  let errStr = JSON.stringify(err);
  errStr = errStr.replace(/hashedPassword/g, 'password');
  err = JSON.parse(errStr);
  return res.status(400).json(err);
};

/**
 * Get all supplier companies
 */
exports.getAll = (req, res) => {
  Company.find({})
  .then((companies) => {
    return res.json(companies);
  })
  .catch((err) => {
    console.log('**************ERR IN GET ALL SUPPLIER COMPANIES**********');
    console.log(err);
    return res.status(500).json(err);
  });
};

/**
 * Search for companies
 * restriction: 'admin'
 */
exports.search = function(req, res) {
  Company
    .find({name: new RegExp(req.body.$query)})
    .populate('users')
    .then((err, companies) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json({companies});
    })
    .catch(async (err) => {
      console.log('**************ERR IN COMPANY SEARCH**********');
      console.log(err);

      await ErrorLog.create({
        method: 'search',
        controller: 'company.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return res.status(500).json(err);
    });
};

/**
 * Allow/disallow API access
 */
exports.setApiAccess = (req, res) => {
  const id = req.params.companyId;
  const api = req.params.api;
  Company.findById(id, async (err, company) => {
    const access = !company.apis[api];
    // No company
    if (!company) {
      return res.status(500).json({
        error: 'company not found'
      });
    }
    // Error
    if (err) {

      await ErrorLog.create({
        method: 'setApiAccess',
        controller: 'company.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return res.json(err);
    }
    company.apis[api] = access;
    company.save((err) => {
      if (err) {
        return validationError(res, err);
      }
      return res.status(200).json({
        access
      });
    });
  });
};

/**
 * Create a new supplier company
 */
export function create(req, res) {
  const {powerSeller = false} = req.body;
  const company = new Company(req.body);
  let savedCompany, savedUser;
  company.save()
    // Create user
  .then(company => {
    savedCompany = company;
    // Successful save, create user
    let user = new User(req.body.contact);
    user.company = company._id;
    user.role = 'corporate-admin';
    return user.save();
  })
    // Add user to company users
  .then(user => {
    savedUser = user;
    company.users.push(user._id);
    return company.save();
  })
    // Add company ID to user
  .then((company) => {
    savedUser.company = company._id;
    return savedUser.save()
  })
  .then(() => {
    if (powerSeller) {
      const store = new Store({
        name: 'default',
        companyId: savedCompany._id,
        users: [savedUser._id]
      });
      return store.save();
    }
  })
  .then(store => {
    if (store) {
      savedCompany.stores = [store._id];
      return savedCompany.save();
    }
  })
  .then(() => {
    return res.status(200).send();
  })
  .catch(async err => {
    console.log('**************ERR IN CREATE NEW SUPPLIER COMPANY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'create',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    // Remove anything written on error
    if (savedCompany) {
      savedCompany.remove();
    }
    if (savedUser) {
      savedUser.remove();
    }
    return generalError(res, err);
  });
};

/**
 * Get company
 */
exports.getCompany = (req, res) => {
  const user = req.user;
  const companyId = req.params.companyId;
  let company;
  // Check to make sure we're retrieving the right company
  if (user.company && user.company.toString() !== companyId) {
    return res.status(401).json({
      message: 'unauthorized'
    });
  }
  // Retrieve company settings
  Company.findById(req.params.companyId)
  .then((dbCompany) => {
    if (!dbCompany) {
      throw Error('Could not find company');
    }
    company = dbCompany;
    return company.getSettings();
  })
  .then(settings => {
    company = company.toObject();
    company.settings = settings;
    return res.json(company);
  })
  .catch(async (err) => {
    console.log('**************ERR IN GET COMPANY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getCompany',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json(err);
  });
};

/**
 * Admin route to update a company
 * @param req
 * @param res
 */
export async function updateProfile(req, res) {
  try {
    const body = req.body;
    const companyId = req.params.companyId;
    const editable = ['name', 'address1', 'address2', 'city', 'state', 'zip', 'margin', 'apis', 'autoSell',
                      'useAlternateGCMGR', 'serviceFee', 'bookkeepingEmails'];
    // let newMargin, company, settings;
    const company = await Company.findById(companyId);
    const settings = await company.getSettingsObject();
    _.forEach(body, (prop, key) => {
      // Don't edit non-editable items
      if (editable.indexOf(key) !== -1) {
        switch (key) {
          // Default to environment margin
          case 'margin':
            settings.margin = prop === '' ? environment.margin : parseFloat(prop);
            break;
          case 'useAlternateGCMGR':
            settings.useAlternateGCMGR = prop;
            break;
          // Default to environment service fee
          case 'serviceFee':
            settings.serviceFee = prop === '' ? environment.serviceFee : parseFloat(prop);
            break;
          // Make sure there's no spaces in the booking emails list
          case 'bookkeepingEmails':
            prop = prop.replace(/\s/g, '');
            const emails = prop.split(',');
            let isValid = true;
            emails.forEach(email => {
              if (!isEmail(email)) {
                isValid = false;
              }
            });
            if (!isValid) {
              throw 'invalidBookkeepingEmails';
            }
            company[key] = prop;
            break;
          default:
            company[key] = prop;
        }
      }
    });
    await company.save();
    await settings.save();
    const companyFinal = await Company.findById(companyId).populate('settings');
    return res.json(companyFinal);
  } catch (err) {
    console.log('**************UPDATE PROFILE ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateProfile',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err)
  }
}

/**
 * Handle minimum adjusted denial settings
 * @param settings
 * @param setting
 */
function setMinimumAdjustedDenial(settings, setting) {
  if (setting === true) {
    // Default to 0.1
    settings[key] = 0.1;
  } else if (setting === false) {
    settings[key] = 0;
  } else {
    const value = parseFloat(setting);
    settings[key] = !isNaN(value) ? value : settings[key];
  }
}

/**
 * Update a company's settings
 */
export async function updateSettings(req, res) {
  const body = req.body;
  const companyId = req.params.companyId;
  const user = req.user;
  const publicSettings = ['managersSetBuyRates', 'autoSetBuyRates', 'autoBuyRates', 'employeesCanSeeSellRates',
                          'autoSell', 'minimumAdjustedDenialAmount', 'customerDataRequired', 'cardType', 'timezone'];
  // Basic auth check
  if (user.company.toString() !== companyId) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  try {
    // Get company and settings
    const company = await Company.findById(companyId);
    const settings = await company.getSettings(false);
    _.forEach(body, (setting, key) => {
      if (publicSettings.indexOf(key) !== -1) {
        // Minimum adjusted denial amount
        if (key === 'minimumAdjustedDenialAmount') {
          setMinimumAdjustedDenial(settings, setting);
        } else {
          settings[key] = setting;
        }
      }
    });
    // Retrieve updated company and settings
    await settings.save();
    const companyWithSettings = await Company.findById(companyId)
      .populate({
        path: 'settings',
        populate: {
          path: 'autoBuyRates',
          model: 'AutoBuyRate'
        }
      });

    return res.json({company: companyWithSettings});
  }
  catch (err) {

    await ErrorLog.create({
      method: 'updateSettings',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Update auto-buy rates
 */
export function updateAutoBuyRates(req, res) {
  const companyId = req.params.companyId;
  const body = req.body;
  const user = req.user;
  // Auth
  if (user.company.toString() !== companyId) {
    return res.status(401).json();
  }
  Settings.findOne({company: companyId})
  .then(settings => {
    return settings.getAutoBuyRates();
  })
  .then(rates => {
    _.forEach(body, (rate, key) => {
      // Rate
      if (/_\d{2}/.test(key)) {
        rates[key] = rate / 100;
      }
    });
    return rates.save();
  })
  .then(() => {
    return Company.findById(companyId)
      .populate({
        path: 'settings',
        populate: {
          path: 'autoBuyRates',
          model: 'AutoBuyRate'
        }
      })
  })
  .then(company => res.json(company))
  .catch(async err => {
    console.log('**************ERR IN UPDATE RATES**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateSettings',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  })
}

/**
 * Perform a manager override credentials
 * @param req
 * @param res
 */
export function managerOverride(req, res) {
  const companyId = req.params.companyId;
  passport.authenticate('local', function (err, user) {
    if (err) {
      return res.status(401).json(err);
    }
    if (!user) {
      return res.status(401).json({message: 'Incorrect credentials'});
    }
    if (user.role === 'admin') {
      return res.json({
        admin: true
      });
    }
    // Check we're on the right company
    if (user.company.toString() === companyId && ['corporate-admin', 'manager', 'admin'].indexOf(user.role) !== -1) {
      return res.json();
    }
    return res.status(401).json();
  })(req, res)
}

/**
 * Create a new store
 *
 * @todo This is a copy of the company creation method above. .bind the above function to avoid this code replication
 */
exports.newStore = (req, res) => {
  const body       = req.body;
  let savedCompany = null;
  let savedUser    = null;
  let savedStore   = null;
  let store        = null;
  body.companyId = req.user.company;
  store            = new Store(body);
  return store.save()
  // Create user
  .then((store) => {
    savedStore = store;
    // Successful save, create user
    let user   = new User(body.contact);
    user.store = store._id;
    user.role  = 'employee';
    return user.save();
  })
  // Add user to store users
  .then((user) => {
    savedUser = user;
    store.users.push(user._id);
    return store.save();
  })
  // Add store ID to user
  .then((store) => {
    savedUser.store   = store._id;
    savedUser.company = store.companyId;
    return savedUser.save()
  })
  // Get company
  .then(() => {
    return Company.findById(store.companyId);
  })
  // Add user and store to company
  .then((company) => {
    savedCompany = company;
    // Add store to company
    company.stores.push(savedStore._id);
    // Add user to company
    company.users.push(savedUser._id);
    return company.save();
  })
  .then(() => {
    return res.status(200).send({_id : savedStore._id});
  })
  // Remove anything written on error
  .catch(async err => {

    await ErrorLog.create({
      method: 'newStore',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    const storeIndex = savedCompany ? savedCompany.stores.indexOf(savedStore._id) : -1;
    const userIndex  = savedCompany ? savedCompany.users.indexOf(savedUser._id) : -1;
    // Remove store
    if (savedStore) {
      savedStore.remove();
    }
    // Remove user
    if (savedUser) {
      savedUser.remove();
    }
    if (savedCompany) {
      // Remove store
      if (storeIndex !== -1) {
        savedCompany.stores.splice(storeIndex, 1);
      }
      // Remove user
      if (userIndex !== -1) {
        savedCompany.users.splice(userIndex, 1);
      }
      savedCompany.save();
    }
    console.log('**************ERR IN NEW STORE**********');
    console.log(err);
    return generalError(res, err);
  });
};

/**
 * Retrieve stores for a company
 */
exports.getStores = (req, res) => {
  const companyId = req.params.companyId;
  // Retrieve stores
  Store.find({companyId})
  .populate('users')
  .then((stores) => res.json(stores))
  .catch(async (err) => {
    console.log('**************ERR IN GET STORES**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getStores',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json(err);
  });
};

/**
 * Get store details
 */
exports.getStoreDetails = (req, res) => {
  Store.findOne({_id: req.params.storeId, companyId: req.user.company})
  .populate('users')
  .then((store) => {
    return res.json(store);
  })
  .catch(async (err) => {
    console.log('**************ERR IN GET STORE DETAILS**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getStoreDetails',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json(err);
  });
};

/**
 * Update a store
 */
exports.updateStore = (req, res) => {
  const details = req.body;
  Store.findById(details.storeId)
  .then((store) => {
    Object.assign(store, details);
    return store.save();
  })
  .then((store) => {
    return res.json(store);
  })
  .catch(async (err) => {
    console.log('**************ERR IN UPDATE STORE**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateStore',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json(err);
  });
};

/**
 * Create a new employee
 */
exports.newEmployee = (req, res) => {
  const body = req.body;
  let user = new User(body);
  let savedUser, savedStore;
  const {companyId, storeId} = req.body;
  const currentUser = req.user;
  // Check for permissions
  if (currentUser.role === 'manager' && storeId !== currentUser.store.toString()) {
    return res.status(401).json();
  }
  if (currentUser.role === 'corporate-admin' && companyId !== currentUser.company.toString()) {
    return res.status(401).json();
  }

  user.company = companyId;
  user.store = storeId;
  user.save()
    // Create user
  .then(newUser => {
    savedUser = newUser;
    return Store.findById(savedUser.store);
  })
    // Add user to store
  .then((store) => {
    savedStore = store;
    store.users.push(savedUser._id);
    return store.save();
  })
  // Success
  .then(() => {
    return res.json(savedUser)
  })
  .catch(async (err) => {

    await ErrorLog.create({
      method: 'newEmployee',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    if (savedUser) {
      savedUser.remove();
    }
    if (savedStore) {
      savedStore.remove();
    }
    console.log('**************ERR IN NEW EMPLOYEE**********');
    console.log(err);
    return res.status(400).json(err);
  });
};

/**
 * Pull values on delete store
 * @param companyId
 * @param storeId
 * @param users
 */
function cleanupOnStoreDelete(companyId, storeId, users) {
  return Company.update({
    _id: companyId
  }, {
    $pull: {
      stores: storeId,
      users: {$in: users}
    }
  })
}

/**
 * Delete a store
 */
exports.deleteStore = (req, res) => {
  const {storeId} = req.params;
  const companyId = req.user.company;
  let userPromises = [];
  const storeUsers = [];
  let savedStore;
  // Find store
  Store.findOne({_id: storeId, companyId})
  .populate('users')
  .then((store) => {
    if (!store) {
      res.status(404).json({err: 'Store not found'});
      throw 'notFound';
    }
    // Keep reference to store
    savedStore = store;
    // Remove all users
    store.users.forEach((user) => {
      storeUsers.push(user._id);
      userPromises.push(user.remove());
    });
    // Once users are gone, remove store
    return Promise.all(userPromises);
  })
  // Remove store and users from company
  .then(() => cleanupOnStoreDelete(companyId, storeId, storeUsers))
  .then(() => {
    // Remove store
    return savedStore.remove();
  })
  .then(() => {
    // success
    return res.json();
  })
  .catch(async (err) => {

    await ErrorLog.create({
      method: 'deleteStore',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    if (err === 'notFound') {
      return;
    }
    console.log('**************ERR IN DELETE STORE**********');
    console.log(err);
    return res.status(500).json(err);
  });
};

/**
 * Delete an employee from a store
 */
exports.deleteEmployee = (req, res) => {
  const params = req.params;
  const currentUser = req.user;
  // Find employee
  User.findById(params.employeeId)
    // Remove employee
  .then((employee) => {
    if (currentUser.role === 'corporate-admin' && currentUser.company.toString() !== employee.company.toString()) {
      throw 'permissions';
    }
    if (currentUser.role === 'manager' && currentUser.store.toString() !== employee.store.toString()) {
      throw 'permissions';
    }
    return employee.remove();
  })
    // Get store
  .then(() => {
    return Store.findById(params.storeId);
  })
    // Remove employee from store
  .then((store) => {
    store.users.splice(store.users.indexOf(params.employeeId), 1);
    store.save();
  })
  .then(() => {
    return res.json();
  })
  .catch(async (err) => {

    await ErrorLog.create({
      method: 'deleteEmployee',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    if (err === 'permissions') {
      return res.status(401).json();
    } else {
      console.log('**************ERR IN DELETE EMPLOYEE**********');
      console.log(err);
      return res.status(500).json(err);
    }
  });
};

/**
 * Update a company
 */
exports.updateCompany = (req, res) => {
  const companyId = req.params.companyId;
  const body = req.body;
  // Find company
  Company.findById(companyId)
  .then((company) => {
    // Update
    Object.assign(company, body);
    return company.save();
  })
    // Success
  .then((company) => {
    return res.json(company);
  })
    // Failure
  .catch(async (err) => {
    console.log('**************ERR IN UPDATE COMPANY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateCompany',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json(err);
  });
};

/**
 * Get store with buy rates
 */
exports.getStoreWithBuyRates = (req, res) => {
  const id = req.params.storeId;
  Store.findById(id)
  .populate('buyRateRelations')
  .then(store => {
    return res.json(store);
  })
  .catch(async err => {
    console.log('**************ERR IN GET STORE WITH BUY RATES**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getStoreWithBuyRates',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  })
};

/**
 * Update store buy rates for a specific retailer
 */
exports.updateStoreBuyRates = (req, res) => {
  const {retailerId, storeId} = req.params;
  // Get percentage buy rates
  const buyRate = parseFloat(req.body.buyRate) / 100;
  let storeRecord, retailerRecord, existingBuyRateId, buyRateId;
  // Look for existing buy rate relationship
  BuyRate.findOne({retailerId, storeId})
  .then(buyRateRecord => {
    // No buy rate set
    if (!buyRateRecord) {
      buyRateRecord = new BuyRate({storeId, retailerId, buyRate});
      return buyRateRecord.save();
    }
    existingBuyRateId = buyRateRecord._id;
    // Update existing buy rate
    return BuyRate.update({_id: buyRateRecord._id}, {$set: {buyRate: buyRate}});
  })
    // Get buy rate id, and then store
  .then(buyRate => {
    buyRateId = buyRate._id || existingBuyRateId;
    return Store.findById(storeId);
  })
    // Store buy rate ID on store
  .then(store => {
    storeRecord = store;
    // Add relationship if necessary
    if (!Array.isArray(store.buyRateRelations)) {
      store.buyRateRelations = [];
      store.buyRateRelations.push(buyRateId);
      return store.save();
    }
    // Relationships exist, but not this one
    if (store.buyRateRelations.indexOf(buyRateId) === -1) {
      store.buyRateRelations.push(buyRateId);
      return store.save();
    }
  })
    // Get retailer
  .then(() => {
    return Retailer.findById(retailerId)
  })
    // Store buy rate ID on retailer
  .then(retailer => {
    retailerRecord = retailer;
    // Add relationship if necessary
    if (!Array.isArray(retailer.buyRateRelations)) {
      retailer.buyRateRelations = [];
      retailer.buyRateRelations.push(buyRateId);
      return retailer.save();
    }
    // Relationships exist, but not this one
    if (!Array.isArray(retailer.buyRateRelations) || retailer.buyRateRelations.indexOf(buyRateId) === -1) {
      retailer.buyRateRelations.push(buyRateId);
      return retailer.save();
    }
  })
    // Return buy rate
  .then(() => {
    return res.json(buyRate);
  })
  .catch(async err => {
    console.log('**************UPDATE STORE BUY RATES ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateStoreBuyRates',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    res.status(500).json(err);
  });
};

/**
 * Get cards in inventory
 * @param req
 * @param res
 */
export function getCardsInInventory(req, res) {
  const params = req.params;
  const findParams = {
    company: params.companyId,
    reconciliation: {$exists: false}
  };
  // Search for inventories for this store
  if (params.storeId && isValidObjectId(params.storeId)) {
    findParams.store = params.storeId;
  }

  let companySettings;

  // Can't use Company.findById and Inventory.find with Promise.all because
  // we want to call company.getSettings()
  Company.findById(params.companyId)
  .then(company => {
    if (company) {
      return company.getSettings();
    }

    throw 'companyNotFound';
  })
  .then(settings => {
    companySettings = settings;

    return Inventory.find(findParams)
    .populate('card')
    .populate('retailer')
    .populate('customer')
    .sort({created: -1});
  })
  .then(inventories => {
    if (['manager', 'employee'].indexOf(req.user.role) !== -1) {
      if (companySettings.useAlternateGCMGR) {
        inventories = inventories.map(inventory => {
          inventory.card.number = inventory.card.getLast4Digits();
          return inventory;
        });
      }
    }

    return res.json(inventories);
  })
  .catch(async err => {
    console.log('**************ERR IN GET CARDS IN INVENTORY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getCardsInInventory',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  });
}

/**
 * Get cards in reconciliation
 *
 * @todo Update this, I can't be retrieving all reconciliations and then filtering, need to determine the query for just
 * retrieving inventories that aren't complete
 * @param req
 * @param res
 */
export function getCardsInReconciliation(req, res) {
  const params = req.params;
  // Retrieve
  Inventory.find({
      store: params.storeId,
      company: params.companyId,
      reconciliation: {$exists: true}
    })
    .populate('card')
    .populate('retailer')
    .populate('customer')
    .populate('reconciliation')
    .sort({created: -1})
    .then(cards => {
      cards = cards.filter(card => {
        if (card && card.reconciliation) {
          return !card.reconciliation.reconciliationComplete;
        }
        return false;
      });
      return res.json(cards)
    })
    .catch(async err => {
      console.log('**************ERR IN GET CARDS IN RECONCILIATION**********');
      console.log(err);

      await ErrorLog.create({
        method: 'getCardsInReconciliation',
        controller: 'company.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return res.status(500).json(err);
    });
}

/**
 * Get the last time this store was reconciled
 */
export function getLastReconciliationTime(req, res) {
  const params = req.params;
  Store.findById(params.storeId)
  .then(store => res.json({reconciledLast: store.reconciledTime || null}))
  .catch(async err => {
    console.log('**************ERR IN GET LAST RECONCILIATION TIME**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getLastReconciliationTime',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  });
}

/**
 * Get the last time reconciliation was completed for this store
 */
export function reconciliationCompleteTime(req, res) {
  const params = req.params;
  Store.findById(params.storeId)
    .then(store => res.json({reconcileCompleteTime: store.reconcileCompleteTime || null}))
    .catch(async err => {
      console.log('**************ERR IN RECONCILIATION COMPLETE TIME**********');
      console.log(err);

      await ErrorLog.create({
        method: 'reconciliationCompleteTime',
        controller: 'company.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return res.status(500).json(err);
    });
}

/**
 * Reconcile available cards
 */
export async function reconcile(req, res) {
  let matchedInventories = [];
  const body = req.body;
  const tzOffset = body.userTime.substr(-6);
  const userTime = moment.utc().add(parseInt(tzOffset), 'hours').toDate();
  let company;
  // Find physical
  const findParams = {
    type: /physical/i,
    reconciliation: {$exists: false},
    soldToLiquidation: true
  };
  // Find electronic
  const findElectronicParams = {
    type: /electronic/i,
    status: /SALE_NON_API/i,
    reconciliation: {$exists: false},
  };
  // Find others
  const findOthersParams = {
    type: /electronic/i,
    status: /SALE_NON_API/i,
    reconciliation: {$exists: false},
  };
  let storeIdParam = req.params.storeId;
  if (storeIdParam === 'all') {
    storeIdParam = false;
  } else if (!isValidObjectId(storeIdParam)) {
    storeIdParam = req.user.store;
  }
  if (storeIdParam) {
    findParams.store = storeIdParam;
    findElectronicParams.store = storeIdParam;
    findOthersParams.store = storeIdParam;
  // Use company
  } else {
    company = req.user && req.user.company ? req.user.company : null;
    if (company) {
      findParams.company = company;
      findElectronicParams.company = company;
      findOthersParams.company = company;
    }
  }
  // Make sure we have store or company
  if (!storeIdParam && !company) {
    return res.status(500).json({err: 'Unable to determine store or company'});
  }
  // Physical cards
  Inventory.find(findParams)
  .then(inventories => {
    // Add to matched
    if (inventories) {
      matchedInventories = matchedInventories.concat(inventories);
    }
    // Electronic and status === SALE_CONFIRMED
    return Inventory.find(findElectronicParams)
  })
  .then(inventories => {
    if (inventories) {
      // Add to matched
      matchedInventories = matchedInventories.concat(inventories);
    }
    // Find electronic cards which are stuck or have otherwise not sold
    return Inventory.find(findOthersParams)
  })
  // Convert these to physical
  .then(inventories => {
    if (inventories) {
      // Add to matched
      matchedInventories = matchedInventories.concat(inventories);
    }
  })
  .then(() => {
    matchedInventories = matchedInventories.filter((thisInventory, index, collection) => {
      // Find index of this _id. If not the same as current index, filter it out, since duplicate
      return collection.findIndex(t => t._id.toString() === thisInventory._id.toString()) === index;
    });
  })
  .then(() => {
    const matchPromises = [];
    // Create reconciliation for each inventory
    matchedInventories.forEach(thisMatch => {
      const reconciliation = new Reconciliation({
        inventory: thisMatch._id,
        userTime: userTime,
        created: userTime
      });
      matchPromises.push(reconciliation.save());
    });
    return Promise.all(matchPromises);
  })
    // Add reconciliations to cards
  .then(reconciliations => {
    const inventoryPromises = [];
    reconciliations.forEach((reconciliation, index) => {
      matchedInventories[index].reconciliation = reconciliation._id;
      inventoryPromises.push(matchedInventories[index].save());
    });
    return Promise.all(inventoryPromises);
  })
  // Get store
  .then(() => {
    if (storeIdParam) {
      return Store.findById(req.params.storeId);
    }
    return new Promise(resolve => resolve());
  })
  // Update the last time this store was reconciled
  .then(store => {
    if (store) {
      store.reconciledTime = Date.now();
      return store.save();
    }
    return new Promise(resolve => resolve());
  })
  .then((inventories) => res.json({data: inventories}))
  .catch(async err => {
    console.log('**************RECONCILIATION ERROR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'reconcile',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  });
}

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
  let retailers_with_denials = [];
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

    for(let ret of retailers) {
      let query = searchQuery;
      query.retailer = ret._id;
      const inventories = await Inventory.count(query);
      query.rejected = true;
      const rejected_inventories = await Inventory.count(query);
      if(inventories && rejected_inventories) {
        ret['percentOfDenials'] = rejected_inventories / inventories * 100;
      } else {
        ret['percentOfDenials'] = 0;
      }
      retailers_with_denials.push(ret);
    }

    return res.json({
      data: retailers_with_denials,
      total: retailersCount
    });
  }
  catch(err) {
    console.log('********************ERR IN GETDENIALS***********************');
    console.log(err);

    await ErrorLog.create({
      method: 'getDenials',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Delete a single inventory and all associated records
 * @param inventoryId Inventory document ID
 */
export function doDeleteInventory(inventoryId) {
  let inventory, card;
  return Inventory.findById(inventoryId)
    // Get inventory
    .then(thisInventory => {
      inventory = thisInventory;
      // Get card
      return Card.findById(inventory.card);
    })
    .then(thisCard => {
      // Save reference to card
      card = thisCard;
      // Remove all card updates
      return CardUpdate.remove({
        _id: {
          $in: card.updates
        }
      });
    })
    // Remove all deferred for this card
    .then(() => {
      return DeferredBalanceInquiry.remove({
        card: card._id
      });
    })
    // Remove reconciliations
    .then(() => {
      return Reconciliation.remove({
        _id: inventory.reconciliation
      });
    })
    // Remove inventory
    .then(() => inventory.remove())
    // Remove card
    .then(() => card.remove());
}

/**
 * Delete an inventory record
 * @param req
 * @param res
 */
export function deleteInventory(req, res) {
  // Delete this inventory ID
  doDeleteInventory(req.params.inventoryId)
  .then(() => res.json('deleted'))
  .catch(async err => {
    console.log('**************ERR IN DELETE INVENTORY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'deleteInventory',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err)
  });
}

/**
 * Mark cards currently in reconciliation as reconciled
 */
export async function markAsReconciled(req, res) {
  const params = req.params;
  const body = req.body;
  const user = req.user;
  const tzOffset = body.userTime.substr(-6);
  const userTime = moment.utc().add(parseInt(tzOffset), 'hours').toDate();
  let inventoriesToUse;
  let store;
  // Create batch
  const batch = {
    company: user.company,
    inventories: []
  };
  const findParams = {
    company: params.companyId,
    reconciliation: {$exists: true}
  };
  if (params.storeId === 'all') {
    store = isValidObjectId(params.storeId)
  } else if (isValidObjectId(params.store)) {
    store = params.store;
  } else {
    store = user.store;
  }
  if (store) {
    batch.store = store;
    findParams.store = store;
  }
  Inventory.find(findParams)
  .populate('reconciliation')
  .then(inventories => {
    // only return those inventories that don't have a complete reconciliation
    inventoriesToUse = inventories.filter(inventory => {
      if (!inventory || !inventory.reconciliation) {
        return false;
      }
      if (typeof inventory.reconciliation === 'object') {
        return !inventory.reconciliation.reconciliationComplete;
      }
      return false;
    });
    const reconciliationPromises = [];
    inventoriesToUse.forEach(thisInventory => {
      reconciliationPromises.push(thisInventory.reconciliation.update({
        $set: {
          reconciliationComplete: true,
          reconciliationCompleteUserTime: userTime
        }
      }));
      // Add to batch
      batch.inventories.push(thisInventory._id);
    });
    return Promise.all(reconciliationPromises);
  })
  .then(() => {
    if (batch.inventories.length) {
      const thisBatch = new Batch(batch);
      return thisBatch.save();
    }
  })
  .then(batch => {
    if (!batch) {
      return;
    }
    const batchPromises = [];
    inventoriesToUse.map(thisInventory => {
      batchPromises.push(thisInventory.update({
        $set: {
          batch: batch._id
        }
      }));
    });
    return Promise.all(batchPromises);
  })
  .then(batch => res.json({data: batch}))
  .catch(async err => {
    console.log('**************ERROR IN MARKED AS RECONCILED**********');
    console.log(err);

    await ErrorLog.create({
      method: 'markAsReconciled',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.json(err);
  })
}

/**
 * Retrieve reconciliation for today
 * @param req
 * @param res
 */
export function getReconciliationToday(req, res) {
  const storeParam = req.params.storeId;
  const companyId = req.user.company;
  let dbStores = [];
  let thisStore = '';
  if (storeParam === 'all') {
    thisStore = '';
  } else if (isValidObjectId(storeParam)) {
    thisStore = storeParam;
  } else {
    thisStore = req.user.store;
  }
  const params = req.params;
  const dayBegin = moment(params.today).startOf('day');
  const dayEnd = moment(params.today).endOf('day');
  let dbUser, dbReconciliations;
  let promise;
  if (thisStore === '') {
    promise = Store.find({
      companyId
    });
  } else {
    promise = new Promise(resolve => resolve());
  }
  promise
  .then(stores => {
    if (stores) {
      dbStores = stores.map(store => store._id.toString());
    }
    // Find user, company, store
    return User.findById(req.user._id)
      .populate('store')
      .populate('company')
  })
  .then(user => {
    dbUser = user;

    return Promise.all([dbUser.company.getSettings(), Reconciliation.find({
      reconciliationCompleteUserTime: {
        $gt: dayBegin.toISOString(),
        $lt: dayEnd.toISOString()
      }
    })
      .populate({
        path: 'inventory',
        populate: [{
          path: 'card',
          model: 'Card'
        }, {
          path: 'retailer',
          model: 'Retailer'
        },{
          path: 'customer',
          model: 'Customer'
        }]
      })]);
  })
  .then(([companySettings, reconciliations]) => {
    // Only return reconciliations for this store
    dbReconciliations = reconciliations.filter(thisReconciliation => {
      let storeId;
      try {
        storeId = thisReconciliation.inventory.store.toString();
      } catch (e) {
        storeId = '';
      }
      if (!thisStore) {
        return dbStores.indexOf(storeId) > -1;
      }
      return storeId === thisStore.toString();
    });

    dbReconciliations = dbReconciliations.map(reconciliation => {
      if (companySettings.useAlternateGCMGR && ['manager', 'employee'].indexOf(dbUser.role) !== -1) {
        reconciliation.inventory.card.number = reconciliation.inventory.card.getLast4Digits();
      }

      return reconciliation;
    });

    if (dbReconciliations.length) {
      // Get batch
      if (dbReconciliations[0].inventory && dbReconciliations[0].inventory.batch) {
        return Batch.findById(dbReconciliations[0].inventory.batch);
      }
    } else {
      return false;
    }
  })
  .then(batch => {
    return res.json({
      reconciliations: dbReconciliations,
      user: dbUser,
      batch: batch ? batch : {}
    });
  })
  .catch(async err => {
    console.log('**************ERROR IN RECONCILIATION TODAY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getReconciliationToday',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err)
  });
}

/**
 * Retrieve date range params for activity
 * @param params
 */
function getActivityDateRange(params) {
  const {beginDate, endDate, beginEnd, date} = params;
  const findParams = {};
  const begin = beginDate ? moment.utc(beginDate, 'MM-DD-YYYY').startOf('day') : moment().subtract(100, 'years');
  const end = endDate ? moment.utc(endDate, 'MM-DD-YYYY').endOf('day') : moment().add(100, 'years');
  if (beginDate && endDate) {
    findParams.created = {$gt: begin.toDate(), $lt: end.toDate()};
    // Begin date only
  } else if (beginEnd === 'begin' && date) {
    findParams.created = {$gt: begin.toDate()};
  }
  if (typeof params.companyId !== 'undefined') {
    findParams.company = params.companyId;
  }
  if (typeof params.rejected && params.rejected === 'true') {
    params.rejected = true;
  }
  // Only sold
  findParams.soldToLiquidation = true;

  return findParams;
}

/**
 * Expose inventory values
 * @param valuesToExpose
 * @param inventory
 * @returns {*}
 */
function exposeInventoryValues(valuesToExpose, inventory) {
  _.forEach(valuesToExpose, (value, key) => {
    if (typeof value === 'string') {
      inventory[key] = _.get(inventory, value, '');
    } else if (_.isPlainObject(value)) {
      inventory[key] = _.get(inventory, value.path, value.default);
      // Modification function
      if (value.modify) {
        inventory[key] = value.modify(inventory[key])
      }
    }
  });
  return inventory;
}

/**
 * Inventory map reduce params
 */
const inventoryMapReduceParams = {
  map: function () {
    if (typeof counter !== 'number' || (counter >= begin && counter < end)) {
      let verifiedBalance = typeof this.verifiedBalance === 'number' ? this.verifiedBalance : 0;
      const claimedBalance = typeof this.balance === 'number' ? this.balance : 0;
      const actualBalance = verifiedBalance || claimedBalance;
      emit('balance', claimedBalance);
      const buyRate = typeof this.buyRate === 'number' ? this.buyRate : 0;
      emit('buyRate', buyRate);
      const buyAmount = typeof this.buyAmount === 'number' ? this.buyAmount : 0;
      emit('buyAmount', buyAmount);
      // CQ paid
      const margin = this.margin || 0.03;
      const liquidationSoldFor = this.liquidationSoldFor || 0;
      let rateThisInventory = typeof this.liquidationRate === 'number' ? this.liquidationRate : 0;
      if (!rateThisInventory && claimedBalance) {
        rateThisInventory = liquidationSoldFor / claimedBalance;
      }
      let cqPaid = actualBalance * (rateThisInventory - margin);

      if (this.isTransaction) {
        cqPaid = this.transaction.cqPaid;
      }

      if (typeof cqPaid !== 'number' || cqPaid < 0) {
        cqPaid = 0;
      }
      // Service fee (CQ Paid for corporate, SMP paid for admin)
      const serviceFee = cqPaid * 0.0075;
      emit('serviceFee', serviceFee);
      emit('cqPaid', cqPaid);
      // Sold for
      emit('soldFor', liquidationSoldFor);

      if (this.isTransaction) {
        emit('netAmount', this.transaction.netPayout);
      } else {
        // Company ACH search including a deduction
        if (cqAchSearch && this.deduction) {
          emit('netAmount', cqPaid * -1);
          return;
        } else {
          emit('netAmount', cqPaid - serviceFee);
        }
      }
      // Verified balance
      emit('verifiedBalance', verifiedBalance);
      // Paid for already
      const cqHasPaid = typeof this.cqAch !== 'undefined';
      // Has no CQ ACH
      emit('cqOwes', cqHasPaid ? 0 : cqPaid - serviceFee);
      // The amount outstanding which CQ has yet to pay. If 4 cards bought for $50 each, and we've paid for 3, this should be $50
      emit('outstandingBuyAmount', cqHasPaid ? 0 : buyAmount);
    }
    if (typeof counter === 'number') {
      counter++;
    }
  },
  reduce: function (k, v) {
    switch (k) {
      case 'buyRate':
        return (Array.sum(v)) / v.length;
        break;
      default:
        return Array.sum(v);
        break;
    }
  },
  scope: {
    counter: 0,
    begin: 0,
    end: 0,
    corporate: false
  }
};

/**
 * Create param map as an intermediate step for getting search params
 * @param map Incoming map
 * @param inventory Current inventory
 * @param inventoryParam
 * @param displayParam
 */
function createParamMap(map, inventory, inventoryParam, displayParam = 'name') {
  map[inventory[inventoryParam]._id] = {
    [displayParam]: inventory[inventoryParam][displayParam],
    _id: inventory[inventoryParam]._id
  };
  return map;
}

/**
 * Get params in date range for dropdowns
 */
export async function getParamsInRange(req, res) {
  const query = req.query;
  const {companyId} = query;
  query.beginDate = query.dateBegin;
  query.endDate = query.dateEnd;
  if (query.beginDate && !query.endDate) {
    query.beginEnd = 'begin';
    query.date = query.beginDate;
  } else if (query.endDate && !query.beginDate) {
    query.beginEnd = 'end';
    query.date = query.endDate;
  }
  if (companyId) {
    query.companyId = companyId;
  }
  // Role for caching
  query.userRole = req.user.role;
  let batchMap = {}, companyMap = {}, storeMap = {};
  const batchFinal = [], companyFinal = [], storeFinal = [];

  try {
    const cache = await InventoryParamCache.getCache(query);
    // Return cache if it's still valid
    if (cache) {
      return res.json({batches: cache.batches, companies: cache.companies, stores: cache.stores});
    }
    const params = getActivityDateRange(query);
    Inventory.find(params)
      .populate('batch')
      .populate('company')
      .populate('store')
      .then(async inventories => {
        inventories.forEach(inventory => {
          if (inventory.batch) {
            batchMap = createParamMap(batchMap, inventory, 'batch', 'batchId');
          }
          if (inventory.company) {
            companyMap = createParamMap(companyMap, inventory, 'company');
          }
          if (inventory.store) {
            storeMap = createParamMap(storeMap, inventory, 'store');
          }
        });
        _.forEach(batchMap, batch => batchFinal.push(batch));
        _.forEach(companyMap, company => companyFinal.push(company));
        _.forEach(storeMap, store => storeFinal.push(store));
        // Store cache
        if (!cache) {
          await InventoryParamCache.storeCache(query, {
            batches: batchFinal,
            companies: companyFinal,
            stores: storeFinal
          });
        }
        return res.json({batches: batchFinal, companies: companyFinal, stores: storeFinal});
      });
  }
  catch (err) {
    console.log('**************ERROR IN RECONCILIATION TODAY**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getParamsInRange',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Get CQ paid
 * @param inventory
 * @param companyId
 * @param rejected Calculate rejected amount
 * @param totalRejections Total amount of rejections
 */
function calculateValues(inventory, companyId, rejected, totalRejections) {
  if (!_.isPlainObject(inventory)) {
    inventory = inventory.toObject();
  }
  inventory.verifiedBalance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : null;
  inventory.claimedBalance = typeof inventory.balance === 'number' ? inventory.balance : 0;
  inventory.actualBalance = inventory.verifiedBalance || inventory.claimedBalance;
  inventory.buyRate = typeof inventory.buyRate === 'number' ? inventory.buyRate : 0;
  inventory.buyAmount = typeof inventory.buyAmount === 'number' ? inventory.buyAmount : 0;
  inventory.margin = inventory.margin || 0.03;
  inventory.liquidationSoldFor = inventory.liquidationSoldFor || 0;
  if (inventory.credited || inventory.rejected) {
    inventory.liquidationSoldFor = inventory.verifiedBalance * inventory.liquidationRate;
  }
  inventory.rateThisInventory = typeof inventory.liquidationRate === 'number' ? inventory.liquidationRate : 0;
  if (!inventory.rateThisInventory && inventory.actualBalance) {
    inventory.rateThisInventory = inventory.liquidationSoldFor / inventory.actualBalance;
  }
  const rateAfterMargin = inventory.rateThisInventory > inventory.margin ? inventory.rateThisInventory - inventory.margin : 0;
  const serviceFeeRate = inventory.serviceFee || environment.serviceFee;
  // Transactions handled differently
  if (inventory.isTransaction) {
    inventory.cqPaid = inventory.transaction.cqPaid;
    inventory.displayMargin = true;
    inventory.companyMargin = inventory.serviceFee + inventory.margin;
  } else {
    inventory.cqPaid = inventory.actualBalance * rateAfterMargin;
    inventory.serviceFee = inventory.cqPaid * serviceFeeRate;
    inventory.netAmount = inventory.cqPaid - inventory.serviceFee;
  }
  // Company margin
  if (typeof inventory.verifiedBalance === 'number' && inventory.verifiedBalance < inventory.balance) {
    inventory.companyMargin = null;
    inventory.displayMargin = false;
  } else if (!inventory.isTransaction) {
    inventory.companyMargin = ((inventory.netAmount - inventory.buyAmount) / inventory.netAmount) * 100;
    inventory.displayMargin = true;
  }
  // Company activity
  inventory.corpRateThisInventory = rateAfterMargin;

  const smps = smpNames;
  // SMP
  inventory.smp = smps[inventory.smp];
  if (inventory.activityStatus) {
    if (companyId) {
      inventory.activityStatus = environment.statusDisplay[inventory.activityStatus];
    }
  } else {
    inventory.activityStatus = 'Not shipped';
  }

  if (rejected) {
    // Original buy amount
    // const buyAmount = inventory.buyAmount;
    // Buy amount after adjustment
    inventory.realBuyAmount = inventory.buyRate * inventory.verifiedBalance;
    inventory.amountOwed = inventory.buyAmount - inventory.realBuyAmount;
    // Begin calculating for this customer
    if (!totalRejections.user[inventory.customer._id.toString()]) {
      totalRejections.user[inventory.customer._id.toString()] = {
        owed: 0
      };
    }
    totalRejections.user[inventory.customer._id.toString()].owed += inventory.amountOwed;
  }
  return inventory;
}

/**
 * Allow for search on multiple values for the listed items
 * @param query
 * @return {*}
 */
function allowSearchOnMultipleValues(query) {
  const searchMultiple = ['transactionPrefix', 'retailer', 'number', 'pin', 'balance', 'verifiedBalance', 'orderNumber', 'smpAch', 'cqAch', 'adminActivityNote'];
  const splitQuery = Object.assign({}, query);
  _.forEach(query, (item, key) => {
    // Allow for split values
    if (searchMultiple.indexOf(key) > -1 && query[key]) {
      splitQuery[key] = query[key].split(',').join('|').trim();
    // Trim values which cannot be split
    } else if (typeof query[key] === 'string') {
      splitQuery[key] = query[key].trim();
    }
  });
  return splitQuery;
}

/**
 * Query activity
 * @param dateParams Date range
 * @param query
 * @param limit
 * @param skip
 * @param count Return only count
 */
function queryActivity(dateParams, query, limit, skip, count = false) {
  const promises = [];
  // Sort by created by default
  let sort = {created: 1};
  // Allow for search on multiple values for specific inputs
  query = allowSearchOnMultipleValues(query);
  // Partial object ID match
  if (query._id) {
    query.$where = `this._id.toString().match(/${query._id}/i) || this.card.toString().match(/${query._id}/i)`;
    delete query._id;
  }
  if (query.balance) {
    query.balance = parseFloat(query.balance);
  }
  if (query.type) {
    if (!(query.type instanceof RegExp)) {
      query.type = new RegExp(query.type, 'i');
    }
  }
  if (query.balance) {
    const balance = parseFloat(query.balance);
    query.$where = `String(this.balance).match(/^${balance}/) != null`;
    delete query.balance;
  }
  if (typeof query.orderNumber === 'string') {
    query.orderNumber = new RegExp('^' + query.orderNumber, 'i');
  }
  if (typeof query.liquidationSoldFor === 'string') {
    query.orderNumber = new RegExp('^' + query.orderNumber, 'i');
  }
  if (typeof query.smpAch === 'string') {
    query.smpAch = new RegExp('^' + query.smpAch, 'i');
  }
  if (typeof query.cqAch === 'string') {
    query.$or = [
      {cqAch: new RegExp('^' + query.cqAch, 'i')},
      {deduction: new RegExp('^' + query.cqAch, 'i')}
    ];
    delete query.cqAch;
  }
  // Blank
  if (!query.activityStatus && (!query.company || query.isAdmin)) {
    query.activityStatus = {$exists: false};
  }
  // Search any
  if (query.activityStatus === '-') {
    // Don't modify original query object, or it'll mess up count`
    query = Object.assign({}, query);
    delete query.activityStatus;
  }
  // Sort by system time for admin
  if (typeof query.isAdmin) {
    delete query.isAdmin;
    sort = {systemTime: 1};
  }
  // Transactions
  if (query.isTransactions) {
    query.transaction = {$exists: query.isTransactions === 'true'};
    delete query.isTransactions;
  }
  // search by verified balance
  if (query.verifiedBalance) {
    const verifiedBalance = parseFloat(query.verifiedBalance);
    query.$where = `String(this.verifiedBalance).match(/^${verifiedBalance}/) != null`;
    delete query.verifiedBalance;
  }
  const findParams = Object.assign(query, dateParams);
  // Custom sort
  if (findParams.sort) {
    sort = {};
    const sortParts = findParams.sort.split(':');
    sort[sortParts[0]] = parseInt(sortParts[1], 10);
    delete findParams.sort;
  }

  if (query.balanceCardIssued) {
    if (query.balanceCardIssued === 'true') {
      query['transaction.nccCardValue'] = {$gt: 0};
    }

    if (query.balanceCardIssued === 'false') {
      query['transaction.nccCardValue'] = 0;
    }

    delete query.balanceCardIssued;
  }

  if (query.transactionPrefix) {
    if (query.transactionPrefix.indexOf(',') > -1) {
      query.transactionPrefix = query.transactionPrefix.split(',').join('|');
    }
    query['transaction.prefix'] = new RegExp(query.transactionPrefix, 'i');
    delete query.transactionPrefix;
  }

  // Query by a subdocument
  const subdocumentConstraints = [
    'number', 'pin', 'retailer', 'customerName', 'employeeName', 'customerPhone', 'customerEmail'
  ];
  let queryBySubdocument = false;

  subdocumentConstraints.forEach(constraint => {
    if (query[constraint]) {
      queryBySubdocument = true;
    }
  });

  if (queryBySubdocument) {
    const cardParams = {}, retailerParams = {};
    let searchCard = false;
    if (query.number) {
      searchCard = true;
      if (!(query.number instanceof RegExp)) {
        cardParams.number = new RegExp(query.number);
      }
      delete query.number;
    }
    if (query.pin) {
      searchCard = true;
      if (!(query.pin instanceof RegExp)) {
        cardParams.pin = new RegExp(query.pin);
      }
      delete query.pin;
    }
    if (query.retailer) {
      if (!(query.name instanceof RegExp)) {
        retailerParams.name = new RegExp(query.retailer, 'i');
      }
      delete query.retailer;
      // Search retailers
      promises.push(
        Retailer.find(retailerParams)
          .then(retailers => {
            findParams.retailer = {$in: retailers.map(retailer => retailer._id.toString())};
          }));
    }
    // Search cards
    if (searchCard) {
      promises.push(
        Card.find(cardParams)
          .then(cards => {
            findParams.card = {$in: cards.map(card => card._id.toString())};
          }));
    }

    const customerQuery = {};

    // Search customer
    if (query.customerName) {
      let customerNameRegExp;
      if (!(query.customerName instanceof RegExp)) {
        customerNameRegExp = new RegExp(query.customerName, 'i');
      } else {
        customerNameRegExp = query.customerName;
      }

      customerQuery.fullName = customerNameRegExp;
    }

    if (query.customerPhone) {
      customerQuery.phone = new RegExp(query.customerPhone, 'i');
    }

    if (query.customerEmail) {
      customerQuery.email = new RegExp(query.customerEmail, 'i');
    }

    if (!_.isEmpty(customerQuery)) {
      promises.push(
        Customer.find(customerQuery)
        .then(customers => {
          findParams.customer = {$in: customers.map(customer => customer._id.toString())};
          delete query.customerName;
          delete query.customerPhone;
          delete query.customerEmail;
        }));
    }

    // Search employee
    if (query.employeeName) {
      const employeeRegExp = new RegExp(query.employeeName.split(' ').join('|'), 'i');
      promises.push(
        // Check firstName and lastName as well because some users might not have the fullName attribute
        User.find({$or: [{firstName: employeeRegExp}, {lastName: employeeRegExp}, {fullName: employeeRegExp}]})
        .then(employees => {
          findParams.user = {$in: employees.map(employee => employee._id.toString())};
          delete query.employeeName;
        })
      );
    }
  }
  if (!count) {
    return Promise.all(promises)
      .then(() => {
        return Inventory.find(findParams)
          .populate('customer')
          .populate('retailer')
          .populate('store')
          .populate('company')
          .populate('liquidationError')
          .populate('card')
          .populate('user')
          .populate('reconciliation')
          .populate('batch')
          .sort(sort)
          .limit(parseInt(limit))
          .skip(parseInt(skip));
      })
      .then(inventories => {
        return {
          inventories,
          findParams
        };
      });
  } else {
    return Promise.all(promises).then(() => { return Inventory.count(findParams); });
  }
}

/**
 * Set inventory as unchanged
 * @param inventory
 * @return {Promise.<void>}
 */
async function setInventoryUnchanged(inventory) {
  inventory = await Inventory.findById(inventory._id);
  inventory.changed = false;
  return inventory.save();
}

/**
 * Get inventory cache, or handle calculations on an inventory
 * @param inventory
 * @param companySettings
 * @param userRole Role of current user
 * @param companyId
 * @param getDenialsPayments Whether to calculate rejected amount
 * @param totalRejections Total rejections
 * @return {Promise.<T>}
 *
 * @todo We need to handle calculations of user total rejections even when getting cached values
 */
async function handleCalculations(inventory, companySettings, userRole, companyId, getDenialsPayments, totalRejections) {
  // Don't use cache for rejections, since we need to total the values
  if (!getDenialsPayments) {
    let cache;
    // Inventory unchanged, no need to recalculate
    cache = await Inventory.getCalculatedValues(inventory);
    if (cache) {
      if (!_.isPlainObject(inventory)) {
        inventory = inventory.toObject();
      }
      cache = cache.toObject();
      // Combine cache with inventory
      for (let i in cache) {
        if (cache.hasOwnProperty(i)) {
          if (['_id', 'inventory', 'created'].indexOf(i) !== -1) {
            continue;
          }
          inventory[i] = cache[i];
        }
      }
      inventory.isCached = true;
      return Promise.resolve(inventory);
    }
  }
  if (['manager', 'employee'].indexOf(userRole) !== -1 && companySettings.useAlternateGCMGR) {
    inventory.card.number = inventory.card.getLast4Digits();
  }
  // Calculate values for this inventory
  const thisInventory = calculateValues(inventory, companyId, getDenialsPayments, totalRejections);
  return Promise.resolve(thisInventory);
}

/**
 * Calculate values (from cache if possible, else cache result)
 * @param inventories
 * @param companySettings
 * @param userRole
 * @param companyId
 * @param getDenialsPayments Whether to
 * @param rejections
 * @return {Promise.<void>}
 */
async function getCalculatedValues(inventories, companySettings, userRole, companyId, getDenialsPayments, rejections) {
  // Inventories after all calculations or cache applications
  const finalInventories = [];
  // return inventories.forEach(getCalc);
  for (let inventory of inventories) {
    // Calculate inventory values
    inventory = await handleCalculations(inventory, companySettings, userRole, companyId, getDenialsPayments, rejections);
    // cache if necessary
    if (!inventory.isCached) {
      // Cache inventory values
      await Inventory.cacheInventoryValues(inventory);
    }
    // Now that we're cached, set inventory as unchanged
    await setInventoryUnchanged(inventory);
    // Temp critical bug fix. We need to figure out which place is the best one to put this
    // or put the mapped value along with the cached inventory data.
    if (smpNames[inventory.smp]) {
      inventory.smp = smpNames[inventory.smp];
    }

    // Add to final
    finalInventories.push(inventory);
  }
  return Promise.resolve(finalInventories);
}

/**
 * Create CSV for an SMP
 * @param inventories
 * @param csvSmp
 * @param res
 * @return {Promise.<void>}
 */
async function getSmpCsv(inventories, csvSmp, res) {
  let format = [];
  const isCc = csvSmp.toLowerCase() === 'cardcash';
  const isCp = csvSmp.toLowerCase() === 'cardpool';
  const isGcz = csvSmp.toLowerCase() === 'giftcardzen';
  const isCorporate = csvSmp.toLowerCase() === 'corporate';
  if (isCp) {
    format = ['retailer', 'number', 'pin', 'balance'];
  } else if (isCc) {
    format = ['Merchant', 'Number', 'Pin', 'Balance', 'REF'];
  } else if (isGcz) {
    format = ['Merchant', 'Card Number', 'PIN', 'Balance', 'Note'];
    // Corporate, get all
  } else if (isCorporate) {
    format = ['userTime', 'cardId', 'retailer', 'number', 'pin', 'balance', 'verifiedBalance', 'netAmount', 'customerName', 'buyAmount', 'ach'];
    // Add in denial amount for CSV denials
    if (getDenialsPayments) {
      format.splice(9, 0, 'rejectAmount');
    }
  } else {
    throw 'unknownSmpFormat';
  }
  const csvWriter = CsvWriter({ headers: format});
  const outFile = `salesCsv/${moment().format('YYYYMMDD')}-${csvSmp}.csv`;
  // Remove existing file
  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }
  csvWriter.pipe(fs.createWriteStream(outFile));
  inventories = inventories.filter(inventory => {
    let used = false;
    // All for corporate
    if (isCorporate) {
      used = true;
      // Electronic cards can have any status before sent to SMP
    } else {
      let activityStatus = typeof inventory.activityStatus === 'string' ? inventory.activityStatus.toLowerCase() : '';
      activityStatus = activityStatus.replace(/\s/g, '');
      if (inventory.type.toLowerCase() === 'electronic') {
        used = !activityStatus || activityStatus === 'notshipped';
        // Physical cards must be received
      } else {
        used = activityStatus === 'receivedcq';
      }
    }
    if (!used) {
      return false;
    }
    // 2
    if (isCc) {
      return inventory.smp.toLowerCase() === 'cardcash' || inventory.smp === environment.smpIds.CARDCASH;
      // 3
    } else if (isCp) {
      return inventory.smp.toLowerCase() === 'cardpool' || inventory.smp === environment.smpIds.CARDPOOL;
    } else if (isGcz) {
      return inventory.smp.toLowerCase() === 'giftcardzen' || inventory.smp === environment.smpIds.GIFTCARDZEN;
      // Corporate
    } else if (isCorporate) {
      return inventory;
    }
  });
  // Create columns
  for (let inventory of inventories) {
    let row;
    if (inventory.card) {
      // ['cardId', 'retailer', 'number', 'pin', 'balance', 'verifiedBalance', 'netAmount', 'customerName', 'buyAmount', 'ach']
      if (csvSmp === 'corporate') {
        inventory = calculateValues(inventory, companyId);
        const netAmount = inventory.isTransaction ? inventory.transaction.netPayout : inventory.netAmount;
        let customerName = '';
        // Get customer name, which could be different based on which endpoint the cards sold from
        if (inventory.card.lqCustomerName) {
          customerName = inventory.card.lqCustomerName;
        } else if (inventory.customer && inventory.customer.fullName) {
          customerName = inventory.customer.fullName;
        }
        row = [moment(inventory.created).format(), inventory.card._id, inventory.retailer.name, inventory.card.number, inventory.card.pin,
               inventory.balance.toFixed(2), inventory.verifiedBalance ? inventory.verifiedBalance.toFixed(2) : inventory.balance.toFixed(2),
               netAmount.toFixed(2), customerName, inventory.buyAmount.toFixed(2), inventory.cqAch];
        // Denials
        if (getDenialsPayments) {
          row.splice(9, 0, inventory.rejectAmount ? inventory.rejectAmount.toFixed(2) : `(${inventory.creditAmount.toFixed(2)})`);
        }
      } else {
        // Get retailer object
        if (_.isPlainObject(inventory.retailer)) {
          inventory.retailer = await Retailer.findById(inventory.retailer._id);
        }
        const retailerName = inventory.retailer.getSmpSpelling()[csvSmp] || inventory.retailer.name;
        row = [retailerName, inventory.card.number, inventory.card.pin, inventory.verifiedBalance || inventory.balance];
      }
      if (isCc || isGcz) {
        row.push('');
      }
      csvWriter.write(row);
    }
  }
  csvWriter.end();
  res.json({url: `${environment.serverApiUrl}${outFile}`});
}

/**
 * Get all activity (admin revised)
 */
export async function getAllActivityRevised(req, res) {
  try {
    const {
            perPage,
            offset
          } = req.params;
    const query = req.query;
    let companyId;
    let companySettings = null;
    // Download CSV for an SMP
    let csvSmp;
    // See if a CQ ACH search is being performed
    let cqAchCompanySearch = !!query.cqAch;
    // Whether to get denial payments
    let getDenialsPayments = false;
    let payments = [];
    let meta = {};
    // Date range params
    const findParams = getActivityDateRange(req.params);
    let inventories;
    // Params after formatting for activity query
    let finalFindParams;
    const rejections = {
      user: {}
    };
    // Store company ID and format for query
    if (query.companyId) {
      companyId = query.companyId;
      query.company = query.companyId;
      delete query.companyId;
    }
    // Download CSV
    if (query.csvSmp) {
      csvSmp = query.csvSmp;
      delete query.csvSmp;
    }
    // Set rejected to boolean
    if (query.rejected && query.rejected === 'true') {
      // Either credited or rejected
      query.$or = [
        {credited: true},
        {rejected: true}
      ];
      delete query.rejected;
      getDenialsPayments = true;
      // Search all statuses for denials
      query.activityStatus = '-';
    }
    // User is admin
    if (req.user.role === 'admin') {
      query.isAdmin = true;
    }
    const queryRes = await queryActivity(findParams, query, perPage, offset, false, true);
    inventories = queryRes.inventories;
    finalFindParams = queryRes.findParams;
    // If querying as corporate
    const company = await Company.findById(companyId);
    if (company) {
      companySettings = await company.getSettings();
    }
    // Calculate values for activity
    inventories = await getCalculatedValues(inventories, companySettings, req.user.role, companyId, getDenialsPayments, rejections);
    // Set mongo grand total params
    inventoryMapReduceParams.query = finalFindParams;
    inventoryMapReduceParams.scope = {
      counter: null,
      begin: 0,
      end: 0,
      corporate: !!companyId,
      cqAchSearch: cqAchCompanySearch
    };
    const mrRes = await Inventory.mapReduce(inventoryMapReduceParams);
    meta.totals = {};
    mrRes.forEach(item => {
      meta.totals[item._id] = item.value;
    });
    if (getDenialsPayments) {
      payments = await DenialPayments.find({
        customer: query.customer
      });
    }
    // Set mongo skip and limit
    inventoryMapReduceParams.query = finalFindParams;
    const paramsOffset = parseInt(offset);
    const paramsPerPage = parseInt(perPage);
    inventoryMapReduceParams.scope = {
      counter: 0,
      begin: paramsOffset,
      end: (paramsPerPage + paramsOffset),
      corporate: !!companyId,
      cqAchSearch: cqAchCompanySearch
    };
    const mrPageRes = await Inventory.mapReduce(inventoryMapReduceParams);
    meta.pageTotals = {};
    mrPageRes.forEach(item => {
      meta.pageTotals[item._id] = item.value;
    });
    const count = await queryActivity(findParams, query, perPage, offset, true);
    meta.total = count;
    meta.pages = Math.ceil(count / perPage);
    // Download formatted for upload to an SMP
    if (csvSmp) {
      return getSmpCsv(inventories, csvSmp, res);
    }
    res.json({
      inventories,
      meta,
      payments
    });
  } catch (err) {
    console.log('**************GETALLACTIVITYREVISED ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getAllActivityRevised',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json({err: err});
  }
}

/**
 * Retrieve a company summary report
 */
export async function getCompanySummary(req, res) {
  const {companyId} = req.params;
  let begin = req.params.begin;
  let end = req.params.end;
  begin = moment.utc(begin).startOf('day');
  end = moment.utc(end).endOf('day');
  let dbStores;

  try {
    Store.find({
      companyId
    })
      .then(stores => {
        dbStores = stores;
        const promises = [];
        stores.forEach(store => {
          inventoryMapReduceParams.query = {
            created: {$gt: begin.toDate(), $lt: end.toDate()},
            company: companyId,
            store: store._id
          };
          inventoryMapReduceParams.scope = {
            counter: null,
            begin: 0,
            end: 0,
            corporate: true,
            cqAchSearch: false
          };
          promises.push(Inventory.mapReduce(inventoryMapReduceParams));
        });
        return Promise.all(promises);
      })
      .then(results => {
        const storesWithData = [];
        for (let i = 0; i < results.length; i++) {
          const resultObject = {};
          results[i].forEach(result => {
            resultObject[result._id] = result.value;
          });
          storesWithData.push({
            store: dbStores[i],
            data: resultObject
          });
        }
        return res.json({data: storesWithData});
      });
  }
  catch (err) {
    console.log('**************getCompanySummary ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getCompanySummary',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json({err: err});
  }
}

/**
 * Sell a card which is not auto-sold
 */
export async function sellNonAutoCard(req, res) {
  const user = req.user;
  const params = req.params;
  const isCorporateAdmin = user.role === 'corporate-admin';
  // Wrong company
  if (user.company.toString() !== params.companyId) {
    return res.status(401).json();
  }
  // Right company, wrong store
  if (!isCorporateAdmin) {
    if (!user.store || user.store.toString() !== params.storeId) {
      return res.status(401).json();
    }
  }
  Inventory.findById(params.inventoryId)
  .then(inventory => {
    inventory.proceedWithSale = true;
    inventory.save();
  })
  .then(inventory => res.json(inventory))
  .catch(async err => {
    console.log('**************ERR IN SELL NON AUTO CARD**********');
    console.log(err);

    await ErrorLog.create({
      method: 'sellNonAutoCard',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  });
}

/**
 * Check if there is inventory which needs to be reconciled
 */
export async function checkInventoryNeedsReconciled(req, res) {
  const {companyId, storeId} = req.params;

  try {
    Inventory.find({
      company: companyId,
      store: storeId,
      soldToLiquidation: true,
      reconciliation: {
        $exists: false
      }
    })
      .then(inventories => {
        return res.json({
          needReconciliation: !!inventories.length
        });
      })
  }
  catch (err) {
    console.log('**************ERR IN checkInventoryNeedsReconciled**********');
    console.log(err);

    await ErrorLog.create({
      method: 'checkInventoryNeedsReconciled',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Get receipts for a company
 */
export async function getReceipts(req, res) {
  const {perPage = 20, offset = 0} = req.query;

  try {
    const receiptService = new ReceiptService();
    const query = Object.assign({}, _.pick(req.query, ['created']), {company: req.user.company});
    const [totalReceipts, receipts] = await Promise.all([
      receiptService.getReceiptsCount(query),
      receiptService.getReceipts(query, {perPage: parseInt(perPage, 10), offset: parseInt(offset, 10)})
    ]);

    res.json({
      data: receipts,
      pagination: {
        total: totalReceipts
      }
    });
  } catch (err) {
    console.log('**************ERR IN GET RECEIPTS**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getReceipts',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Delete one or more inventories
 */
export async function deleteInventories(req, res) {
  const body = req.body;
  const inventories = [];

  try {
    _.forEach(body, thisInventory => {
      inventories.push(thisInventory);
    });
    Inventory.find({
      _id: {
        $in: inventories
      }
    })
      .populate('card')
      .then(async dbInventories => {
        for (const inventory of dbInventories) {
          if (inventory.transaction) {
            await inventory.removeReserve();
          }
          await inventory.card.remove();
          await inventory.remove();
        }

        return res.json();
      });
  }
  catch (err) {
    console.log('**************ERR IN deleteInventories**********');
    console.log(err);

    await ErrorLog.create({
      method: 'deleteInventories',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}

/**
 * Change users role
 */
export async function updateRole(req, res){
  const userId = req.params.userId;

  try {
    User.findById(userId)
      .then(user => {
        user.role = req.params.userRole;
        user.save();
      })
      .then(() => res.json())
  }
  catch (err) {
    console.log('**************ERR IN updateRole**********');
    console.log(err);

    await ErrorLog.create({
      method: 'updateRole',
      controller: 'company.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json(err);
  }
}
