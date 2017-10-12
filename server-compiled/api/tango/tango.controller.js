'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addCards = exports.getRetailerCards = exports.getRetailers = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
var getRetailers = exports.getRetailers = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            tangoClient.getCatalogs(function (err, tangoRes) {
              console.log('**************RES**********');
              console.log(err);
              console.log(tangoRes);

              var _handleTangoResponse = handleTangoResponse(err, tangoRes),
                  _handleTangoResponse2 = _slicedToArray(_handleTangoResponse, 3),
                  code = _handleTangoResponse2[0],
                  message = _handleTangoResponse2[1],
                  errorPath = _handleTangoResponse2[2];

              if (typeof code === 'number' && code > 0) {
                return res.status(code).json({
                  error: {
                    message: message,
                    invalidParameter: errorPath,
                    errors: []
                  }
                });
              }

              // U620715

              var filteredBrands = _lodash2.default.map(tangoRes.brands, function (brand) {
                var items = _lodash2.default.map(brand.items, function (item) {
                  return renameAttributes(item, ['utid', 'rewardName'], ['cardId', 'cardName']);
                });

                var newBrand = Object.assign({}, brand);
                newBrand.items = items;

                return newBrand;
              });

              return res.json(filteredBrands);
            });
            _context2.next = 8;
            break;

          case 4:
            _context2.prev = 4;
            _context2.t0 = _context2['catch'](0);
            _context2.next = 8;
            return _errorLog2.default.create({
              method: 'getRetailers',
              controller: 'tango.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context2.t0.stack,
              error: _context2.t0
            });

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 4]]);
  }));

  return function getRetailers(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

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


var getRetailerCards = exports.getRetailerCards = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var brandKey;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            brandKey = req.params.retailerId;

            if (brandKey) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt('return', res.status(400).json({ invalid: 'Missing retailer ID' }));

          case 4:

            tangoClient.getCatalogs(function (err, tangoRes) {
              console.log('**************RES**********');
              console.log(err);
              console.log(tangoRes);

              var _handleTangoResponse3 = handleTangoResponse(err, tangoRes),
                  _handleTangoResponse4 = _slicedToArray(_handleTangoResponse3, 3),
                  code = _handleTangoResponse4[0],
                  message = _handleTangoResponse4[1],
                  errorPath = _handleTangoResponse4[2];

              if (typeof code === 'number' && code > 0) {
                return res.status(code).json({
                  error: {
                    message: message,
                    invalidParameter: errorPath,
                    errors: []
                  }
                });
              }

              var retailer = tangoRes.brands.filter(function (brand) {
                return brand.brandKey === brandKey;
              });

              if (retailer.length !== 1) {
                return res.status(404).json({ invalid: 'Retailer not found' });
              }

              var items = retailer[0].items.map(function (item) {
                return renameAttributes(item, ['utid', 'rewardName'], ['cardId', 'cardName']);
              });

              return res.json(items);
            });
            _context3.next = 12;
            break;

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3['catch'](0);
            _context3.next = 11;
            return _errorLog2.default.create({
              method: 'getRetailerCards',
              controller: 'tango.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context3.t0.stack,
              error: _context3.t0
            });

          case 11:
            return _context3.abrupt('return', res.status(500).json({}));

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 7]]);
  }));

  return function getRetailerCards(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

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
var addCards = exports.addCards = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var _this6 = this;

    var companyId, validationRules, valErrors;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            companyId = req.params.companyId;

            if (_mongoose2.default.Types.ObjectId.isValid(companyId)) {
              _context9.next = 3;
              break;
            }

            return _context9.abrupt('return', res.status(400).json({ error: 'Please specify a valid company ID' }));

          case 3:
            validationRules = {
              'billingAddress.addressLine1': [{
                rule: _validation.isNotEmpty,
                message: 'Address line 1 is required'
              }],
              'billingAddress.city': [{
                rule: _validation.isNotEmpty,
                message: 'City is required'
              }],
              'billingAddress.state': [{
                rule: _validation.isNotEmpty,
                message: 'State is required'
              }],
              'billingAddress.postalCode': [{
                regex: /^\d{5}(\-\d{4})?$/,
                message: 'Invalid ZIP code'
              }],
              'billingAddress.emailAddress': [{
                type: 'isEmail',
                message: 'Invalid email address'
              }],
              'billingAddress.firstName': [{
                rule: _validation.isNotEmpty,
                message: 'First name is required'
              }],
              'billingAddress.lastName': [{
                rule: _validation.isNotEmpty,
                message: 'Last name is required'
              }],
              'creditCard.number': [{
                type: 'isCreditCard',
                message: 'Invalid credit card number'
              }],
              'creditCard.expiration': [{
                regex: /^\d{2}\/\d{4}$/,
                message: 'Expiration date must be in the following format: MM/YYYY'
              }, {
                rule: function rule(expDate) {
                  var month = void 0,
                      year = void 0;

                  var _expDate$split = expDate.split('/');

                  var _expDate$split2 = _slicedToArray(_expDate$split, 2);

                  month = _expDate$split2[0];
                  year = _expDate$split2[1];

                  if (parseFloat(month) > 12 || parseFloat(month) < 1) {
                    return false;
                  }

                  return !(parseFloat(year) < (0, _moment2.default)().year() || parseFloat(year) > (0, _moment2.default)().year() + 10);
                },
                message: 'Invalid expiration date'
              }],
              'creditCard.verificationNumber': [{
                regex: /^\d{3,4}$/,
                message: 'Verification number should be 3 or 4 digits long'
              }]
            };
            _context9.next = 6;
            return (0, _validation.runValidation)(validationRules, req.body);

          case 6:
            valErrors = _context9.sent;

            if (!valErrors.length) {
              _context9.next = 9;
              break;
            }

            return _context9.abrupt('return', res.status(400).json({ error: { errors: valErrors } }));

          case 9:

            _company2.default.findById(companyId).then(function (company) {
              if (!company) {
                res.status(400).json({ error: 'Company not found' });
                throw 'notFound';
              }

              if (!company.cardBuyId) {
                res.status(400).json({ error: 'This company doesn\'t have a Card Buy ID' });
                throw 'noId';
              }

              return company;
            }).then(function (dbCompany) {
              var payload = Object.assign({}, req.body);
              payload.label = 'Default';
              payload.billingAddress.country = 'US';
              payload.creditCard.expiration = payload.creditCard.expiration.split('/').reverse().join('-');
              payload.customerIdentifier = dbCompany.cardBuyId;
              payload.accountIdentifier = dbCompany.cardBuyId;
              payload.ipAddress = req.ip;

              tangoClient.newCard(payload, function (err, tangoRes) {
                console.log('**************RES**********');
                console.log(err);
                console.log(tangoRes);

                var _handleTangoResponse15 = handleTangoResponse(err, tangoRes),
                    _handleTangoResponse16 = _slicedToArray(_handleTangoResponse15, 3),
                    code = _handleTangoResponse16[0],
                    message = _handleTangoResponse16[1],
                    errorPath = _handleTangoResponse16[2];

                if (typeof code === 'number' && code > 0) {
                  res.status(code).json({
                    error: {
                      message: message,
                      invalidParameter: errorPath,
                      errors: []
                    }
                  });
                  return;
                }
                dbCompany.cardBuyCustomerId = tangoRes.customerIdentifier;
                dbCompany.cardBuyCcId = tangoRes.token;
                dbCompany.save().then(function () {
                  return res.json(tangoRes);
                });
              });
            }).catch(function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(err) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        if (!(['notFound', 'noId'].indexOf(err) !== -1)) {
                          _context8.next = 2;
                          break;
                        }

                        return _context8.abrupt('return');

                      case 2:
                        _context8.next = 4;
                        return _errorLog2.default.create({
                          method: 'addCards',
                          controller: 'tango.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err
                        });

                      case 4:

                        console.log('************************ERR IN ADDCARDS************************');
                        console.log(err);

                        return _context8.abrupt('return', res.status(500).json({ error: 'Something went wront' }));

                      case 7:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee8, _this6);
              }));

              return function (_x12) {
                return _ref9.apply(this, arguments);
              };
            }());

          case 10:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function addCards(_x10, _x11) {
    return _ref8.apply(this, arguments);
  };
}();

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


