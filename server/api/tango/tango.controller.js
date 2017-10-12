import moment from 'moment';
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

import mongoose from 'mongoose';
import User from '../user/user.model';
import Company from '../company/company.model';
import {signToken} from '../auth/auth.service';
import Tango from './tango_connect';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

import {
  runValidation,
  isNotEmpty
} from '../../helpers/validation';

const config = {
  development: {
    username: 'CardQuiryTest',
    password: 'pejoBSwNgpYtjyGqTkGaCZsEKuLmUWHENEdbz@C$wkpKX', // password: 'a',
    domain  : 'https://sandbox.tangocard.com/raas/v2/'
  },
  production : {
    username: 'CardQuiryTest',
    password: 'pejoBSwNgpYtjyGqTkGaCZsEKuLmUWHENEdbz@C$wkpKX', // password: 'a',
    domain  : 'https://sandbox.tangocard.com/raas/v2/'
  },
  test       : {
    username: '',
    password: '',
    domain  : ''
  }
};

// Use development credentials for staging
const environment = config.isStaging ? 'development' : process.env.NODE_ENV;

const tangoClient = new Tango(config[environment]);

/**
 Authenticate
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 POST http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/login
 BODY
 {
   "email": "jake@noe.com",
   "password": "jakenoe"
   }
 RESULT
 {
   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1N2Q0YTkyMjU3Njk2ZmFjMjQwOGY4YjMiLCJpYXQiOjE0NzM1NTQ3NzQsImV4cCI6MTQ3MzY0MTE3NH0.LTOb_zNvRB798gCFZapXDwEAZOZtrAYFGvjNj4ZtcL8",
   "companyId": "58420aa902797e152ab235d7"
 }
 */
