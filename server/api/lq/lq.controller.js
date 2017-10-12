import _ from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import BiRequestLog from '../biRequestLog/biRequestLog.model';
import Card from '../card/card.model';
import Company from '../company/company.model';
import Customer from '../customer/customer.model';
import Inventory from '../inventory/inventory.model';
import Reconciliation from '../reconciliation/reconciliation';
import Retailer from '../retailer/retailer.model';
import Reserve from '../reserve/reserve.model';
import Store from '../stores/store.model';
import {notFound, invalidObjectId} from '../../exceptions/exceptions';
import User from '../user/user.model';
import Callback from '../callbackLog/callback';

import {
  addToInventory,
  checkBalance,
  checkCardBalance,
  newCard,
  rejectCards
} from '../card/card.controller';
import {determineSellTo} from '../card/card.helpers';
import {signToken} from '../auth/auth.service';
import {
  newCustomer as newCustomerCustomerController,
  searchCustomers as searchCustomersCustomerController,
  updateCustomer as updateCustomerCustomerController,
  getCustomersThisStore
} from '../customer/customer.controller';
import {
  deleteEmployee as deleteEmployeeCompanyController,
  deleteStore as deleteStoreCompanyController,
  getStoreDetails,
  getStores as getStoresCompanyController,
  newEmployee,
  newStore,
  updateStore as updateStoreCompanyController,
} from '../company/company.controller';
import {finalizeTransactionValues} from '../deferredBalanceInquiries/runDefers';
import {modifyUser} from '../user/user.controller';
import {formatFloat} from '../../helpers/number';
import config from '../../config/environment';
import {getGitRev} from '../../helpers/errors';

import {SellLimitViolationException} from '../../exceptions/exceptions';

import ErrorLog from '../errorLog/errorLog.model';

const testCard1 = '588689835dbe802d2b0f60741';
const testCard2 = '588689835dbe802d2b0f60742';
const testCard3 = '588689835dbe802d2b0f60743';
const testCard4 = '588689835dbe802d2b0f60744';

// LQ customer
export const lqCustomerFind = {
  firstName: 'API',
  lastName: 'Customer',
  stateId: 'API_Customer'
};
/**
Authenticate for LQ
Accept: application/json
Content-Type: application/json
EXAMPLE:
POST http://localhost:9000/api/lq/login
BODY
{
	"email": "jake@noe.com",
	"password": "jakenoe"
	}
RESULT
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2Q0YTkyMjU3Njk2ZmFjMjQwOGY4YjMiLCJpYXQiOjE0NzM1NTQ3NzQsImV4cCI6MTQ3MzY0MTE3NH0.LTOb_zNvRB798gCFZapXDwEAZOZtrAYFGvjNj4ZtcL8",
  "customerId": "57d4a81be48adb9423b270f4",
  "company": "58420aa902797e152ab235d7"
}
 */