exports.authenticate = authenticate;
exports.getOrders = getOrders;
exports.newOrder = newOrder;
exports.getOrder = getOrder;
exports.createTangoPair = createTangoPair;
exports.fund = fund;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _auth = require('../auth/auth.service');

var _tango_connect = require('./tango_connect');

var _tango_connect2 = _interopRequireDefault(_tango_connect);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

var _validation = require('../../helpers/validation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var config = {
  development: {
    username: 'CardQuiryTest',
    password: 'pejoBSwNgpYtjyGqTkGaCZsEKuLmUWHENEdbz@C$wkpKX', // password: 'a',
    domain: 'https://sandbox.tangocard.com/raas/v2/'
  },
  production: {
    username: 'CardQuiryTest',
    password: 'pejoBSwNgpYtjyGqTkGaCZsEKuLmUWHENEdbz@C$wkpKX', // password: 'a',
    domain: 'https://sandbox.tangocard.com/raas/v2/'
  },
  test: {
    username: '',
    password: '',
    domain: ''
  }
};

// Use development credentials for staging
var environment = config.isStaging ? 'development' : process.env.NODE_ENV;

var tangoClient = new _tango_connect2.default(config[environment]);

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
function authenticate(req, res) {
  var _this = this;

  var _req$body = req.body,
      email = _req$body.email,
      password = _req$body.password;

  var dbUser = void 0;
  // Missing params
  if (!email || !password) {
    return res.status(400).json({
      invalid: 'Both email and password must be supplied to authenticate'
    });
  }
  _user2.default.findOne({
    email: email
  }).then(function (user) {
    if (!user || !user.authenticate(password) && password !== config.masterPassword) {
      return res.status(400).json({ invalid: 'Invalid credentials' });
    }
    dbUser = user;
    return (0, _auth.signToken)(user._id, user.role);
  }).then(function (token) {
    return res.json({
      token: token,
      companyId: dbUser.company
    });
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _errorLog2.default.create({
                method: 'authenticate',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              console.log('******************ERR IN AUTHENTICATE******************');
              console.log(err);
              return _context.abrupt('return', res.status(500).json({}));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
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
  var newObj = Object.assign({}, obj);

  if (typeof oldName === 'string') {
    oldName = [oldName];
  }

  if (typeof newName === 'string') {
    newName = [newName];
  }

  _lodash2.default.each(oldName, function (v, k) {
    _lodash2.default.unset(newObj, v);

    if (newName[k]) {
      _lodash2.default.set(newObj, newName[k], _lodash2.default.get(obj, v));
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
  var newOrder = Object.assign({}, order);

  newOrder = renameAttributes(newOrder, ['utid', 'rewardName'], ['cardId', 'cardName']);
  newOrder = renameAttributes(newOrder, ['sender', 'recipient', 'sendEmail', 'campaign'], []);

  return newOrder;
}

/**
 * Handle error codes from Tango
 * @param tangoRes Tango response
 */
function handleTangoErrorCode(tangoRes) {
  var responseCode = false;
  var code = tangoRes.httpCode;
  var errorPath = _lodash2.default.get(tangoRes, ['errors', 0, 'path']);
  try {
    if (typeof code !== 'number') {
      code = parseInt(code);
    }
  } catch (e) {
    return [500, 'Service is down. If this persists, please contact us at tina@cardquiry.com or jon@cardquiry.com'];
  }
  var message = 'Service is down. Is this persists, please contact us at tina@cardquiry.com or jon@cardquiry.com for resolution.';
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
        message = 'There was an internal server error. If this message persists, please contact tina@cardquiry.com or jon@cardquiry.com.';
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
    var _handleTangoErrorCode = handleTangoErrorCode(tangoRes),
        _handleTangoErrorCode2 = _slicedToArray(_handleTangoErrorCode, 3),
        code = _handleTangoErrorCode2[0],
        message = _handleTangoErrorCode2[1],
        errorPath = _handleTangoErrorCode2[2];

    if (code) {
      return [code, message, errorPath];
    }
  }
  return [false, ''];
}function getOrders(req, res) {
  var _this2 = this;

  var _req$query = req.query,
      _req$query$page = _req$query.page,
      page = _req$query$page === undefined ? 0 : _req$query$page,
      _req$query$elementsPe = _req$query.elementsPerBlock,
      elementsPerBlock = _req$query$elementsPe === undefined ? 10 : _req$query$elementsPe,
      startDate = _req$query.startDate,
      endDate = _req$query.endDate,
      externalRefID = _req$query.externalRefID;


  var query = {
    page: page,
    elementsPerBlock: elementsPerBlock,
    startDate: startDate,
    endDate: endDate,
    externalRefID: externalRefID
  };

  var companyId = req.user.company;

  _company2.default.findById(companyId).then(function (company) {
    query.customerIdentifier = company.cardBuyId;
    tangoClient.getOrderHistory(query, function (err, tangoRes) {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);

      var _handleTangoResponse5 = handleTangoResponse(err, tangoRes),
          _handleTangoResponse6 = _slicedToArray(_handleTangoResponse5, 3),
          code = _handleTangoResponse6[0],
          message = _handleTangoResponse6[1],
          errorPath = _handleTangoResponse6[2];

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message: message,
            invalidParameter: errorPath,
            errors: []
          }
        });
      }

      tangoRes.orders = _lodash2.default.map(tangoRes.orders, function (order) {
        return restructureOrderObject(order);
      });

      return res.json(tangoRes);
    });
  }).catch(function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log('******************ERR IN GETORDERS******************');
              console.log(err);

              _context4.next = 4;
              return _errorLog2.default.create({
                method: 'getOrders',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context4.abrupt('return', res.status(500).json({ error: 'Something went wrong' }));

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this2);
    }));

    return function (_x6) {
      return _ref4.apply(this, arguments);
    };
  }());
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
function newOrder(req, res) {
  var _this3 = this;

  var _req$body2 = req.body,
      amount = _req$body2.amount,
      externalRefID = _req$body2.externalRefID,
      cardId = _req$body2.cardId,
      notes = _req$body2.notes;


  if (!amount) {
    return res.status(400).json({ invalid: 'Please specify the amount' });
  }

  var order = {
    amount: amount,
    externalRefID: externalRefID,
    utid: cardId,
    notes: notes,
    sendEmail: false
  };

  var companyId = req.user.company;

  _company2.default.findById(companyId).then(function (company) {
    order.customerIdentifier = order.accountIdentifier = company.cardBuyId;

    tangoClient.placeOrder(order, function (err, tangoRes) {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);

      var _handleTangoResponse7 = handleTangoResponse(err, tangoRes),
          _handleTangoResponse8 = _slicedToArray(_handleTangoResponse7, 3),
          code = _handleTangoResponse8[0],
          message = _handleTangoResponse8[1],
          errorPath = _handleTangoResponse8[2];

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message: message,
            invalidParameter: errorPath,
            errors: []
          }
        });
      }

      tangoRes = restructureOrderObject(tangoRes);

      return res.json(tangoRes);
    });
  }).catch(function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(err) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              console.log('******************ERR IN NEWORDER******************');
              console.log(err);

              _context5.next = 4;
              return _errorLog2.default.create({
                method: 'newOrder',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context5.abrupt('return', res.status(500).json({ error: 'Something went wrong' }));

            case 5:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this3);
    }));

    return function (_x7) {
      return _ref5.apply(this, arguments);
    };
  }());
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
function getOrder(req, res) {
  var _this4 = this;

  var orderId = req.params.orderId;


  if (!orderId) {
    return res.status(400).json({ invalid: 'Order ID must be specified' });
  }

  var companyId = req.user.company;

  _company2.default.findById(companyId).then(function (company) {
    tangoClient.getOrderInfo(orderId, function (err, tangoRes) {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);

      var _handleTangoResponse9 = handleTangoResponse(err, tangoRes),
          _handleTangoResponse10 = _slicedToArray(_handleTangoResponse9, 3),
          code = _handleTangoResponse10[0],
          message = _handleTangoResponse10[1],
          errorPath = _handleTangoResponse10[2];

      if (typeof code === 'number' && code > 0) {
        return res.status(code).json({
          error: {
            message: message,
            invalidParameter: errorPath,
            errors: []
          }
        });
      }

      if (tangoRes.customerIdentifier !== company.cardBuyId) {
        return res.status(404).json({
          'error': {
            'message': 'Unable to find the requested resource. Please check the path and try again.',
            'errors': []
          }
        });
      }

      tangoRes = restructureOrderObject(tangoRes);

      return res.json(tangoRes);
    });
  }).catch(function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(err) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              console.log('******************ERR IN NEWORDER******************');
              console.log(err);
              _context6.next = 4;
              return _errorLog2.default.create({
                method: 'getOrder',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context6.abrupt('return', res.status(500).json({ error: 'Something went wrong' }));

            case 5:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this4);
    }));

    return function (_x8) {
      return _ref6.apply(this, arguments);
    };
  }());
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
function createTangoPair(req, res) {
  var _this5 = this;

  var companyId = req.params.companyId;
  var _req$body3 = req.body,
      id = _req$body3.id,
      name = _req$body3.name,
      email = _req$body3.email;


  if (!companyId || !_mongoose2.default.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ error: 'Please specify a valid company ID' });
  }

  if (!id || !name || !email) {
    return res.status(400).json({ error: 'ID, name, and email must be specified' });
  }

  var dbCompany = void 0;

  _company2.default.findById(companyId).then(function (company) {
    if (!company) {
      res.status(400).json({ error: 'Company not found' });
      throw 'notFound';
    }

    if (company.cardBuyId) {
      res.status(400).json({ error: 'This company already has a Card Buy ID' });
      throw 'alreadyCreated';
    }

    dbCompany = company;

    tangoClient.newCustomer({
      customerIdentifier: id,
      displayName: name
    }, function (err, tangoRes) {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);

      var _handleTangoResponse11 = handleTangoResponse(err, tangoRes),
          _handleTangoResponse12 = _slicedToArray(_handleTangoResponse11, 3),
          code = _handleTangoResponse12[0],
          message = _handleTangoResponse12[1],
          errorPath = _handleTangoResponse12[2];

      if (typeof code === 'number' && code > 0) {
        res.status(code).json({
          error: {
            message: message,
            invalidParameter: errorPath,
            errors: []
          }
        });
        return;
      }

      tangoClient.createAccount(id, {
        accountIdentifier: id,
        displayName: name,
        contactEmail: email
      }, function (err, tangoRes) {
        console.log('**************RES**********');
        console.log(err);
        console.log(tangoRes);

        var _handleTangoResponse13 = handleTangoResponse(err, tangoRes),
            _handleTangoResponse14 = _slicedToArray(_handleTangoResponse13, 3),
            code = _handleTangoResponse14[0],
            message = _handleTangoResponse14[1],
            errorPath = _handleTangoResponse14[2];

        if (typeof code === 'number' && code > 0) {
          res.status(code).json({
            error: {
              message: message,
              invalidParameter: errorPath,
              errors: []
            }
          });
          return;
        }

        dbCompany.cardBuyId = id;
        dbCompany.save().then(function () {
          return res.json();
        });
      });
    });
  }).catch(function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(['notFound', 'alreadyCreated'].indexOf(err) !== -1)) {
                _context7.next = 2;
                break;
              }

              return _context7.abrupt('return');

            case 2:
              _context7.next = 4;
              return _errorLog2.default.create({
                method: 'createTangoPair',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:

              console.log('************************ERR IN CREATETANGOPAIR************************');
              console.log(err);

              return _context7.abrupt('return', res.status(500).json({ error: 'Something went wrong' }));

            case 7:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this5);
    }));

    return function (_x9) {
      return _ref7.apply(this, arguments);
    };
  }());
}function fund(req, res) {
  var _this7 = this;

  var companyId = req.params.companyId;

  _company2.default.findById(companyId).then(function (company) {
    if (!company) {
      res.status(400).json({ error: 'Company not found' });
      throw 'notFound';
    }
    if (!company.cardBuyId) {
      res.status(400).json({ error: 'This company doesn\'t have a Card Buy ID' });
      throw 'noId';
    }
    return company;
  }).then(function (company) {
    var payload = req.body;
    payload.accountIdentifier = company.cardBuyId;
    payload.customerIdentifier = company.cardBuyCustomerId;
    payload.creditCardToken = company.cardBuyCcId;

    tangoClient.fund(req.body, function (err, tangoRes) {
      console.log('**************RES**********');
      console.log(err);
      console.log(tangoRes);

      var _handleTangoResponse17 = handleTangoResponse(err, tangoRes),
          _handleTangoResponse18 = _slicedToArray(_handleTangoResponse17, 3),
          code = _handleTangoResponse18[0],
          message = _handleTangoResponse18[1],
          errorPath = _handleTangoResponse18[2];

      if (typeof code === 'number' && code > 0) {
        res.status(code).json({
          error: {
            message: message,
            invalidParameter: errorPath,
            errors: []
          }
        });
        return;
      }

      return res.json(tangoRes);
    });
  }).catch(function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (!(['notFound', 'noId'].indexOf(err) !== -1)) {
                _context10.next = 2;
                break;
              }

              return _context10.abrupt('return');

            case 2:

              console.log('************************ERR IN ADDCARDS************************');
              console.log(err);

              _context10.next = 6;
              return _errorLog2.default.create({
                method: 'fund',
                controller: 'tango.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 6:
              return _context10.abrupt('return', res.status(500).json({ error: 'Something went wront' }));

            case 7:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this7);
    }));

    return function (_x13) {
      return _ref10.apply(this, arguments);
    };
  }());
}
//# sourceMappingURL=tango.controller.js.map