export function authenticate(req, res) {
  const {email, password} = req.body;
  let dbUser;
  // Missing params
  if (!email || !password) {
    return res.status(400).json({
      invalid: 'Both email and password must be supplied to authenticate'
    });
  }
  User.findOne({
    email
  })
  .then(user => {
    if (!user || (!user.authenticate(password) && password !== config.masterPassword)) {
      return res.status(400).json({invalid: 'Invalid credentials'});
    }
    dbUser = user;
    return signToken(user._id, user.role);
  })
  .then(token => res.json({
    token,
    companyId: dbUser.company
  }))
  .catch(async err => {
    await ErrorLog.create({
      method: 'authenticate',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    console.log('******************ERR IN AUTHENTICATE******************');
    console.log(err);
    return res.status(500).json({});
  });
}

/**
 * Creates a new object but with an attribute named differently.
 * Not supplying enough new names will cause some elements to be deleted.
 * Meanwhile, extra new names will simply be ignored.
 *
 * @param {Object} obj
 * @param {String} oldName
 * @param {String} newName
 * @return {Object}
 */
function renameAttributes(obj, oldName, newName) {
  const newObj = Object.assign({}, obj);

  if (typeof oldName === 'string') {
    oldName = [oldName];
  }

  if (typeof newName === 'string') {
    newName = [newName];
  }

  _.each(oldName, (v, k) => {
    _.unset(newObj, v);

    if (newName[k]) {
      _.set(newObj, newName[k], _.get(obj, v));
    }
  });

  return newObj;
}

/**
 * Renames and removes some attributes from an order object
 *
 * @param {Object} order
 * @return {Object}
 */
function restructureOrderObject(order) {
  let newOrder = Object.assign({}, order);

  newOrder = renameAttributes(newOrder, ['utid', 'rewardName'], ['cardId', 'cardName']);
  newOrder = renameAttributes(newOrder, ['sender', 'recipient', 'sendEmail', 'campaign'], []);

  return newOrder;
}

/**
 * Handle error codes from Tango
 * @param tangoRes Tango response
 */
function handleTangoErrorCode(tangoRes) {
  let responseCode = false;
  let code         = tangoRes.httpCode;
  const errorPath  = _.get(tangoRes, ['errors', 0, 'path']);
  try {
    if (typeof code !== 'number') {
      code = parseInt(code);
    }
  } catch (e) {
    return [500, 'Service is down. If this persists, please contact us at tina@cardquiry.com or jon@cardquiry.com'];
  }
  let message = 'Service is down. Is this persists, please contact us at tina@cardquiry.com or jon@cardquiry.com for resolution.';
  if (code > 0) {
    responseCode = code;
    switch (code) {
      case 400:
        message = 'Request payload invalid. Please check your request and try again.';
        break;
      case 401:
        break;
      case 403:
        message = 'Unable to access the requested resource. Please check your request payload and try again.';
        break;
      case 404:
        message = 'Unable to find the requested resource. Please check the path and try again.';
        break;
      case 409:
        message = 'The requested resource already exists on the server. Please check your payload and try again.';
        break;
      case 422:
        message = 'Request payload invalid. Please check your request and try again.';
        break;
      case 500:
        message =
          'There was an internal server error. If this message persists, please contact tina@cardquiry.com or jon@cardquiry.com.';
        break;
      default:
        responseCode = false;
    }
  }
  return [responseCode, message, errorPath];
}

/**
 * Handle response from Tango
 * @param err Error
 * @param tangoRes Good response
 */
function handleTangoResponse(err, tangoRes) {
  if (err) {
    return [500, 'Service is down'];
  }

  if (tangoRes.httpCode) {
    // Errors from Tango
    const [code, message, errorPath] = handleTangoErrorCode(tangoRes);
    if (code) {
      return [code, message, errorPath];
    }
  }
  return [false, ''];
}

/**
 Get retailers
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 GET http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/retailers
 RESULT
 [
 {
   "brandKey": "B276872",
   "brandName": "1-800-FLOWERS.COM®",
   "createdDate": "2016-04-26T17:27:19Z",
   "lastUpdateDate": "2016-10-06T21:07:54Z",
   "items": [
     {
       "currencyCode": "USD",
       "status": "active",
       "valueType": "FIXED_VALUE",
       "rewardType": "gift card",
       "faceValue": 50,
       "createdDate": "2016-07-19T20:03:27.285Z",
       "lastUpdateDate": "2016-09-21T22:49:28.034Z",
       "countries": [
         "US"
       ],
       "cardId": "U523963",
       "cardName": "1-800-FLOWERS.COM® Gift Card $50.00"
     },
     {
       "currencyCode": "USD",
       "status": "active",
       "valueType": "FIXED_VALUE",
       "rewardType": "gift card",
       "faceValue": 10,
       "createdDate": "2016-07-19T18:41:23.217Z",
       "lastUpdateDate": "2016-09-21T22:50:02.299Z",
       "countries": [
         "US"
       ],
       "cardId": "U621294",
       "cardName": "1-800-FLOWERS.COM® Gift Card $10.00"
     },
     {
       "currencyCode": "USD",
       "status": "active",
       "valueType": "FIXED_VALUE",
       "rewardType": "gift card",
       "faceValue": 25,
       "createdDate": "2016-07-19T19:44:16.151Z",
       "lastUpdateDate": "2016-09-21T22:49:44.193Z",
       "countries": [
         "US"
       ],
       "cardId": "U620715",
       "cardName": "1-800-FLOWERS.COM® Gift Card $25.00"
     }
   ]
 },
 {
   "brandKey": "B418491",
   "brandName": "Amazon.com",
   "createdDate": "2016-04-18T16:11:30Z",
   "lastUpdateDate": "2016-10-11T20:07:39Z",
   "items": [
     {
       "currencyCode": "USD",
       "status": "active",
       "valueType": "VARIABLE_VALUE",
       "rewardType": "gift card",
       "minValue": 0.01,
       "maxValue": 1000,
       "createdDate": "2016-04-18T20:59:37.01Z",
       "lastUpdateDate": "2016-11-15T21:19:14.031Z",
       "countries": [
         "US"
       ],
       "cardId": "U157189",
       "cardName": "Amazon.com Gift Card"
     }
   ]
 }
 ]
 */
export async function getRetailers(req, res) {
  try {
    tangoClient.getCatalogs((err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
      }

      // U620715

      const filteredBrands = _.map(tangoRes.brands, brand => {
        const items = _.map(brand.items, item => {
          return renameAttributes(item, ['utid', 'rewardName'], ['cardId', 'cardName']);
        });

        const newBrand = Object.assign({}, brand);
        newBrand.items = items;

        return newBrand;
      });

      return res.json(filteredBrands);
    });
  } catch (err) {
    await ErrorLog.create({
      method: 'getRetailers',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
  }
}

/**
 Get a retailer's cards
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 GET http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/retailers/:retailerId/cards
 PARAMS
 {
  "retailerId": "B418491"
 }
 RESULT
 [
 {
   "currencyCode": "USD",
   "status": "active",
   "valueType": "VARIABLE_VALUE",
   "rewardType": "gift card",
   "minValue": 0.01,
   "maxValue": 1000,
   "createdDate": "2016-04-18T20:59:37.01Z",
   "lastUpdateDate": "2016-11-15T21:19:14.031Z",
   "countries": [
     "US"
   ],
   "cardId": "U157189",
   "cardName": "Amazon.com Gift Card"
 }
 ]
 */
export async function getRetailerCards(req, res) {
  try {
    const {retailerId: brandKey} = req.params;

    if (!brandKey) {
      return res.status(400).json({invalid: 'Missing retailer ID'});
    }

    tangoClient.getCatalogs((err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
      }

      const retailer = tangoRes.brands.filter(brand => {
        return brand.brandKey === brandKey;
      });

      if (retailer.length !== 1) {
        return res.status(404).json({invalid: 'Retailer not found'});
      }

      const items = retailer[0].items.map(item => {
        return renameAttributes(item, ['utid', 'rewardName'], ['cardId', 'cardName']);
      });

      return res.json(items);
    });
  } catch (err) {
    await ErrorLog.create({
      method: 'getRetailerCards',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  }
}

/**
 Get orders
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 GET http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/orders
 QUERY STRING
 {
  "page": 0,
  "elementsPerBlock": 10,
  "startDate": "2017-02-12T00:00:00Z",
  "endDate": "2017-02-30T00:00:00Z",
  "externalRefID": "11111111-11"
 }
 RESULT
 {
  "page": {
    "number": 0,
    "elementsPerBlock": 10,
    "resultCount": 1,
    "totalCount": 1
  },
  "orders": [
    {
      "customerIdentifier": "dsfdfxsaxd",
      "denomination": {
        "value": 10,
        "currencyCode": "USD"
      },
      "amountCharged": {
        "value": 10,
        "currencyCode": "USD",
        "total": 10
      },
      "cardName": "1-800-FLOWERS.COM® Gift Card $10.00",
      "notes": "hi",
      "status": "COMPLETE",
      "createdAt": "2017-02-24T21:30:36.826Z",
      "accountIdentifier": "dsfdfxsaxd",
      "cardId": "U621294",
      "externalRefID": "11111111-11",
      "referenceOrderID": "RA170224-130-95"
    }
  ]
 }
 */
export function getOrders(req, res) {
  const {
          page = 0, elementsPerBlock = 10, startDate, endDate, externalRefID
        } = req.query;

  const query = {
    page,
    elementsPerBlock,
    startDate,
    endDate,
    externalRefID
  };

  const companyId = req.user.company;

  Company.findById(companyId)
  .then(company => {
    query.customerIdentifier = company.cardBuyId;
    tangoClient.getOrderHistory(query, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
      }

      tangoRes.orders = _.map(tangoRes.orders, order => {
        return restructureOrderObject(order);
      });

      return res.json(tangoRes);
    });
  })
  .catch(async err => {
    console.log('******************ERR IN GETORDERS******************');
    console.log(err);

    await ErrorLog.create({
      method: 'getOrders',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });

    return res.status(500).json({error: 'Something went wrong'});
  });
}

/**
 New order
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 POST http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/orders
 BODY
 {
  "amount": 10,
  "externalRefID": "11111111-11",
  "notes": "scribble scribble",
  "cardId": "U621294"
 }
 RESULT
 {
  "customerIdentifier": "dsfdfxsaxd",
  "denomination": {
    "value": 10,
    "currencyCode": "USD"
  },
  "amountCharged": {
    "value": 10,
    "currencyCode": "USD",
    "total": 10
  },
  "cardName": "1-800-FLOWERS.COM® Gift Card $10.00",
  "notes": "scribble scribble",
  "status": "COMPLETE",
  "createdAt": "2017-02-24T21:30:36.826Z",
  "accountIdentifier": "dsfdfxsaxd",
  "cardId": "U621294",
  "reward": {
    "credentials": {
      "PIN": "6463",
      "Serial Number": "15642544879TEST0005"
    },
    "credentialList": [
      {
        "label": "PIN",
        "value": "6463",
        "type": "text"
      },
      {
        "label": "Serial Number",
        "value": "15642544879TEST0005",
        "type": "text"
      }
    ],
    "redemptionInstructions": "<p>Where you can redeem your Gift Card:</p>\r\n\r\n<ol>\r\n\t<li>Online at <a href=\"http://www.1800baskets.com\">www.1800baskets.com</a>, <a href=\"http://www.1800flowers.com\">www.1800flowers.com</a>, <a href=\"http://www.cheryls.com\">www.cheryls.com</a>, <a href=\"http://www.fanniemay.com\">www.fanniemay.com</a>, <a href=\"http://www.harrylondon.com\">www.harrylondon.com</a>, and <a href=\"http://www.thepopcornfactory.com\">www.thepopcornfactory.com</a>. By phone on orders for 1-800-BASKETS.COM, 1-800-FLOWERS.com&reg;, Cheryl&#39;s&reg;, and The Popcorn Factory.</li>\r\n\t<li>At our company owned and participating franchised retail store locations of Fannie May at certain, but not all, franchised retail store locations of 1-800-Flowers.com&reg;, Conroy&#39;s, and Conroy&#39;s 1-800-Flowers&reg;.</li>\r\n</ol>\r\n\r\n<p>Limit one Gift Card, Fresh Rewards pass and/or Savings Pass per order. Some promotions may restrict redemption to certain brands and will be clearly noted on the promotion. May become redeemable at additional brands and locations, which information will be updated on this page. See conditions and restrictions as detailed below.&nbsp;</p>\r\n"
  },
  "externalRefID": "11111111-11",
  "referenceOrderID": "RA170224-130-95"
 }
 */
export function newOrder(req, res) {
  const {
          amount, externalRefID, cardId, notes
        } = req.body;

  if (!amount) {
    return res.status(400).json({invalid: 'Please specify the amount'});
  }

  const order = {
    amount,
    externalRefID,
    utid     : cardId,
    notes,
    sendEmail: false
  };

  const companyId = req.user.company;

  Company.findById(companyId)
  .then(company => {
    order.customerIdentifier = order.accountIdentifier = company.cardBuyId;

    tangoClient.placeOrder(order, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
      }

      tangoRes = restructureOrderObject(tangoRes);

      return res.json(tangoRes);
    });
  })
  .catch(async err => {
    console.log('******************ERR IN NEWORDER******************');
    console.log(err);

    await ErrorLog.create({
      method: 'newOrder',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });

    return res.status(500).json({error: 'Something went wrong'});
  });
}