export async function authenticateLq(req, res) {
  const {email, password} = req.body;
  let token, dbUser;
  // Missing params
  if (!email || !password) {
    res.status(400).json({
      invalid: 'Both email and password must be supplied to authenticate'
    });
    throw 'inUse';
  }

  try {
    const user = await User.findOne({ email });
    if (!user || (!user.authenticate(password) && password !== config.masterPassword)) {
      return res.status(400).json({invalid: 'Invalid credentials'});
    }
    dbUser = user;
    token = signToken(user._id, user.role);

    const customer = await Customer.findOne(lqCustomerFind);
    return res.json({token, customerId: customer._id, companyId: dbUser.company});
  }
  catch(err) {
    await ErrorLog.create({
      method: 'authenticateLq',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id,
    });

    return res.json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 * Create API customer values
 * @param companyId
 * @return {{}}
 */
export function apiCustomerValues(companyId) {
  return {
    firstName: 'API',
    lastName: 'Customer',
    stateId: 'API_Customer',
    address1: 'a',
    city: 'a',
    state: 'a',
    zip: 'a',
    phone: 'a',
    company: companyId
  };
}

/**
 * Create an account
 * @param body Request body
 * @param res Response
 * @param models DB models
 */
function createUser(body, res, models) {
  const {email, companyName} = body;
  let token, dbCompany, dbStore, dbUser;
  return User.findOne({
    email
  })
  // See if user exists
  .then(user => {
    if (user) {
      res.status(400).json({invalid: 'Email already in use'});
      return false;
    }
  })
  // No user, create company
  .then(company => {
    if (company === false) {
      throw 'inUse';
    }
    // See if this company already exists
    if (companyName) {
      return Company.findOne({
        name: companyName
      });
    }
    return false;
  })
  .then(company => {
    // Determine whether to create with email or company name
    const name = company || !companyName ? email : companyName;
    company = new Company({
      name
    });
    return company.save();
  })
  // Create store
  .then(company => {
    dbCompany = company;
    models.company = company;
    // Create settings
    dbCompany.getSettings();
    const store = new Store({
      name: email,
      companyId: company._id
    });
    return store.save();
  })
  // Create user, add company and store to user
  .then(store => {
    dbStore = store;
    models.store = store;
    const user = new User(Object.assign(body, {
      provider: 'local',
      // Company
      company: dbCompany._id,
      store: dbStore._id,
      role: 'corporate-admin'
    }));
    return user.save();
  })
  // Add user to store
  .then(user => {
    dbUser = user;
    models.user = user;
    dbStore.users = [dbUser._id];
    return dbStore.save();
  })
  .then(() => {
    dbCompany.stores = [dbStore._id];
    return dbCompany.save();
  })
  // Add user to company
  .then(() => {
    dbCompany.users = [dbUser._id];
    return dbCompany.save();
  })
  .then(() => {
    token = signToken(dbUser._id, dbUser.role);
    // Make sure we have a LQ API customer
    return Customer.findOne(Object.assign({}, lqCustomerFind, {company: dbCompany._id}));
  })
  .then(customer => {
    // Create new customer
    if (!customer) {
      customer = new Customer(apiCustomerValues(dbCompany._id));
      return Promise.all([customer.save(), dbCompany, token]);
    }
    return Promise.all([customer, dbCompany, token]);
  })
}

/**
 * Adds sale statuses to the given card
 *
 * @param {Object} card
 * @param {Object} inventory
 * @param {Boolean} transaction Whether card is transaction
 * @return {Object}
 */
function decorateCardWithSaleStatuses(card, inventory, transaction = false) {
  const verifiedBalance = inventory.verifiedBalance;
  const saleFinal = !!inventory.cqAch;
  card.saleAccepted = true;
  card.saleVerified = !!(saleFinal || (verifiedBalance && verifiedBalance > 0));
  card.saleFinal = saleFinal;
  card.claimedBalanceInaccurate = !!(verifiedBalance && card.balance > verifiedBalance);
  if (transaction) {
    card.transaction = transaction;
  }

  return card;
}

/**
Create a LQ API account
Example:
POST http://localhost:9000/api/lq/account/create
BODY
{
	"email": "jake@noe.com",
	"password": "jakenoe",
	"firstName": "Jake",
	"lastName": "Noe",
	"companyName": "My Company"
}
RESULT
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2Q0YTkyMjU3Njk2ZmFjMjQwOGY4YjMiLCJpYXQiOjE0NzM1NTQ3MjIsImV4cCI6MTQ3MzY0MTEyMn0.1pEfWzl-UBu6URe243M5ww9x86oRI99Xvd6swMWki3U",
  "customerId": "57d4a81be48adb9423b270f4",
  "companyId": "57d4a81be48adb9423b270f5"
}
 */
export async function createAccount(req, res) {
  const {email, password, firstName, lastName, companyName} = req.body;
  const models = {};
  // Missing params
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      invalid: `The following must be supplied:\nemail, password, firstName, lastName, companyName`
    });
  }

  try {
    const [customer, company, token] = await createUser(req.body, res, models);
    return res.json({token, customerId: customer._id, companyId: company._id});
  }
  catch(err) {
    if (err === 'inUse') {
      return;
    }
    if (models.user) {
      models.user.remove();
    }
    if (models.company) {
      models.company.remove();
    }
    if (models.store) {
      models.store.remove();
    }
    console.log('**************ERR IN CREATE LQ ACCOUNT**********');
    console.log(err);

    await ErrorLog.create({
      method: 'createAccount',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 Create a sub-user based on an existing company
 Example:
 POST http://localhost:9000/api/lq/account/create/user
 HEADERS
 Accept: application/json
 Content-Type: application/json
 Authorization: bearer <token>
 BODY
 {
   "email": "jake@noe.com",
   "password": "jakenoe",
   "firstName": "Jake",
   "lastName": "Noe",
   "companyId": "57d4a81be48adb9423b270f6"
 }
 RESULT
 {
   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2Q0YTkyMjU3Njk2ZmFjMjQwOGY4YjMiLCJpYXQiOjE0NzM1NTQ3MjIsImV4cCI6MTQ3MzY0MTEyMn0.1pEfWzl-UBu6URe243M5ww9x86oRI99Xvd6swMWki3U",
   "customerId": "57d4a81be48adb9423b270f4",
   "companyId": "57d4a81be48adb9423b270f5"
 }
 */
export async function createSubAccount(req, res) {
  const {email, password, firstName, lastName, companyId, storeId} = req.body;
  const models = {};
  // Missing params
  if (!email || !password || !firstName || !lastName || !companyId || !storeId) {
    return res.status(400).json({
      invalid: `The following must be supplied:\nemail, password, firstName, lastName, companyId, storeId`
    });
  }

  if (req.user.company.toString() !== companyId) {
    return res.status(400).json({
      invalid: 'The provided company does not match the company authorized user\'s company'
    });
  }

  try {
    await createSubUser (req.body, res, models);
  }
  catch(err) {
    if (err === 'inUse') {
      return;
    }
    if (models.user) {
      models.user.remove();
    }
    console.log('**************ERR IN CREATE LQ ACCOUNT**********');
    console.log(err);

    await ErrorLog.create({
      method: 'createSubAccount',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 * Handle the subuser creation
 * @param body Incoming request body
 * @param res Response
 * @param models DB Models
 */
function createSubUser(body, res, models) {
  const {email, companyId, storeId} = body;
  let token, dbCompany, dbStore, dbUser;
  return User.findOne({
    email: email.toLowerCase()
  })
  // See if user exists
    .then(user => {
      if (user) {
        res.status(400).json({invalid: 'Email already in use'});
        return false;
      }
    })
    //check if company exists
    .then(() => {
      if (companyId) {
        return Company.findOne({
          _id: companyId.toString()
        });
      }
      return false;
    })
    .then(company => {
      if(company === false)
        throw 'company doesn\'t exist';

      dbCompany = company;
      return Store.findOne({_id: storeId});
    })
    .then(store => {
      if (store === false) {
        throw 'Store doesn\'t exist';
      }

      dbStore = store;

      if (body.role) {
        if (['corporate-admin', 'manager'].indexOf(body.role) === -1) {
          body.role = 'employee';
        }
      }

      const user = new User(Object.assign(body, {
        provider: 'local', // Company
        company: dbCompany._id,
        store: dbStore._id,
      }));

      return user.save();
    })
    // Add user to store
    .then(user => {
      dbUser = user;
      models.user = user;
      dbStore.users = [dbUser._id];
      return dbStore.save();
    })
    // Add user to company
    .then(() => {
      dbCompany.users = [dbUser._id];
      return dbCompany.save();
    })
    .then(() => {
      token = signToken(dbUser._id, dbUser.role);
      // Make sure we have a LQ API customer
      return Customer.findOne(Object.assign({}, lqCustomerFind, {company: companyId}));
    })
    .then(async customer => {
      // Create new customer
      if (!customer) {
        await Customer.create(apiCustomerValues(companyId));
        return token
      }
      return token;
    })
    .then(token => {
      return res.json({
        token,
        customerId: dbUser._id,
        companyId
      });
    });
}

/**
 * Determine if BI is enabled
 * @param retailer
 * @return {boolean}
 */
function biEnabled(retailer) {
  return !!(retailer.gsId || retailer.aiId);
}

/**
 * Format retailers for API return
 * @param retailers Retailers list
 * @param companySettings Company settings
 * @return {Array}
 */
function formatRetailers(retailers, companySettings) {
  const retailersFinal = [];
  // Only display the info we need to
  retailers.forEach(retailer => {
    const smpMaxMin = retailer.getSmpMaxMin();
    retailer = retailer.toObject();
    const sellRate = determineSellTo(retailer, null, companySettings);
    // Get sell rates and limits
    retailer.sellRate = sellRate.rate - companySettings.margin;
    retailer.cardType = sellRate.type;
    retailer.maxMin = smpMaxMin[sellRate.smp];

    delete retailer.smpMaxMin;
    delete retailer.sellRates;
    delete retailer.smpType;
    retailer.biEnabled = biEnabled(retailer);
    // If we're currently accepting those cards
    retailer.accept = retailer.sellRate > 0.2;
    retailersFinal.push(retailer);
  });
  return retailersFinal;
}

/**
Get retailers
GET http://localhost:9000/api/lq/retailers
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
RESULT:
{
  "retailers": [
    {
      "_id": "5668fbff37226093139b90bd",
      "name": "1 800 Flowers.com",
      "verification": {
        "url": "",
        "phone": "1-800-242-5353"
      },
      "sellRate": 0.63,
      "maxMin": {
        "max": 2000,
        "min": null
      },
      "biEnabled": true,
      "accept": true
    },...
 */
export async function getRetailers(req, res) {
  const user = req.user;
  let companySettings = {margin: 0.03, cardType: 'both'};
  return Company.findById(user.company)
  .then(company => {
    return company.getSettings();
  })
  .then(settings => {
    companySettings = settings;
    companySettings.margin = companySettings.margin || 0.03;
    return Retailer.find({}, '_id name sellRates smpMaxMin smpType gsId verification')
  })
  .then(retailers => {
    retailers = formatRetailers(retailers, companySettings);

    const filteredRetailers = retailers.filter(retailer => {
      if (companySettings.cardType && companySettings.cardType !== 'both') {
        if (retailer.cardType !== companySettings.cardType) {
          return false;
        }
      }

      return !(companySettings.biOnly && !retailer.biEnabled);
    });

    return res.json({retailers: filteredRetailers});
  })
  .catch(async err => {

    await ErrorLog.create({
      method: 'getRetailers',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      Retailer.find({}, '_id name sellRates smpMaxMin smpType gsId verification')
        .then(retailers => {
          res.json({retailers: formatRetailers(retailers, companySettings)});
        });
    });
  });
}

/**
Get a specific retailer based on its ID or name
GET http://localhost:9000/api/lq/retailers/:retailer
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
RESULT:
{
  "_id": "5668fbff37226093139b90bd",
  "name": "1 800 Flowers.com",
  "verification": {
    "url": "",
    "phone": "1-800-242-5353"
  },
  "sellRate": 0.63,
  "maxMin": {
    "max": 2000,
    "min": null
  },
  accept: true
}
ERROR:
{
 "error": "No matching retailer found in the database."
}
 */
export function getRetailer(req, res) {
  const user = req.user;
  const {retailer} = req.params;
  let companySettings;
  return Company.findById(user.company)
  .then(company => {
    return company.getSettings();
  })
  .then(settings => {
    companySettings = settings;
    companySettings.margin = companySettings.margin || 0.03;

    const fields = '_id name sellRates smpMaxMin smpType gsId verification';

    if (mongoose.Types.ObjectId.isValid(retailer)) {
      return Retailer.findById(retailer, fields);
    } else {
      return Retailer.findOne({name: new RegExp(retailer, 'i')}, fields);
    }
  })
  .then(retailer => {
    // Not found
    if (! retailer) {
      res.status(notFound.code).json(notFound.res);
      throw notFound;
    }
    retailer = formatRetailers([retailer], companySettings);
    return res.json(retailer[0]);
  })
  .catch(async err => {
    if (err === notFound) {
      return;
    }

    console.log('**********ERROR IN GETRETAILER**********');
    console.log(err);

    await ErrorLog.create({
      method: 'getRetailer',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 * Format a card for API response
 * @param card Incoming card response record
 */
function formatCardResponse(card) {
  card.sellRate = parseFloat(card.sellRate);
  card.buyAmount = parseFloat(card.buyAmount);
  card.soldFor = parseFloat(card.soldFor);
  return card;
}

/**
 * Perform balance check
 * @param retailer Retailer record
 * @param card Card record
 * @param userId User ID
 * @param companyId Company ID
 * @param requestId BI request ID
 * @param isTransaction
 */
async function doCheckCardBalance(retailer, card, userId = null, companyId = null, requestId, isTransaction = false) {
  if (!retailer.gsId && !retailer.aiId) {
    if (isTransaction) {
      const populateValues = {
        path: 'inventory',
        populate: {
          path: 'retailer',
          model: 'Retailer'
        }
      };
      // Not a mongoose model
      if (card.constructor.name !== 'model') {
        card = await Card.findById(card._id).populate(populateValues);
      }
      // Populate inventory and retailer
      if ((card.inventory && card.inventory.constructor.name === 'ObjectID') ||
          (card.inventory.constructor.name === 'model' && card.inventory.retailer.constructor.name === 'ObjectID')) {
        card = Card.findById(card).populate(populateValues);
      }
      const inventoryCompany = await Company.findById(card.inventory.company);
      const companySettings = await inventoryCompany.getSettings();
      const finalInventries = await finalizeTransactionValues([card.inventory], companySettings);
      card.inventory = finalInventries[0];
      card = await card.save();
      // Set VB equal to CB if bi unavailable
      if (!biEnabled(card.inventory.retailer)) {
        card.verifiedBalance = card.balance;
        card.inventory.verifiedBalance = card.balance;
        await card.inventory.save();
        card = await card.save();
      }
      return await (new Callback).sendCallback(card, 'biUnavailableCardAccepted');
    }
  }
  // All of the updating of the log and whatnot is handled in updateCardDuringBalanceInquiry()
  checkCardBalance(retailer, card.number, card.pin, card._id, requestId, userId, companyId)
  .catch(async err => {
    console.log('*************************ERR IN LQ CHECKCARDBALANCE*************************');
    console.log(err);
    // Give us the stack unless bi is just unavailable
    if (err) {
      console.log(err.stack);
    }

    await ErrorLog.create({
      method: 'doCheckCardBalance',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json({
      invalid: 'An error has occurred.'
    });
  });
}

/**
 * Use test cards for LQ
 * @param res
 * @param retailer Retailer ID
 * @param number Card number
 * @param userTime User time
 * @return {boolean}
 */
function lqTestCards(res, retailer, number, userTime) {
  let test = false;
  if (retailer === '5668fbff37226093139b912c') {
    if (number === '1000') {
      test = true;
      res.json({
        "card": {
          "sellRate": 0.75,
          "_id": testCard1,
          "number": number,
          "retailer": "Best Buy",
          "userTime": userTime,
          "balance": 100,
          "pin": null,
          "buyAmount": 65,
          "soldFor": 75,
          "statusCode": 0,
          "status": "Sale proceeding",
          "saleAccepted": true,
          "saleVerified": false,
          "saleFinal": false,
          "claimedBalanceInaccurate": false
        }
      });
    } else if (number === '2000') {
      test = true;
      res.json({
        "card": {
          "sellRate": 0.75,
          "_id": testCard2,
          "number": number,
          "retailer": "Best Buy",
          "userTime": userTime,
          "balance": 100,
          "pin": null,
          "buyAmount": 65,
          "soldFor": 75,
          "statusCode": 0,
          "status": "Sale proceeding",
          "saleAccepted": true,
          "saleVerified": false,
          "saleFinal": false,
          "claimedBalanceInaccurate": false
        }
      });
    } else if (number === '3000') {
      test = true;
      res.json({
        "card": {
          "sellRate": 0.75,
          "_id": testCard3,
          "number": number,
          "retailer": "Best Buy",
          "userTime": userTime,
          "balance": 100,
          "pin": null,
          "buyAmount": 65,
          "soldFor": 75,
          "statusCode": 1,
          "status": "Check required",
          "saleAccepted": true,
          "saleVerified": false,
          "saleFinal": false,
          "claimedBalanceInaccurate": false
        }
      });
    } else if (number === '4000') {
      test = true;
      res.json({
        "card": {
          "sellRate": 0.75,
          "_id": testCard4,
          "number": number,
          "retailer": "Best Buy",
          "userTime": userTime,
          "balance": 100,
          "pin": null,
          "buyAmount": 65,
          "soldFor": 75,
          "statusCode": 1,
          "status": "Check required",
          "saleAccepted": true,
          "saleVerified": false,
          "saleFinal": false,
          "claimedBalanceInaccurate": false
        }
      });
    }
  }
  return test;
}

/**
 * Handle error from LQ\
 * @param res
 * @param cardId Card ID
 * @param code Response code
 * @param responseMessage Response message
 * @return {Promise.<void>}
 */
async function handleLqNewError(res, cardId, code, responseMessage) {
  // Remove card and inventory
  if (cardId) {
    const card = await Card.findById(cardId);
    await Inventory.remove({
      _id: card.inventory
    });
    await Card.remove({
      _id: card._id
    });
  }
  return res.status(code).json({invalid: responseMessage});
}

/**
 * Create a fake res object for interacting with an endpoint without an http request
 * @return {{status: status, json: json}}
 */
function createFakeRes() {
  return {
    status: function(code) {
      this.code = code;
      return this;
    },
    json: function(jsonObject) {
      this.response = jsonObject;
      return this;
    }
  };
}

/**
 * Handle the creation of an inventory error
 * @param receipt Receipt
 * @param status Status
 * @param responseBodyCard Card which will return in the respons
 * @return {*}
 */
function handleCreateInventoryError(receipt, status, responseBodyCard) {
  if (receipt && status && (status === 400 || status === 500)) {
    let errorMessage;
    // Can't sell
    if (receipt.response && receipt.response.reason === 'noSmp') {
      errorMessage = 'Card violates sell limits'
    } else {
      // Create error
      errorMessage = receipt.response;
    }
    return handleLqNewError(res, responseBodyCard._id, receipt.code, errorMessage);
  }
  return false;
}

/**
Create a card
POST http://localhost:9000/api/lq/new
STATUS CODES:
 0: Sale proceeding as normal
 1: Sale status must be checked to see if sale was rejected
HEADERS
BODY
{
"number":"777775777675775476775577776657777",
"pin":"666",
"retailer":"5668fbff37226093139b90bd",
"userTime":"2016-09-10T20:34:50-04:00",
"balance": 3005,
"merchandise": true
}
RESPONSE
{
 "card": {
   "sellRate": "0.75",
   "_id": "588689835dbe802d2b0f6074",
   "number": "gewfwgegewqgewgwgewe",
   "retailer": "Adidas",
   "userTime": "2017-01-23T18:53:55.884Z",
   "merchandise": true,
   "balance": 300,
   "pin": null,
   "__v": 0,
   "buyAmount": "195.00",
   "soldFor": "225.00"
   "statusCode": "0",
   "status": "Sale proceeding"
 }
}

TEST CARDS:
NO PIN CODES

Adidas: 5668fbff37226093139b90d5
1000: Complete immediately: $0
5000: Complete immediately: $5

Nike: 5668fbff37226093139b9357
1000: Deferred: $0
5000: Deferred: $5
 */
export async function lqNewCard(req, res) {
  try {
    let responseBodyCard, dbCustomer, dbRetailer, card;
    let dbBiLog;
    let biComplete = false;
    const {number, pin, retailer, userTime, balance, callbackUrl = null, customer} = req.body;
    if (!pin) {
      req.body.pin = null;
    }
    const user = req.user;
    // Check for params
    if (!number || !retailer || !userTime || typeof balance !== 'number') {
      return handleLqNewError(res, null, 400, 'Include the following POST parameters: number, retailer, userTime, and balance');
    }
    // Check to see if this retailer requires a PIN
    dbRetailer = await Retailer.findById(retailer);
    if (dbRetailer.pinRequired && !(pin && pin.replace(/\s/g, '').length)) {
      return handleLqNewError(res, null, 400, `A PIN is required for ${dbRetailer.name}`);
    }
    /**
     * Test cards
     */
    // Sell immediately
    if (lqTestCards(res, retailer, number, userTime)) {
      return;
    }
    // Mock express res object
    const fakeRes = createFakeRes();
    // Mock req
    const fakeReq = {
      body: req.body,
      user: req.user
    };
    // Specific customer
    if (customer) {
      dbCustomer = await Customer.findById(customer);
    } else {
      dbCustomer = await Customer.findOne({
        stateId: 'API_Customer',
        company: user.company,
      });
    }
    // No customer, create generic
    if (!dbCustomer) {
      dbCustomer = await Customer.create(apiCustomerValues(user.company));
    }
    // Get company
    const company = await Company.findById(user.company);
    const companySettings = await company.getSettings();

    // Set store if store is undefined
    if(!req.user.store) {
      req.user.store = company.stores[0];
    }

    // Add customer to body
    fakeReq.body.customer = dbCustomer._id;
    try {
      // Create card
      const newCardResponse = await newCard(fakeReq, fakeRes);
      card = newCardResponse.response;
      if (!card.sellRate) {
        return handleLqNewError(res, null, 400, 'Card violates sell limits');
      }
    } catch (err) {

      await ErrorLog.create({
        method: 'lqNewCard',
        controller: 'lq.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err,
        user: req.user._id
      });

      return handleLqNewError(res, null, 400, 'Card has already been inserted into the database');
    }
    // Find BI log, if we have one
    dbBiLog = await BiRequestLog.findOne({
      number: card.number,
      pin: card.pin,
      retailerId: card.retailer._id
    });
    // If we have a BI log, attach card
    if (dbBiLog) {
      dbBiLog.card = card._id;
      dbBiLog = await dbBiLog.save();
      // Set verified balance on card
      if (typeof dbBiLog.balance === 'number') {
        biComplete = true;
        card.verifiedBalance = dbBiLog.balance;
      }
      // Create BI log if one doesn't exist
    } else {
      dbBiLog = await BiRequestLog.create({
        pin: card.pin,
        number: card.number,
        retailerId: card.retailer._id,
        card: card._id
      });
    }
    // Set buyAmount for this card
    card.buyAmount = formatFloat((card.sellRate - 0.1) * card.balance);
    card = await card.save();

    // Card for response
    responseBodyCard = Object.assign({}, card.toObject());
    responseBodyCard.retailer = card.retailer.name;
    responseBodyCard.sellRate = responseBodyCard.sellRate ? formatFloat(responseBodyCard.sellRate) : null;
    responseBodyCard.soldFor = responseBodyCard.soldFor ? formatFloat(responseBodyCard.soldFor) : null;
    delete responseBodyCard.customer;
    delete responseBodyCard.balanceStatus;
    delete responseBodyCard.buyRate;
    delete responseBodyCard.user;
    delete responseBodyCard.updates;
    delete responseBodyCard.valid;
    fakeReq.body = {
      cards: [card],
      receipt: true,
      userTime: req.body.userTime,
      callbackUrl
    };

    const userId = req.user._id;
    const companyId = req.user.company;

    if (!biComplete) {
      // Check one, if deferred, begin interval of checking request ID for 5 minutes
      await doCheckCardBalance(dbRetailer, responseBodyCard, userId, companyId, dbBiLog.requestId);
    }

    // Create inventory, get receipt
    const receipt = await addToInventory(fakeReq, fakeRes);
    // Unable to add to inventory
    if (receipt === false) {
      return;
    }
    const status = typeof receipt.status === 'number' ? receipt.status : receipt.code;
    // Unable to create inventory
    if (handleCreateInventoryError(receipt, status, responseBodyCard)) {
      return;
    }
    if (responseBodyCard.__v) {
      delete responseBodyCard.__v;
    }
    if (responseBodyCard.created) {
      delete responseBodyCard.created;
    }
    // Mark inventory as API
    let inventory = await Inventory.findById(receipt.response.inventories[0]);
    // @todo This error message is a lie. Fix me.
    if (!inventory) {
      return res.status(400).json({err: 'Card violates buy/sell limits'});
    }
    // Already have a balance
    if (biComplete) {
      inventory.verifiedBalance = dbBiLog.balance;
    }
    inventory.isApi = true;
    inventory = await inventory.save();

    // Determine who card is being sold to
    const sellTo = determineSellTo(dbRetailer, inventory.balance, companySettings);
    // No SMP available
    if (!sellTo) {
      return handleLqNewError(res, responseBodyCard._id, 400, 'Card violates sell limits');
    }

    // if saveya, tell them to check
    if (sellTo.smp.toLowerCase() === 'saveya') {
      responseBodyCard.statusCode = 1;
      responseBodyCard.status = 'Check required';
    } else {
      responseBodyCard.statusCode = 0;
      // Auto sell on or off
      if (inventory.proceedWithSale) {
        responseBodyCard.status = 'Sale proceeding';
      } else {
        responseBodyCard.status = 'Sale pending approval';
      }
    }

    responseBodyCard = decorateCardWithSaleStatuses(responseBodyCard, inventory);
    return res.json({card: formatCardResponse(responseBodyCard)});
  } catch (err) {
    console.log('**************ERR IN LQ NEW CARD**********');
    console.log(err);

    await ErrorLog.create({
      method: 'lqNewCard',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(400).json({
      invalid: 'An error has occurred.'
    });
  }
}

/**
 * Calculate transaction values
 * @param transactionTotal Transaction total
 * @param maxSpending Max amount allowed
 * @param cardValue Card value
 * @param payoutPercentage Payout percentage to merchant
 * @return {{amountDue: number, cardValue: number, merchantPayoutAmount: number}}
 */
function calculateTransactionValues(transactionTotal, maxSpending, cardValue, payoutPercentage) {
  let amountDue = 0;
  let newCardValue = 0;
  let merchantPayoutAmount = 0;
  // Calculate transaction data
  if (transactionTotal >= cardValue && cardValue <= maxSpending) {
    amountDue = formatFloat(transactionTotal - cardValue);
    newCardValue = 0;
    merchantPayoutAmount = formatFloat(payoutPercentage * cardValue);
  } else {
    amountDue = Math.max(0, transactionTotal - Math.min(maxSpending, cardValue));
    newCardValue = cardValue - Math.min(maxSpending, transactionTotal);
    merchantPayoutAmount = formatFloat(payoutPercentage * Math.min(maxSpending, cardValue, transactionTotal));
  }
  // Format nicely
  if (typeof newCardValue === 'number') {
    newCardValue = formatFloat(newCardValue);
  }
  if (typeof amountDue === 'number') {
    amountDue = formatFloat(amountDue);
  }
  if (typeof merchantPayoutAmount === 'number') {
    merchantPayoutAmount = formatFloat(merchantPayoutAmount);
  }
  return {amountDue: amountDue, cardValue: newCardValue, merchantPayoutAmount: merchantPayoutAmount};
}

/**
 * Create search params for bi log
 * @param body
 * @return {{number, pin, retailerId}}
 */
function getBiLogSearch(body) {
  // See if we have BI for this already
  const biLogSearch = {
    number: body.number,
    retailerId: body.retailer
  };
  if (body.pin) {
    biLogSearch.pin = body.pin;
  }
  return biLogSearch;
}

/**
 * Parse BI log
 * @param biRes
 * @returns {verifiedBalance: number, valid: boolean, finalized: boolean}
 */
function parseBiLog(biRes) {
  if (!biRes) {
    return {verifiedBalance: null, valid: null, finalized: false};
  }
  let verifiedBalance = null;
  const finalized = !!biRes.finalized;
  // Invalid card
  if (biRes.responseCode === config.biCodes.invalid) {
    return {verifiedBalance: 0, valid: false, finalized}
  }
  // See if we already have a balance
  if (biRes && biRes.balance) {
    try {
      verifiedBalance = parseFloat(biRes.balance);
    } catch (e) {
      verifiedBalance = null;
    }
  }
  // If we have a balance, return it
  if (!isNaN(verifiedBalance)) {
    return {verifiedBalance, valid: true, finalized};
  }
  return {verifiedBalance: null, valid: null, finalized}
}

function getAddToInventoryErrorResponse(response) {
  // Can't sell
  if (response && response.reason === 'noSmp') {
    // return res.status(code).json({invalid: 'Card violates sell limits'});
    return {invalid: 'Card violates sell limits'};
  } else {
    // addToInventoryResponse response
    // return res.status(code).json(response);
    return response;
  }
}

/**
 * Format the transaction response card
 * @param dbCard
 * @return {*}
 */
function formatResponseCard(dbCard) {
  dbCard.retailer = dbCard.retailer.name;
  dbCard.sellRate = formatFloat(dbCard.sellRate);
  dbCard.soldFor = formatFloat(dbCard.sellRate * dbCard.balance);
  delete dbCard.customer;
  delete dbCard.balanceStatus;
  delete dbCard.buyRate;
  delete dbCard.user;
  delete dbCard.updates;
  delete dbCard.valid;
  if (dbCard.__v) {
    delete dbCard.__v;
  }
  if (dbCard.created) {
    delete dbCard.created;
  }
  return dbCard;
}

/**
 Create a transaction for Vista
 POST http://localhost:9000/api/lq/transaction
 HEADERS
 BODY
 {
 "number":"421421412",
 "pin":"666",
 "retailer":"5668fbff37226093139b90bd",
 "userTime":"2016-09-10T20:34:50-04:00",
 "balance": 100,
 "merchandise": true,
 "transactionAmount": 300
 }
 */
export async function newTransaction(req, res) {
  let body = req.body;
  let dbCard;
  let dbRetailer;
  let transactionFinal;
  let verifiedBalance;
  let biValid;
  // Fake req, res
  let fakeRes, fakeReq;
  // BI response values
  let biResolved = false;
  // Vista transaction
  const {number, pin, balance, memo, transactionTotal, transactionId, merchandise, customerId,
          storeId, vmMemo1 = null, vmMemo2 = null, vmMemo3 = null, vmMemo4 = null, callbackUrl = null} = body;
  // Currently, we're ignoring '0000' PINs, at the request of Vista, since they require PINs on their side and are having
  // trouble changing their vaidation. So, 0000 means "no PIN"
  try {
    if (!pin || pin === '0000') {
      body.pin = null;
    }
    const user = req.user;

    // Get BI search values
    const biSearchValues = getBiLogSearch(body);

    // Check to see if we have a bi log
    let biRes = await BiRequestLog.findOne(biSearchValues);
    // See if we have a verified balance
    biRes = parseBiLog(biRes);
    verifiedBalance = biRes.verifiedBalance;
    biValid = biRes.valid;
    biResolved = biRes.finalized;

    // Mock express res object
    fakeRes = createFakeRes();
    // Mock req
    fakeReq = {
      body: body,
      user: req.user
    };

    let customerConstraint = {
      store: storeId,
      company: user.company
    };

    if (mongoose.Types.ObjectId.isValid(customerId)) {
      customerConstraint._id = customerId;
    } else {
      customerConstraint.email = customerId;
    }
    // Find transaction customer
    const dbCustomer = await Customer.findOne(customerConstraint);
    if (!dbCustomer) {
      return res.status(notFound.code).json(notFound.resFn('Customer'));
    }
    // Find company
    const dbCompany = await Company.findById(user.company);
    if (!dbCompany) {
      return res.status(notFound.code).json(notFound.resFn('Company'));
    }
    // Company settings
    const dbCompanySettings = await dbCompany.getSettings();
    // Find store
    const dbStore = await Store.findById(storeId).populate('companyId');
    if (!dbStore) {
      return res.status(notFound.code).json(notFound.resFn('Store'));
    } else if (dbStore.companyId._id.toString() !== req.user.company.toString()) {
      return res.status(notFound.code).json(notFound.resFn('store'));
    }

    fakeReq.body.customer = dbCustomer._id;
    const dbCard1 = await newCard(fakeReq, fakeRes);
    let thisCard = dbCard1.response;
    // Set VB if we have one
    if (verifiedBalance) {
      thisCard.verifiedBalance = verifiedBalance;
    }
    thisCard = await thisCard.save();
    // Get most recent log if we have one
    const logs = await BiRequestLog.find(biSearchValues).sort({created: -1});
    let log = null;
    if (logs) {
      log = logs[0];
    }
    thisCard = dbCard1.response;
    if (log) {
      log.card = thisCard._id;
      log = await log.save();
    } else {
      log = new BiRequestLog({
        pin: thisCard.pin,
        number: thisCard.number,
        retailerId: thisCard.retailer._id,
        card: thisCard._id
      });
      log = await log.save();
    }
    let dbBiLog = log;
    let card = dbCard1;
    if (card.response.error) {
      return res.status(400).json({
        invalid: 'Card has already been inserted into the database'
      });
    }
    // Retailer with merch values
    dbRetailer = card.response.retailer.populateMerchValues(card.response);
    // const retailer = card.response.retailer;
    card = card.response.toObject();
    card.balance = body.balance;
    card.buyAmount = formatFloat((card.sellRate - 0.1) * card.balance);
    card.retailer = dbRetailer;
    // Store retailer
    card.retailer = dbRetailer;

    /**
     * Transaction calculations
     */
      // NCC card value before transaction
    let nccCardValue = balance * dbStore.creditValuePercentage;

    const transactionValues = calculateTransactionValues(transactionTotal, dbStore.maxSpending, nccCardValue,
      dbStore.payoutAmountPercentage);

    transactionFinal = {
      memo,
      nccCardValue: transactionValues.cardValue,
      transactionTotal,
      transactionId,
      merchantPayoutAmount: transactionValues.merchantPayoutAmount,
      merchantPayoutPercentage: dbStore.payoutAmountPercentage,
      amountDue: transactionValues.amountDue,
      prefix: body.prefix,
      vmMemo1, vmMemo2, vmMemo3, vmMemo4,
      creditValuePercentage: dbStore.creditValuePercentage,
      maxSpending: dbStore.maxSpending
    };

    fakeReq.body = {
      cards: [card],
      receipt: true,
      userTime: body.userTime,
      // Transaction data
      transaction: transactionFinal,
      merchandise,
      store: dbStore,
      callbackUrl
    };

    const addToInventoryResponse = await addToInventory(fakeReq, fakeRes);
    if (addToInventoryResponse === false) {
      return;
    }
    if (config.debug) {
      console.log('**************ADD TO INVENTORY RES**********');
      console.log(addToInventoryResponse);
    }

    const status = typeof addToInventoryResponse.status === 'number' ? addToInventoryResponse.status : addToInventoryResponse.code;
    // Card rejected
    if (addToInventoryResponse && (status === 400 || status === 500)) {
      const errorRes = getAddToInventoryErrorResponse(addToInventoryResponse.response, addToInventoryResponse.code);
      return res.status(addToInventoryResponse.code).json(errorRes);
    }
    // Updated card
    let cardBeforeResponse = await Card.findById(card._id).populate('inventory');
    const cardBeforeResponseObject = cardBeforeResponse.toObject();
    let dbCard = Object.assign({}, cardBeforeResponseObject);
    dbCard = formatResponseCard(dbCard);
    let inventory = cardBeforeResponse.inventory;
    // let inventory = await Inventory.findById(addToInventoryResponse.response.inventories[0]);
    // Try to get verified balance
    if (!biResolved || typeof verifiedBalance !== 'number') {
      const card = Object.assign({}, dbCard);
      card.inventory = inventory;
      const userId = req.user._id;
      const companyId = req.user.company;
      // Check one, if deferred, begin interval of checking request ID for 5 minutes
      await doCheckCardBalance(dbRetailer, card, userId, companyId, dbBiLog.requestId, true);
    }

    inventory.isApi = true;
    inventory = await Inventory.findById(inventory._id);
    if (typeof verifiedBalance !== 'undefined' && verifiedBalance !== null) {
      inventory.verifiedBalance = verifiedBalance;
      await inventory.save();
      // If log is already finalized, then send the BI complete callback
      await (new Callback()).sendCallback(dbCard, 'biComplete');
    }
    inventory = await Inventory.findById(inventory._id);
    inventory = await inventory.save();
    const sellTo = determineSellTo(dbRetailer, inventory.balance, dbCompanySettings);
    if (!sellTo) {
      return res.status(400).json({invalid: 'Card violates sell limits'});
    }

    // if saveya, tell them to check
    if (sellTo.smp.toLowerCase() === 'saveya') {
      dbCard.statusCode = 1;
      dbCard.status = 'Check required';
    } else {
      dbCard.statusCode = 0;
      // Auto sell on or off
      if (inventory.proceedWithSale) {
        dbCard.status = 'Sale proceeding';
      } else {
        dbCard.status = 'Sale pending approval';
      }
    }

    // Display sell for
    dbCard.soldFor = sellTo.rate - dbCompanySettings.margin;
    dbCard = decorateCardWithSaleStatuses(dbCard, inventory, transactionFinal);
    return res.json({card: formatCardResponse(dbCard)});
  } catch (err) {
    console.log('**************ERR IN TRANSACTION**********');
    console.log(err);
    if (err instanceof SellLimitViolationException) {
      return res.status(400).json({err: 'Card violates sell limits'});
    }
    if (err) {
      console.log(err.stack);
    }
    let remove = false, cardToDelete;

    if (err === 'cardRejected') {
      // The promise chain above is already sending a response
      remove = true;
    }

    if (err === 'cardExists') {
      remove = true;
      return res.status(400).json({
        invalid: 'Card already exists in database'
      });
    }
    if (err === 'noSmp') {
      remove = true;
    }

    if (remove) {
      // Remove card and inventory
      Card.findById(dbCard._id)
      .then(card => {
        cardToDelete = card;
        return Inventory.remove({
          _id: card.inventory
        });
      })
      .then(() => {
        return Card.remove({
          _id: cardToDelete._id
        })
      });
      return;
    }

    await ErrorLog.create({
      method: 'newTransaction',
      controller: 'lq.controller',
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
 * Make fake req/res for internal requests
 * @param req
 */
function makeFakeReqRes(req) {
  // Mock express res object
  const fakeRes = {
    status: function(code) {
      this.code = code;
      return this;
    },
    json: function(jsonObject) {
      this.response = jsonObject;
      return this;
    }
  };
  // Mock req
  const fakeReq = {
    body: req.body,
    user: req.user
  };
  return [fakeReq, fakeRes];
}

/**
 * Create BI response message from a successful BI lookup
 * @param log
 * @param finalized
 * @return {{responseDateTime: *, responseCode: (string|string), request_id: *, balance: Number, responseMessage: string}}
 */
async function createBiResponse(log, finalized = true) {
  let responseMessage = 'success';
  if (log.responseCode === '900011') {
    responseMessage = 'Invalid card';
  } else if (log.responseCode === '010') {
    responseMessage = 'Delayed Verification Required';
  }
  const retailer = await Retailer.findById(log.retailerId);
  const balance = typeof log.balance === 'number' ? parseFloat(log.balance) : null;
  const response = {
    responseDateTime: log.responseDateTime,
    responseCode: log.responseCode,
    request_id: log.requestId,
    requestId: log.requestId,
    balance,
    responseMessage,
    retailer: retailer.name
  };
  if (!finalized) {
    response.recheckDateTime = log.recheckDateTime;
    response.recheck = log.recheck;
  }
}

/**
 * Parse a response from BI
 * @param log Log file
 * @param biRes BI Response
 */
async function parseBiResponse(log, biRes) {
  console.log('**************PARSE BI**********');
  console.log(biRes);
  log.requestId = biRes.request_id;
  log.responseDateTime = biRes.response_datetime;
  log.responseCode = biRes.responseCode;
  if (biRes.recheckDateTime) {
    log.recheckDateTime = biRes.recheckDateTime;
  }
  if (biRes.recheck) {
    log.recheck = biRes.recheck;
  }
  delete biRes.bot_statuses;
  delete biRes.request_id;
  delete biRes.verificationType;
  delete biRes.recheck;

  if (biRes.balance.toLowerCase() === 'null') {
    biRes.balance = null;
  } else {
    log.balance = biRes.balance;
  }
  log.save();
}

/**
 * Fake BI responses
 * @param retailer
 * @param number
 * @param res
 */
function fakeBi(retailer, number, res) {
  if (retailer === '5668fbff37226093139b912c') {
    if (number === '1000') {
      return res.json({
        "responseDateTime": moment().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889807",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '2000') {
      return res.json({
        "responseDateTime": moment().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889808",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '3000') {
      return res.json({
        "responseDateTime": moment().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889809",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '4000') {
      if (requestId) {
        return res.json({
          "responseDateTime": moment().format('Y-MM-DD HH:mm:ss.ms'),
          "responseCode": "000",
          "request_id": "11502131554644889810",
          "balance": 100,
          "responseMessage": "success"
        });
      } else {
        return res.json({
          "balance": "Null",
          "response_datetime": moment().format('Y-MM-DD HH:mm:ss.ms'),
          "responseMessage": "Delayed Verification Required",
          "requestId": "11502131554644889810",
          "responseCode": "010",
          "responseDateTime": moment().format('Y-MM-DD HH:mm:ss.ms'),
          "recheckDateTime": moment().add(1, 'hour').format('Y-MM-DD HH:mm:ss.ms')
        });
      }
    }
  }
}

/**
 * Check balance of a card
 *
ERROR:
{
 "error": "ERROR IN CHECK GIFTCARD BALANCE."
}
DEFER:
{
 "balance": "Null",
 "response_datetime": "2016-10-05 21:52:07.807075",
 "responseMessage": "Delayed Verification Required",
 "requestId": "17452881757755311094",
 "responseCode": "010",
 "responseDateTime": "2016-10-05 21:52:07.807075",
 "recheckDateTime": "2016-10-05 22:52:37.860233"
}
SUCCESS:
{
 "responseDateTime": "2016-10-05 21:55:11.940567",
 "responseCode": "000",
 "request_id": "11502131554644889807",
 "balance": 5.5,
 "responseMessage": "success"
}
 */
export async function bi(req, res) {
  const {number, pin, retailer, requestId, prefix} = req.body;
  let fakeReq, fakeRes;
  let dbLogs;
  let log = null;
  try {
    // Check for params
    if (!number || !pin || !retailer) {
      return res.status(400).json({
        invalid: 'Include the following POST parameters: number, pin, retailer'
      });
    }

    // Fake BI responses
    if (fakeBi(retailer, number, res)) {
      return;
    }

    const dbRetailer = await Retailer.findById(retailer);
    if (!dbRetailer) {
      return res.status(400).json({error: 'Retailer not found'});
    }
    if (!dbRetailer.gsId && !dbRetailer.aiId) {
      return res.status(400).json({error: `${dbRetailer.name.toUpperCase()} does not support balance inquiry`});
    }
    [fakeReq, fakeRes] = makeFakeReqRes(req);
    // Select correct BI ID
    fakeReq.body = {retailer: dbRetailer._id.toString(), number, pin, requestId};
    dbLogs = await BiRequestLog.find({
      number,
      pin,
      retailerId: retailer
    }).sort({created: -1});
    log = null;
    if (dbLogs.length) {
      log = dbLogs[0];
    }
    // Finalized log
    if (log) {
      if (log.finalized) {
        return res.json(await createBiResponse(log));
        // Don't initiate another request for 12 hours
      } else if (moment().subtract(12, 'hours') < moment(log.created)) {
        // return res.json(await createBiResponse(log, false));
      }
    }
    // Create new log
    log = new BiRequestLog({
      number,
      pin,
      retailerId: retailer
    });
    // Save user to log
    if (req && req.user && req.user._id) {
      log.user = req.user._id;
    }
    if (prefix) {
      log.prefix = prefix;
    }
    log = await log.save();
    console.log('**************1**********');
    // Initiate balance check
    const biRes = await checkBalance(fakeReq, fakeRes);
    console.log('**************2**********');
    console.log(biRes);
    if (!biRes) {
      return res.status(500).json({err: 'Unable to perform balance check'});
    }
    let response = {};
    if (biRes) {
      response = typeof biRes.response !== 'undefined' && biRes.response.constructor.name === 'Object' ? biRes.response : biRes;
    }
    try {
      parseBiResponse(log, response);
    } catch (e) {

      await ErrorLog.create({
        method: 'bi',
        controller: 'lq.controller',
        revision: getGitRev(),
        stack: e.stack,
        error: e,
        user: req.user._id
      });
    }
    // Update BI log
    _.forEach(response, (val, prop) => {
      log[prop] = val;
    });
    await log.save();
    return res.json(response);
  } catch (err) {
    console.log('**************ERR IN BI**********');
    console.log(err);

    await ErrorLog.create({
      method: 'bi',
      controller: 'lq.controller',
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
 * Send a callback based on a user's company settings
 * @param log BI log
 * @param userId
 * @param callbackType
 * @return {Promise.<void>}
 */
async function sendCallbackFromCompanySettings(log, userId = '', callbackType) {
  const user = await User.findOne(userId);
  const companyId = user.company;
  const company = await Company.findById(companyId);
  const settings = await company.getSettings();
  if (settings.callbackUrl) {
    await (new Callback()).sendCallback(log, callbackType, settings.callbackUrl);
  }
}

/**
 * Finalize card and inventory attached to log
 * @param log BI log
 * @param valid Card is valid
 * @param balance Balance (or 0 for invalid)
 */
async function finalizeLogCardAndInventory(log, valid, balance) {
  if (config.debug) {
    console.log('**************FINALIZE CARD AND INVENTORY**********');
    console.log(log);
  }
  if (log.card && (typeof log.card === 'string' || log.card.constructor.name === 'ObjectID')) {
    log = await BiRequestLog.findById(log._id).populate(logPopulationValues);
  }
  // Set card
  if (log.card && log.card.constructor.name === 'model') {
    // Resend card if balance changes
    const resend = log.card.verifiedBalance !== balance;
    log.card.valid = valid;
    log.card.verifiedBalance = balance;
    log.card.inventory.verifiedBalance = balance;
    await log.card.save();
    await log.card.inventory.save();
    // Callback on a card
    await (new Callback()).sendCallback(log.card, 'biComplete', null, resend);
    // Set inventory values
    if (log.card.inventory && !(log.card.inventory.rejected || log.card.inventory.credited)) {
      if (log.card.inventory.constructor.name !== 'model') {
        if (_.isPlainObject(log.card.inventory)) {
          log.card.inventory = await Inventory.findById(log.card.inventory._id);
        } else if (log.card.inventory.constructor.name === 'ObjectID' || typeof log.card.inventory === 'string') {
          log.card.inventory = await Inventory.findById(log.card.inventory);
        }
      }
      log.card.inventory.valid = valid;
      log.card.inventory.verifiedBalance = balance;
      await log.card.inventory.save();
    }
    return await BiRequestLog.findById(log._id).populate(logPopulationValues);
  // No card, just send to company callback URL
  } else {
    if (log.user) {
      await sendCallbackFromCompanySettings(log, log.user, 'balanceCB');
    }
  }
  return log;
}

/**
 * Complete cards and inventories associated with logs
 * @param log Bi log
 * @param invalid
 * @param balance
 * @return {Promise.<*>}
 */
async function completeCardAndInventory(log, invalid, balance) {
  const promises = [];
  if (config.debug) {
    console.log('**************COMPLETE CARD**********');
    console.log(log);
  }
  // Invalid
  if (invalid) {
    log = await finalizeLogCardAndInventory(log, false, 0);
    // Valid
  } else {
    log = await finalizeLogCardAndInventory(log, true, balance);
  }
  if (config.debug) {
    console.log('**************COMPLETE CARD 2**********');
    console.log(log);
  }
  // Save card
  if (log.card) {
    promises.push(log.card.save());
    // Save inventory
    if (log.card.inventory) {
      return await log.card.inventory.save();
    }
  }
}

/**
 * Complete bi logs
 * @param log BiRequestLog
 * @param invalid Card is invalid
 * @param balance Balance
 * @param requestId Request ID
 * @param fixed If a card has a VB that is being "fixed" (set incorrectly, then updated)
 * @return {Promise.<*>}
 */
async function completeBiLog(log, invalid, balance, requestId, fixed) {
  if (requestId === 'test') {
    requestId = null;
  }
  log.verificationType = 'PJVT_BOT';
  log.responseDateTime = moment().format('YYYY-MM-DD');
  log.finalized = true;
  log.fixed = fixed;
  // Success
  if (typeof balance === 'number' && !invalid) {
    log.balance = balance;
    log.responseCode = '000';
    log.responseMessage = 'success';
    // Invalid card
  } else {
    log.balance = null;
    log.responseCode = '900011';
    log.responseMessage = 'invalid card';
  }
  // Fill in request ID
  if (requestId && !log.requestId) {
    log.requestId = requestId;
  }
  return await log.save();
}

/**
 * Values with which to populate logs
 * @type {{path: string, populate: [*]}}
 */
const logPopulationValues = {
  path: 'card',
  populate: [{
    path: 'inventory',
    model: 'Inventory',
    // Does this work?
    populate: [{
      path: 'company',
      model: 'Company'
    }, {
      path: 'retailer',
      model: 'Retailer'
    }, {
      path: 'store',
      model: 'Store'
    }]
  }],
};

/**
 * Create a new BI log if balance changes, or an initial BI log
 * @param number
 * @param pin
 * @param retailer
 * @param balance
 * @return {Promise.<*>}
 */
async function createBiLogAsPartOfCompletion(number, pin, retailer, balance) {
  // See if we can find a card associated with this log
  const findParams = {
    number, pin
  };
  const cardFindParams = Object.assign(findParams, {retailer: retailer._id});
  const biFindParams = Object.assign(findParams, {retailerId: retailer._id});
  let card = await Card.findOne(cardFindParams);
  cardFindParams.retailerId = retailer._id;
  delete cardFindParams.retailer;
  const originalLog = await BiRequestLog.findOne(biFindParams).sort({created: -1});

  // Create log
  if (!originalLog || (typeof originalLog.balance === 'number' && originalLog.balance !== balance)) {
    const newLogVals = {
      pin,
      number,
      retailerId: retailer._id,
      balance
    };
    if (card) {
      newLogVals.card = card._id;
    }
    let newLog = new BiRequestLog(newLogVals);
    if (config.debug) {
      console.log('**************NEW LOG**********');
      console.log(newLog);
    }
    // Reattach card
    if (card) {
      newLog.card = card;
    }
    return await newLog.save();
  }
  return await BiRequestLog.findOne(biFindParams).populate(logPopulationValues);
}

/**
 * BI completed
 */
export async function biCompleted(req, res) {
  try {
    let dbCompanySettings = null;
    let dbLogs;
    let dbLog;
    const key = req.get(config.biCallbackKeyHeader);
    let dbRetailer;
    // Make sure that we have the right key for callback
    if (key !== config.biCallbackKey) {
      return res.status(401).send('Unauthorized');
    }
    const {retailerId, number, pin} = req.body;
    let balance = 0;
    if (req.body.balance) {
      balance = parseFloat(req.body.balance);
    }
    // fixed is used for fixing VBs which got screwed up, only those previously inserted
    let fixed = !!req.body.fixed || false;
    let invalid = false;
    if (typeof req.body.invalid === 'number') {
      invalid = !!req.body.invalid;
    }
    const {requestId} = req.params;
    // Need balance and invalid
    if (typeof invalid === 'undefined' || typeof balance === 'undefined' || typeof retailerId === 'undefined') {
      return res.status(400).json({err: "'invalid', 'balance', and 'retailerId' must be included in the request"});
    }
    // Find by number and pin by default
    const findByNumber = {number};
    if (pin) {
      findByNumber.pin = pin;
    }
    // Get most recent log
    dbLogs = await BiRequestLog.find({
      $or: [{
        requestId
      }, findByNumber]
    })
    .sort({created: -1})
    .limit(1)
    .populate(logPopulationValues);
    // Most recent log if we have one
    if (dbLogs.length) {
      dbLog = dbLogs[0];
    }
    // Get retailers
    dbRetailer = await Retailer.findOne({$or: [
      {
        gsId: retailerId
      },
      {
        aiId: retailerId
      }]});
    // Retailer does not exist
    if (!dbRetailer) {
      return res.status(404).json({err: 'Retailer not found'});
    }

    // No log, so create one
    if (!dbLog) {
      dbLog = await createBiLogAsPartOfCompletion(number, pin, dbRetailer, balance);
      // Create a new log if the balance has changed
    } else if (typeof dbLog.balance === 'number' && dbLog.balance !== balance) {
      dbLog = await createBiLogAsPartOfCompletion(number, pin, dbRetailer, balance);
    }
    // If we have a previously completed log, see if we need to make a new one
    dbLog = await completeBiLog(dbLog, invalid, balance, requestId, fixed);
    // Complete card, send callback, etc
    await completeCardAndInventory(dbLog, invalid, balance);
    // Find logs
    dbLog = await BiRequestLog.findById(dbLog._id)
    .populate(logPopulationValues);
    // Get settings if we have an inventory
    if (dbLog.card && dbLog.card.inventory && dbLog.card.inventory.company) {
      dbCompanySettings = await dbLog.card.inventory.company.getSettings();
    }
    // Finalize transactions if we have a card associated with the log
    if (dbLog.card && dbLog.card.inventory && dbLog.card.inventory.isTransaction) {
      const inventory = dbLog.card.inventory;
      let transaction = inventory.transaction;
      const nccCardValue = balance * transaction.creditValuePercentage;
      // Recalculate transaction values
      transaction = calculateTransactionValues(transaction.transactionTotal, transaction.maxSpending, nccCardValue,
        transaction.merchantPayoutPercentage);
      // New transaction
      inventory.transaction = Object.assign(inventory.transaction, transaction);
      inventory.transaction.nccCardValue = transaction.cardValue;
      // Verified balance has been received
      inventory.hasVerifiedBalance = true;
      await inventory.save();
      if (dbLog.card && dbLog.card.inventory && dbLog.card.inventory.isTransaction && dbCompanySettings) {
        await finalizeTransactionValues([dbLog.card.inventory], dbCompanySettings);
      }
    }
    return res.json({});
  } catch (err) {
    console.log('**************COMPLETE BI ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'biCompleted',
      controller: 'lq.controller',
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
 * Fake card status values
 * @param cardId Incoming card ID
 * @return {*}
 */
function fakeCardStatus(cardId) {
  if (cardId.indexOf(config.testCardBegin) !== -1) {
    if (cardId === testCard1) {
      return {
        "created": "2017-01-23T15:07:00-05:00",
        "lastFour": "1000",
        "pin": null,
        "status": "Not shipped",
        "claimedBalance": 100,
        "verifiedBalance": 0,
        "soldFor": 0,
        "sellRate": 0.75,
        "reconciled": false,
        "retailer": "Adidas",
        "saleConfirmed": true,
        "saleAccepted": true,
        "saleVerified": false,
        "saleFinal": false,
        "claimedBalanceInaccurate": false
      };
    } else if (cardId === testCard2) {
      return {
        "created": "2017-01-23T15:07:00-05:00",
        "lastFour": "1000",
        "pin": null,
        "status": "Not shipped",
        "claimedBalance": 100,
        "verifiedBalance": 100,
        "soldFor": 75,
        "sellRate": 0.75,
        "reconciled": false,
        "retailer": "Adidas",
        "saleConfirmed": true,
        "saleAccepted": true,
        "saleVerified": false,
        "saleFinal": false,
        "claimedBalanceInaccurate": false
      };
    } else if (cardId === testCard3) {
      return {
        "created": "2017-01-23T15:07:00-05:00",
        "lastFour": "1000",
        "pin": null,
        "status": "Not shipped",
        "claimedBalance": 100,
        "verifiedBalance": 100,
        "soldFor": 75,
        "sellRate": 0.75,
        "reconciled": false,
        "retailer": "Adidas",
        "saleConfirmed": false,
        "saleAccepted": true,
        "saleVerified": false,
        "saleFinal": false,
        "claimedBalanceInaccurate": false
      };
    } else if (cardId === testCard4) {
      return {
        "created": "2017-01-23T15:07:00-05:00",
        "lastFour": "1000",
        "pin": null,
        "status": "Not shipped",
        "claimedBalance": 100,
        "verifiedBalance": 0,
        "soldFor": 0,
        "sellRate": 0.75,
        "reconciled": false,
        "retailer": "Adidas",
        "saleConfirmed": true,
        "saleAccepted": true,
        "saleVerified": false,
        "saleFinal": false,
        "claimedBalanceInaccurate": false
      };
    }
  }
  return false;
}

/**
 * Get card status after sale
 GET http://localhost:9000/api/lq/status/:cardId
 GET http://localhost:9000/api/lq/status/begin/:begin/end/:end
 GET http://localhost:9000/api/lq/status/begin/:begin
 GET http://localhost:9000/api/lq/status/end/:end
 HEADERS
 Params
 {
 "cardId":"57ffbdd5283e93464809c84b",
 "begin":"2016-11-18T18:03:46-05:00", (optional param, format ISO 8601)
 "end":"2016-11-18T18:03:46-05:00" (optional param, format ISO 8601)
 }
 RESPONSE
 {
  "created": "2016-10-13T20:34:50-04:00",
  "lastFour": "2053",
  "pin": "3313",
  "status": "Received by CQ",
  "claimedBalance": 300,
  "verifiedBalance": 53,
  "soldFor": 36.84,
  "sellRate": 0.695,
  "reconciled": false
}
 */
export async function getCardStatus(req, res) {
  try {
    const {cardId} = req.params;
    const userTime = formatDateParams(req.params, res);
    // Validate card ID
    if (cardId) {
      if (cardId.indexOf(config.testCardBegin) === -1 && !mongoose.Types.ObjectId.isValid(cardId)) {
        return res.status(400).json({error: 'Invalid card ID'});
      }
    }
    let search;
    const user = req.user;
    if (cardId) {
      // Test cards
      const testVal = fakeCardStatus(cardId);
      if (testVal) {
        return res.json(testVal);
      }
      Card.findOne({
        _id: cardId,
        user: user._id
      })
      .populate('inventory')
      .populate('retailer')
      .then(card => {
        if (!card) {
          return res.status(400).json({error: 'Card not found'});
        }

        card = card.toObject();
        const inventory = card.inventory;
        // No inventory
        if (!inventory) {
          return res.status(500).json({error: "Card data invalid"});
        }

        card.saleConfirmed = !(inventory.smp === '1' && inventory.saveYa && !inventory.saveYa.confirmed);

        card = formatCardStatusResults(card);
        card = decorateCardWithSaleStatuses(Object.assign(card, {balance: card.claimedBalance}), inventory);
        delete card.balance;

        return res.json(card);
      });
    } else {
      const query = {
        user: user._id,
      };
      if (userTime) {
        query.userTime = userTime;
      }
      search = Card.find(query)
      .populate('inventory')
      .populate('retailer')
      .sort({
        userTime: -1
      })
      .then(cards => {
        let processedCards = [];

        cards.forEach(card => {
          card = card.toObject();
          const inventory = card.inventory;

          if (! inventory) {
            return;
          }

          card.saleConfirmed = !(inventory.smp === '1' && inventory.saveYa && !inventory.saveYa.confirmed);

          card = formatCardStatusResults(card);
          card = decorateCardWithSaleStatuses(
            Object.assign(card, {balance: card.claimedBalance}), inventory
          );
          delete card.balance;

          processedCards.push(card);
        });

        res.json(processedCards);
      });
    }
  } catch(e) {
    console.log('**************ERROR**********');
    console.log(e);
    if (e === 'invalidBegin' || e === 'invalidEnd') {
      return;
    }

    await ErrorLog.create({
      method: 'getCardStatus',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: e.stack,
      error: e,
      user: req.user._id
    })
      .then(()=> {
        return res.status(500).json({
          invalid: 'An error has occurred.'
        });
      });
  }
}

/**
 * Format date params when searching cards
 * @param params
 * @param res
 */
function formatDateParams(params, res) {
  let {begin, end} = params;
  let userTime;
  if (begin) {
    begin = moment(begin);
    if (begin.isValid()) {
      userTime = {
        $gt: begin.format()
      };
    } else {
      res.status(400).json({error: 'Invalid begin date'});
      throw 'invalidBegin';
    }
  }
  if (end) {
    end = moment(end);
    if (end.isValid()) {
      if (!userTime) {
        userTime = {};
      }
      userTime.$lt = end.format();
    } else {
      res.status(400).json({error: 'Invalid end date'});
      throw 'invalidEnd';
    }
  }
  return userTime;
}

/**
 * Format results when getting card statuses
 * @param card Single card to format
 */
function formatCardStatusResults(card) {
  try {
    let status;
    if (typeof card.toObject === 'function') {
      card = card.toObject();
    }
    switch (card.inventory.activityStatus) {
      case 'shipped':
        status = 'Shipped to CQ';
        break;
      case 'receivedCq':
      case 'sentToSmp':
      case 'receivedSmp':
        status = 'Received by CQ';
        break;
      case 'rejected':
        status = 'Rejected';
        break;
      default:
        status = 'Not shipped';
    }
    const displaySellRate = formatFloat(card.inventory.liquidationRate - card.inventory.margin);
    let balanceForCalculations;
    balanceForCalculations = card.inventory.verifiedBalance ? card.inventory.verifiedBalance : card.inventory.balance;
    let soldFor = balanceForCalculations * displaySellRate;
    if (isNaN(soldFor)) {
      soldFor = 0;
    }
    const saleFinal = !!card.inventory.cqAch;
    return {
      _id: card._id,
      created: moment(card.userTime).format(),
      lastFour: card.number.substring(card.number.length - 4),
      pin: card.pin,
      status,
      claimedBalance: card.balance,
      verifiedBalance: saleFinal ? (card.inventory.verifiedBalance || card.inventory.balance) : (card.inventory.verifiedBalance || null),
      soldFor: formatFloat(soldFor),
      sellRate: displaySellRate,
      reconciled: !!card.inventory.reconciliation,
      retailer: card.retailer.name,
      saleConfirm: card.saleConfirmed
    };
  } catch(e) {
    e = e.toString();
    console.log('**************ERR IN LQ FORMATCARDSTATUSRESULTS**********');
    console.log(e);
    switch (true) {
      // Retailer missing
      case /name/.test(e):
        card.retailer = {};
        return formatCardStatusResults(card);
      // Number missing
      case /substring/.test(e):
        card.number = null;
        return formatCardStatusResults(card);
      // Pin
      case /pin/.test(e):
        card.pin = null;
        return formatCardStatusResults(card);
      // Inventory error
      case /(verifiedBalance|reconciliation)/.test(e):
        card.inventory = {};
        return formatCardStatusResults(card);
      // Sold for
      case /toFixed/.test(e):
        card.soldFor = 0;
        return formatCardStatusResults(card);
      default:
        throw new Error({error: 'unknown'});
    }
  }
}

/**
 * Add card to reconciliation
 PATCH http://localhost:9000/api/lq/reconcile
 HEADERS
 BODY
 {
 "cardId":"57ffbdd5283e93464809c84b",
 "userTime":"2016-09-10T20:34:50-04:00",
 }
 RESPONSE 200
 */
export function reconcile(req, res) {
  const {cardId, userTime} = req.body;
  let card;
  if (!cardId || !userTime) {
    return res.status(400).json({
      invalid: 'Include the following POST parameters: cardId, userTime'
    });
  }
  Card.findOne({
    _id: cardId,
    user: req.user._id
  })
  .populate('inventory')
  .then(dbCard => {
    if (!dbCard) {
      return res.status(403).json({error: 'Card not found'});
    }
    if (dbCard.reconciliation) {
      return res.status(400).json({error: 'Card already reconciled'});
    }
    card = dbCard;
    const reconciliation = new Reconciliation({
      userTime,
      inventory: card.inventory._id
    });
    return reconciliation.save();
  })
  .then(reconcilation => {
    if (!reconcilation) {
      return;
    }
    card.inventory.reconciliation = reconcilation._id;
    return card.inventory.save();
  })
  .then(card => {
    if (!card) {
      return;
    }
    res.status(200).json();
  });
}

/**
 * @todo Return company reserve
 * @return {number}
 */
export function getCompanyReserve(req, res) {
  return 100;
}

/**
 * Get company settings
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/company/:companyId/settings
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
Params
{
"companyId": "56637dd6295c4d131c901ba1"
}
Response
{
"cardType": "electronic",
"autoSell": true,
"minimumAdjustedDenialAmount": 0.1,
"biOnly": true
}
 */
export function getCompanySettings(req, res) {
  const {companyId} = req.params;
  let dbCompany;

  Company.findById(companyId)
  .then(company => {
    dbCompany = company;
    return company.getSettings();
  })
  .then(settings => {
    return res.json({
      cardType: settings.cardType || 'both',
      autoSell: settings.autoSell,
      minimumAdjustedDenialAmount: settings.minimumAdjustedDenialAmount,
      biOnly: settings.biOnly || false,
      customerDataRequired: settings.customerDataRequired,
      reserveTotal: dbCompany.reserveTotal,
      callbackUrl: settings.callbackUrl
    });
  })
  .catch(async err => {

    await ErrorLog.create({
      method: 'getCompanySettings',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 *Update company settings
PATCH http://gcmgr-staging.cardquiry.com:9000/api/lq/company/:companyId/settings
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
Params
{
"companyId": "56637dd6295c4d131c901ba1"
}
Body
{
"cardType": "electronic",
"autoSell": true,
"minimumAdjustedDenialAmount": 0.1,
"biOnly": true,
"customerDataRequired": true,
"callbackUrl": "www.testcall.com"
}
Response
200
 */
export function updateCompanySettings(req, res) {
  const {companyId} = req.params;
  const body = req.body;

  Company.findById(companyId)
  .then(company => {
    return company.getSettingsObject();
  })
  .then(settings => {
    ['cardType', 'autoSell', 'biOnly', 'customerDataRequired', 'minimumAdjustedDenialAmount', 'callbackUrl'].forEach(attr => {
      if (typeof body[attr] !== 'undefined') {
        settings[attr] = body[attr];
      }
    });

    return settings.save();
  })
  .then(settings => {
    return res.json({
      cardType: settings.cardType || 'both',
      autoSell: settings.autoSell,
      biOnly: settings.biOnly || false,
      minimumAdjustedDenialAmount: settings.minimumAdjustedDenialAmount,
      customerDataRequired: settings.customerDataRequired,
      callbackUrl: settings.callbackUrl
    });
  })
  .catch(async err => {

    await ErrorLog.create({
      method: 'updateCompanySettings',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 * Mark a card for sale
 PATCH http://gcmgr-staging.cardquiry.com:9000/api/lq/card/:cardId/proceed-with-sale
 HEADERS
 Accept: application/json
 Content-Type: application/json
 Authorization: bearer <token>
 Params
 {
 "cardId": "5668fbff37229093139b93d1"
 }
 Response
 200
 */
export function proceedWithSale(req, res) {
  const {cardId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({error: 'Invalid card ID'});
  }

  Card.findById(cardId)
  .populate('inventory')
  .then(card => {
    if (!card) {
      throw 'notFound';
    }
    const inventory = card.inventory;
    inventory.proceedWithSale = true;
    return inventory.save();
  })
  .then(() => res.json())
  .catch(async err => {
    if (err === 'notFound') {
      return res.status(400).json({error: 'Card not found'});
    }

    console.log('*******************ERR IN PROCEEDWITHSALE*******************');
    console.log(err);

    await ErrorLog.create({
      method: 'proceedWithSale',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 * Get customers for this store
 */
export function getStoreCustomers(req, res) {
  req.params.store = req.params.storeId;
  return getCustomersThisStore(req, res);
}

/**
 * Search customers
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/customers/search/:customerName
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
Params
{
"customerName": "Blah"
}
RESULT:
[
 {
   "_id": "56cca6cf780b493151881a58",
   "fullName": "Blah Blah Blah",
   "state": "AR",
   "company": "56637dd6295c4d131c901ba1",
   "firstName": "Blah",
   "middleName": "Blah",
   "lastName": "Blah",
   "stateId": "53532523",
   "phone": "513-404-7626",
   "address1": "1",
   "address2": "1",
   "city": "1",
   "zip": "44444",
   "systemId": "444444",
   "__v": 0,
   "credits": [],
   "rejections": [
     "57e891c5cc40659d2804d9f9",
     "57e8948ecc40659d2804da09",
     "573dff03dcd0429650cb27dc"
   ],
   "edits": [],
   "store": [],
   "rejectionTotal": 0,
   "created": "2016-02-23T18:37:03.876Z",
   "id": "56cca6cf780b493151881a58"
 },
 ...
]
 */
export function searchCustomers(req, res) {
  req.query.name = req.params.customerName;

  return searchCustomersCustomerController(req, res);
}

/**
 * Get a specific customer
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/customers/:customerId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
Params
{
 "customerId": "56cca6cf780b493151881a58"
}
RESULT:
{
 "_id": "56cca6cf780b493151881a58",
 "fullName": "Blah Blah Blah",
 "state": "AR",
 "company": "56637dd6295c4d131c901ba1",
 "firstName": "Blah",
 "middleName": "Blah",
 "lastName": "Blah",
 "stateId": "53532523",
 "phone": "513-404-7626",
 "address1": "1",
 "address2": "1",
 "city": "1",
 "zip": "44444",
 "systemId": "444444",
 "__v": 0,
 "credits": [],
 "rejections": [
   "57e891c5cc40659d2804d9f9",
   "57e8948ecc40659d2804da09",
   "573dff03dcd0429650cb27dc"
 ],
 "edits": [],
 "store": [],
 "rejectionTotal": 0,
 "created": "2016-02-23T18:37:03.876Z",
 "id": "56cca6cf780b493151881a58"
}
  */
export function getCustomer(req, res) {
  const {customerId} = req.params;
  const company = req.user.company;

  if (mongoose.Types.ObjectId.isValid(customerId)) {
    Customer.findOne({_id: customerId, company}).then(customer => {
      // Not found
      if (!customer) {
        return res.status(404).json();
      }

      return res.json(customer);
    });
  } else {
    return res.status(invalidObjectId.code).json(invalidObjectId.res);
  }
}

/**
 * Delete a customer
 */
export function deleteCustomer(req, res) {
  Customer.findById(req.params.customerId)
  .then(customer => {
    // No customer
    if (!customer) {
      res.status(notFound.code).json(notFound.res);
      throw notFound;
    }
    customer.enabled = false;
    return customer.save();
  })
  .then(() => res.json())
  .catch(async e => {
    if (e === notFound) {
      return;
    }

    await ErrorLog.create({
      method: 'deleteCustomer',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: e.stack,
      error: e,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  })
}

/**
 * Create a new customer
POST http://gcmgr-staging.cardquiry.com:9000/api/lq/customers
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
BODY
{
  "state": "AL",
  "firstName": "John",
  "middleName": "Q",
  "lastName": "Public",
  "stateId": "1ABC",
  "phone": "111-879-8765",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "zip": "35005",
  "systemId": "1148832"
}
RESULT
{
  "__v": 0,
  "fullName": "John Q Public",
  "company": "56637dd6295c4d131c901ba1",
  "state": "AL",
  "firstName": "John",
  "middleName": "Q",
  "lastName": "Public",
  "stateId": "1ABC",
  "phone": "111-879-8765",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "zip": "35005",
  "systemId": "1148832",
  "_id": "59079ad0565cb21e5458e894",
  "credits": [],
  "rejections": [],
  "edits": [],
  "store": [],
  "rejectionTotal": 0,
  "created": "2017-05-01T20:30:08.440Z",
  "id": "59079ad0565cb21e5458e894"
}
 */
export function newCustomer(req, res) {
  req.user.store = req.params.storeId;
  req.body.store = req.params.storeId;
  return newCustomerCustomerController(req, res);
}

/**
 * Update a customer
PATCH http://gcmgr-staging.cardquiry.com:9000/api/lq/customers/:customerId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
Params
{
  "customerId": "56cca6cf780b493151881a58"
}
BODY
{
  "state": "AL",
  "firstName": "John",
  "middleName": "Q",
  "lastName": "Public",
  "stateId": "1ABC",
  "phone": "111-879-8765",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "zip": "35005",
  "enabled": true
}
RESULT
200
 */
export function updateCustomer(req, res) {
  return updateCustomerCustomerController(req, res);
}

/**
 * Create a new store
POST http://gcmgr-staging.cardquiry.com:9000/api/lq/stores
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
BODY
{
  "name": "New Store",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "state": "AL",
  "zip": "35005",
  "contact": {
    "firstName": "John",
    "role": "employee",
    "lastName": "Public",
    "email": "johnq@public.com",
    "password": "123456"
  },
  "creditValuePercentage": 1.1,
  "maxSpending": 30,
  "payoutAmountPercentage": 0.2
}
RESULT
{
  "_id": "56cca6cf780b493151881a59"
}
*/
export function createStore(req, res) {
  req.body.companyId = req.user.company;
  return newStore(req, res);
}

/**
 * Update a store
PATCH http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59"
}
BODY
{
  "name": "New Store",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "state": "AL",
  "zip": "35005",
  "phone": "111-555-8888",
  "creditValuePercentage": 120,
  "maxSpending": 50,
  "payoutAmountPercentage": 35
}
RESULT
{
  "_id":"56cca6cf780b493151881a59",
  "name": "New Store",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "state": "AL",
  "zip": "35005",
  "phone": "111-555-8888",
  "companyId": "56637dd6295c4d131c901ba1",
  "reconciledTime": "2017-05-02T22:33:23.191Z",
  "created": "2015-12-07T03:57:47.461Z",
  "creditValuePercentage": 120,
  "maxSpending": 50,
  "payoutAmountPercentage": 35
}
*/
export function updateStore(req, res) {
  req.body.storeId = req.params.storeId;

  // Prevents them from being able to change the companyId.
  // This attribute should be ignored in the future.
  if (req.body.companyId) {
    req.body.companyId = req.user.company;
  }

  return updateStoreCompanyController(req, res);
}

/**
 * Retrieve all stores
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/stores
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
RESULT
[
  {
    "_id":"56cca6cf780b493151881a59",
    "name": "New Store",
    "address1": "123 Abc Street",
    "address2": "Ct. #100",
    "city": "Adamsville",
    "state": "AL",
    "zip": "35005",
    "phone": "111-555-8888",
    "companyId": "56637dd6295c4d131c901ba1",
    "reconciledTime": "2017-05-02T22:33:23.191Z",
    "created": "2015-12-07T03:57:47.461Z",
    "creditValuePercentage": 120,
    "maxSpending": 50,
    "payoutAmountPercentage": 35
    "users": [
      {
        "_id": "590bb39363f76f1aab9cb717",
        "store": "56cca6cf780b493151881a59",
        "firstName": "John",
        "lastName": "Public",
        "email": "johnq@public.com",
        "__v": 0,
        "company": "56637dd6295c4d131c901ba1",
        "created": "2017-05-04T23:04:51.694Z",
        "role": "employee",
        "profile": {
          "lastName": "Public",
          "firstName": "John",
          "email": "johnq@public.com",
          "_id": "590bb39363f76f1aab9cb717"
        },
        "token": {
          "role": "employee",
          "_id": "590bb39363f76f1aab9cb717"
        },
        "fullName": "John Public",
        "id": "590bb39363f76f1aab9cb717"
      }
    ]
  },
  ...
]
*/
export function getStores(req, res) {
  req.params.companyId = req.user.company;
  return getStoresCompanyController(req, res);
}

/**
 * Retrieve a store
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59"
}
RESULT
{
  "_id":"56cca6cf780b493151881a59",
  "name": "New Store",
  "address1": "123 Abc Street",
  "address2": "Ct. #100",
  "city": "Adamsville",
  "state": "AL",
  "zip": "35005",
  "phone": "111-555-8888",
  "companyId": "56637dd6295c4d131c901ba1",
  "reconciledTime": "2017-05-02T22:33:23.191Z",
  "created": "2015-12-07T03:57:47.461Z",
  "creditValuePercentage": 120,
  "maxSpending": 50,
  "payoutAmountPercentage": 35
  "users": [
    {
      "_id": "590bb39363f76f1aab9cb717",
      "store": "56cca6cf780b493151881a59",
      "firstName": "John",
      "lastName": "Public",
      "email": "johnq@public.com",
      "__v": 0,
      "company": "56637dd6295c4d131c901ba1",
      "created": "2017-05-04T23:04:51.694Z",
      "role": "employee",
      "profile": {
        "lastName": "Public",
        "firstName": "John",
        "email": "johnq@public.com",
        "_id": "590bb39363f76f1aab9cb717"
      },
      "token": {
        "role": "employee",
        "_id": "590bb39363f76f1aab9cb717"
      },
      "fullName": "John Public",
      "id": "590bb39363f76f1aab9cb717"
    }
  ]
}
*/
export function getStore(req, res) {
  return getStoreDetails(req, res);
}

/**
 * Delete a store
DELETE http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59"
},
RESULT
200
*/
export function deleteStore(req, res) {
  return deleteStoreCompanyController(req, res);
}

/**
 * Create an employee
POST http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId/employees
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59"
}
BODY
{
  "firstName": "John",
  "lastName": "Public",
  "email": "johnq@public.com",
  "password": "123456",
  "role": "employee"
}
RESULT
{
  "_id": "590bb39363f76f1aab9cb717",
  "store": "56cca6cf780b493151881a59",
  "firstName": "John",
  "lastName": "Public",
  "email": "johnq@public.com",
  "__v": 0,
  "company": "56637dd6295c4d131c901ba1",
  "created": "2017-05-04T23:04:51.694Z",
  "role": "employee",
  "profile": {
    "lastName": "Public",
    "firstName": "John",
    "email": "johnq@public.com",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "token": {
    "role": "employee",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "fullName": "John Public",
  "id": "590bb39363f76f1aab9cb717"
}
 */
export function createEmployee(req, res) {
  req.body.companyId = req.user.company.toString();
  req.body.storeId = req.params.storeId;

  if (req.user.role === 'manager' && req.body.role === 'corporate-admin') {
    return res.status(401).json({error: "Managers can't create corporate admin accounts"});
  }

  return newEmployee(req, res);
}

/**
 * Update an employee
PATCH http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId/employees/:employeeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59",
  "employeeId": "590bb39363f76f1aab9cb717"
}
BODY
{
  "firstName": "John",
  "lastName": "Public",
  "email": "johnq@public.com",
  "password": "123456",
  "role": "employee"
}
RESULT
{
  "_id": "590bb39363f76f1aab9cb717",
  "store": "56cca6cf780b493151881a59",
  "firstName": "John",
  "lastName": "Public",
  "email": "johnq@public.com",
  "__v": 0,
  "company": "56637dd6295c4d131c901ba1",
  "created": "2017-05-04T23:04:51.694Z",
  "role": "employee",
  "profile": {
    "lastName": "Public",
    "firstName": "John",
    "email": "johnq@public.com",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "token": {
    "role": "employee",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "fullName": "John Public",
  "id": "590bb39363f76f1aab9cb717"
}
*/
export function updateEmployee(req, res) {
  let fakeReq, fakeRes;
  [fakeReq, fakeRes] = makeFakeReqRes(req);
  fakeReq.params = req.params;
  fakeReq.params.id = req.params.employeeId;

  modifyUser(fakeReq, fakeRes)
  .then(() => {
    if (fakeRes.code) {
      return res.status(fakeRes.code).json(fakeRes.response);
    }

    return fakeRes.response;
  })
  .then(user => {
    if (req.body.role) {
      if (req.user.role === 'manager' && ['manager', 'employee'].indexOf(req.body.role) !== -1) {
        user.role = req.body.role;
      }

      if (req.user.role === 'corporate-admin' && ['manager', 'employee', 'corporate-admin'].indexOf(req.body.role) !== -1) {
        user.role = req.body.role;
      }
    }

    return user.save();
  })
  .then(user => res.json(user))
  .catch(async err => {
    console.log('**************ERR IN UPDATEEMPLOYEE**************');
    console.log(err);

    await ErrorLog.create({
      method: 'updateEmployee',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 * Delete an employee
DELETE http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId/employees/:employeeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59",
  "employeeId": "590bb39363f76f1aab9cb717"
}
RESULT
200
*/
export function deleteEmployee(req, res) {
  return deleteEmployeeCompanyController(req, res);
}

/**
 * Retrieve all employees of a store
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId/employees
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59"
}
RESULT
[
  {
    "_id": "590bb39363f76f1aab9cb717",
    "store": "56cca6cf780b493151881a59",
    "firstName": "John",
    "lastName": "Public",
    "email": "johnq@public.com",
    "__v": 0,
    "company": "56637dd6295c4d131c901ba1",
    "created": "2017-05-04T23:04:51.694Z",
    "role": "employee",
    "profile": {
      "lastName": "Public",
      "firstName": "John",
      "email": "johnq@public.com",
      "_id": "590bb39363f76f1aab9cb717"
    },
    "token": {
      "role": "employee",
      "_id": "590bb39363f76f1aab9cb717"
    },
    "fullName": "John Public",
    "id": "590bb39363f76f1aab9cb717"
  },
  ...
]
*/
export function getEmployees(req, res) {
  const {storeId} = req.params;
  // Invalid object ID
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(invalidObjectId.code).json(invalidObjectId.res);
  }

  Store.findOne({_id: storeId, companyId: req.user.company})
  .populate('users')
  .then(store => {
    if (!store) {
      return res.status(404).json();
    }

    return res.json(store.users);
  })
  .catch(async err => {
    console.log('****************************ERR IN GETEMPLOYEES****************************');
    console.log(err);

    await ErrorLog.create({
      method: 'getEmployees',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  });
}

/**
 * Retrieve an employee
GET http://gcmgr-staging.cardquiry.com:9000/api/lq/stores/:storeId/employees/:employeeId
HEADERS
Accept: application/json
Content-Type: application/json
Authorization: bearer <token>
PARAMS
{
  "storeId": "56cca6cf780b493151881a59",
  "employeeId": "590bb39363f76f1aab9cb717"
}
RESULT
{
  "_id": "590bb39363f76f1aab9cb717",
  "store": "56cca6cf780b493151881a59",
  "firstName": "John",
  "lastName": "Public",
  "email": "johnq@public.com",
  "__v": 0,
  "company": "56637dd6295c4d131c901ba1",
  "created": "2017-05-04T23:04:51.694Z",
  "role": "employee",
  "profile": {
    "lastName": "Public",
    "firstName": "John",
    "email": "johnq@public.com",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "token": {
    "role": "employee",
    "_id": "590bb39363f76f1aab9cb717"
  },
  "fullName": "John Public",
  "id": "590bb39363f76f1aab9cb717"
}
 */
export function getEmployee(req, res) {
  const {storeId, employeeId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(storeId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(404).json();
  }

  User.findOne({_id: employeeId, store: storeId, company: req.user.company})
  .then(user => {
    if (!user) {
      return res.status(404).json();
    }

    return res.json(user);
  })
  .catch(async err => {
    console.log('*************************ERR IN GETEMPLOYEE*************************');
    console.log(err);

    await ErrorLog.create({
      method: 'getEmployee',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    })
    .then(()=> {
      return res.status(500).json({
        invalid: 'An error has occurred.'
      });
    });
  })
}

/**
 * Reset transactions
 */
export function resetTransactions(req, res) {
  Store.find({})
  .then(stores => {
    const promises = [];
    stores.forEach(store => {
      store.reserveTotal = 0;
      store.reserves = [];
      promises.push(store.save());
    });
    return Promise.all(promises);
  })
  .then(() => Company.find({}))
  .then(companies => {
    const promises = [];
    companies.forEach(company => {
      company.reserveTotal = 0;
      company.reserves = [];
      promises.push(company.save());
    });
    return Promise.all(promises);
  })
  .then(() => Inventory.find({})
  .populate('card')
  .then(inventories => {
    const promises = [];
    inventories.forEach(inventory => {
      if (inventory.transaction) {
        if (inventory.card) {
          promises.push(inventory.card.remove());
        }
        promises.push(inventory.remove());
      }
    });
    return Promise.all(promises);
  }))
  // Remove reserve records
  .then(async () => await Reserve.remove({}))
  .then(() => res.json({}));
}

async function setVerifiedBalance(inventory, verifiedBalance) {
  inventory.verifiedBalance = verifiedBalance;
  inventory.isTransaction = true;
  return inventory.save();
}

/**
 * Mock a credit/reject for staging
 */
export function mockCreditReject(req, res) {
  const {verifiedBalance, cards} = req.body;
  return Card.find({_id: {$in: cards}}).populate('inventory')
  .then(async cards => {
    const dbInventories = cards.map(card => card.inventory);
    for (let inventory of dbInventories) {
      await setVerifiedBalance(inventory, verifiedBalance);
    }
    const [fakeReq, fakeRes] = makeFakeReqRes(req);
    fakeReq.body.inventories = dbInventories.map(inv => inv._id.toString());
    await rejectCards(fakeReq, fakeRes);
    return res.json({});
  })
  .catch(async err => {
    if (err === 'notFound') {
      return;
    }
    console.log('**************ERR**********');
    console.log(err);

    await ErrorLog.create({
      method: 'mockCreditReject',
      controller: 'lq.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    return res.status(500).json({
      invalid: 'An error has occurred.'
    });
  })
  // {inventories: ["5943fa2c9d19ae2e9499c45c"], verifiedBalance: 100}
}