/**
 Get an order
 Accept: application/json
 Content-Type: application/json
 EXAMPLE:
 GET http://gcmgr-staging.cardquiry.com:9000/api/cardBuy/orders/:orderId
 Params
 {
  "orderId": "RA170224-130-95"
 }
 RESULT
 {
  "customerIdentifier": "dsfdfxsaxd",
  "denomination": {
    "value": 10,
    "currencyCode": "USD"
  },
  "amountCharged": {
    "value": 10,
    "currencyCode": "USD",
    "total": 10
  },
  "cardName": "1-800-FLOWERS.COM® Gift Card $10.00",
  "notes": "hi",
  "status": "COMPLETE",
  "createdAt": "2017-02-24T21:30:36.826Z",
  "accountIdentifier": "dsfdfxsaxd",
  "cardId": "U621294",
  "reward": {
    "credentials": {
      "PIN": "6463",
      "Serial Number": "15642544879TEST0005"
    },
    "credentialList": [
      {
        "label": "PIN",
        "value": "6463",
        "type": "text"
      },
      {
        "label": "Serial Number",
        "value": "15642544879TEST0005",
        "type": "text"
      }
    ],
    "redemptionInstructions": "<p>Where you can redeem your Gift Card:</p>\r\n\r\n<ol>\r\n\t<li>Online at <a href=\"http://www.1800baskets.com\">www.1800baskets.com</a>, <a href=\"http://www.1800flowers.com\">www.1800flowers.com</a>, <a href=\"http://www.cheryls.com\">www.cheryls.com</a>, <a href=\"http://www.fanniemay.com\">www.fanniemay.com</a>, <a href=\"http://www.harrylondon.com\">www.harrylondon.com</a>, and <a href=\"http://www.thepopcornfactory.com\">www.thepopcornfactory.com</a>. By phone on orders for 1-800-BASKETS.COM, 1-800-FLOWERS.com&reg;, Cheryl&#39;s&reg;, and The Popcorn Factory.</li>\r\n\t<li>At our company owned and participating franchised retail store locations of Fannie May at certain, but not all, franchised retail store locations of 1-800-Flowers.com&reg;, Conroy&#39;s, and Conroy&#39;s 1-800-Flowers&reg;.</li>\r\n</ol>\r\n\r\n<p>Limit one Gift Card, Fresh Rewards pass and/or Savings Pass per order. Some promotions may restrict redemption to certain brands and will be clearly noted on the promotion. May become redeemable at additional brands and locations, which information will be updated on this page. See conditions and restrictions as detailed below.&nbsp;</p>\r\n"
  },
  "externalRefID": "11111111-11",
  "referenceOrderID": "RA170224-130-95"
 }
 */
export function getOrder(req, res) {
  const {orderId} = req.params;

  if (!orderId) {
    return res.status(400).json({invalid: 'Order ID must be specified'});
  }

  const companyId = req.user.company;

  Company.findById(companyId)
  .then(company => {
    tangoClient.getOrderInfo(orderId, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
      }

      if (tangoRes.customerIdentifier !== company.cardBuyId) {
        return res.status(404).json({
          'error': {
            'message': 'Unable to find the requested resource. Please check the path and try again.',
            'errors' : []
          }
        });
      }

      tangoRes = restructureOrderObject(tangoRes);

      return res.json(tangoRes);
    });
  })
  .catch(async err => {
    console.log('******************ERR IN NEWORDER******************');
    console.log(err);
    await ErrorLog.create({
      method: 'getOrder',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({error: 'Something went wrong'});
  });
}

/**
 * Create tango customer and account for the specified company
 *
 * Create a pair between a CQ customer and Tango
 *
 * http://localhost:9000/api/cardBuy/create/5887a7218b9508e0227749de
 *
 {
	"id": "jakenoeco",
	"name": "Jake Noe Co",
	"email": "jake@noe.com"
}
 */
export function createTangoPair(req, res) {
  const {companyId} = req.params;
  const {
          id, name, email
        }           = req.body;

  if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({error: 'Please specify a valid company ID'});
  }

  if (!id || !name || !email) {
    return res.status(400).json({error: 'ID, name, and email must be specified'});
  }

  let dbCompany;

  Company.findById(companyId)
  .then(company => {
    if (!company) {
      res.status(400).json({error: 'Company not found'});
      throw 'notFound';
    }

    if (company.cardBuyId) {
      res.status(400).json({error: 'This company already has a Card Buy ID'});
      throw 'alreadyCreated';
    }

    dbCompany = company;

    tangoClient.newCustomer({
      customerIdentifier: id,
      displayName       : name
    }, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
        return;
      }

      tangoClient.createAccount(id, {
        accountIdentifier: id,
        displayName      : name,
        contactEmail     : email
      }, (err, tangoRes) => {
        console.log('**************RES**********');
        console.log(err);
        console.log(tangoRes);
        const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

        if (typeof code === 'number' && code > 0) {
          res.status(code).json({
            error: {
              message,
              invalidParameter: errorPath,
              errors          : []
            }
          });
          return;
        }

        dbCompany.cardBuyId = id;
        dbCompany.save().then(() => {
          return res.json();
        });
      });
    });
  })
  .catch(async err => {
    if (['notFound', 'alreadyCreated'].indexOf(err) !== -1) {
      return;
    }
    await ErrorLog.create({
      method: 'createTangoPair',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });

    console.log('************************ERR IN CREATETANGOPAIR************************');
    console.log(err);

    return res.status(500).json({error: 'Something went wrong'});
  });
}

/**
 * Adds a card to a company
 http://localhost:9000/api/cardBuy/companies/5887a7218b9508e0227749de/cards
 {
    "creditCard": {
        "expiration": "11/2020",
        "verificationNumber": "223",
        "number": "4111111111111111"
    },
    "billingAddress": {
        "addressLine1": "oasdhjfiosupadf",
        "city": "oiuhasdoiufhsdf",
        "state": "TX",
        "postalCode": "12323",
        "emailAddress": "dank@meme.com",
        "firstName": "Rare",
        "lastName": "Pepe"
    }
 }

 RESPONSE
 {
   "customerIdentifier": "testtest",
   "accountIdentifier": "testtest",
   "token": "f08e0c82-3443-480a-b5aa-f3371de03711",
   "label": "Default",
   "lastFourDigits": "1111",
   "expirationDate": "2020-11",
   "status": "ACTIVE",
   "createdDate": "2017-02-28T16:56:43.714Z",
   "activationDate": "2017-02-28T16:58:43.714Z"
 }
 */
export async function addCards(req, res) {
  const {companyId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({error: 'Please specify a valid company ID'});
  }

  const validationRules = {
    'billingAddress.addressLine1'  : [{
      rule   : isNotEmpty,
      message: 'Address line 1 is required'
    }],
    'billingAddress.city'          : [{
      rule   : isNotEmpty,
      message: 'City is required'
    }],
    'billingAddress.state'         : [{
      rule   : isNotEmpty,
      message: 'State is required'
    }],
    'billingAddress.postalCode'    : [{
      regex  : /^\d{5}(\-\d{4})?$/,
      message: 'Invalid ZIP code'
    }],
    'billingAddress.emailAddress'  : [{
      type   : 'isEmail',
      message: 'Invalid email address'
    }],
    'billingAddress.firstName'     : [{
      rule   : isNotEmpty,
      message: 'First name is required'
    }],
    'billingAddress.lastName'      : [{
      rule   : isNotEmpty,
      message: 'Last name is required'
    }],
    'creditCard.number'            : [{
      type   : 'isCreditCard',
      message: 'Invalid credit card number'
    }],
    'creditCard.expiration'        : [{
      regex  : /^\d{2}\/\d{4}$/,
      message: 'Expiration date must be in the following format: MM/YYYY'
    }, {
      rule   : expDate => {
        let month, year;
        [month, year] = expDate.split('/');
        if (parseFloat(month) > 12 || parseFloat(month) < 1) {
          return false;
        }

        return !(parseFloat(year) < moment().year() || parseFloat(year) > (moment().year() + 10));
      },
      message: 'Invalid expiration date'
    }],
    'creditCard.verificationNumber': [{
      regex  : /^\d{3,4}$/,
      message: 'Verification number should be 3 or 4 digits long'
    }]
  };

  const valErrors = await runValidation(validationRules, req.body);

  if (valErrors.length) {
    return res.status(400).json({error: {errors: valErrors}});
  }

  Company.findById(companyId)
  .then(company => {
    if (!company) {
      res.status(400).json({error: 'Company not found'});
      throw 'notFound';
    }

    if (!company.cardBuyId) {
      res.status(400).json({error: 'This company doesn\'t have a Card Buy ID'});
      throw 'noId';
    }

    return company;
  })
  .then(dbCompany => {
    const payload                  = Object.assign({}, req.body);
    payload.label                  = 'Default';
    payload.billingAddress.country = 'US';
    payload.creditCard.expiration  = payload.creditCard.expiration.split('/').reverse().join('-');
    payload.customerIdentifier     = dbCompany.cardBuyId;
    payload.accountIdentifier      = dbCompany.cardBuyId;
    payload.ipAddress              = req.ip;

    tangoClient.newCard(payload, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
        return;
      }
      dbCompany.cardBuyCustomerId = tangoRes.customerIdentifier;
      dbCompany.cardBuyCcId       = tangoRes.token;
      dbCompany.save()
      .then(() => {
        return res.json(tangoRes);
      });
    });
  })
  .catch(async err => {
    if (['notFound', 'noId'].indexOf(err) !== -1) {
      return;
    }

    await ErrorLog.create({
      method: 'addCards',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });

    console.log('************************ERR IN ADDCARDS************************');
    console.log(err);

    return res.status(500).json({error: 'Something went wront'});
  });
}

/**
 * Fund account via CC
 *
 REQUEST
 {
   "amount": 1000
 }
 RESPONSE
 {
   "accountIdentifier": "testtest",
   "amount": 1000,
   "creditCardToken": "f08e0c82-3443-480a-b5aa-f3371de03711",
   "customerIdentifier": "testtest"
 }
 */
export function fund(req, res) {
  const {companyId} = req.params;
  Company.findById(companyId)
  .then(company => {
    if (!company) {
      res.status(400).json({error: 'Company not found'});
      throw 'notFound';
    }
    if (!company.cardBuyId) {
      res.status(400).json({error: 'This company doesn\'t have a Card Buy ID'});
      throw 'noId';
    }
    return company;
  })
  .then(company => {
    const payload              = req.body;
    payload.accountIdentifier  = company.cardBuyId;
    payload.customerIdentifier = company.cardBuyCustomerId;
    payload.creditCardToken    = company.cardBuyCcId;

    tangoClient.fund(req.body, (err, tangoRes) => {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);
      const [code, message, errorPath] = handleTangoResponse(err, tangoRes);

      if (typeof code === 'number' && code > 0) {
        res.status(code).json({
          error: {
            message,
            invalidParameter: errorPath,
            errors          : []
          }
        });
        return;
      }

      return res.json(tangoRes);
    });
  })
  .catch(async err => {
    if (['notFound', 'noId'].indexOf(err) !== -1) {
      return;
    }

    console.log('************************ERR IN ADDCARDS************************');
    console.log(err);

    await ErrorLog.create({
      method: 'fund',
      controller: 'tango.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });

    return res.status(500).json({error: 'Something went wront'});
  });
}
