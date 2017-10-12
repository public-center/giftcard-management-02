'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardStatus = exports.biCompleted = exports.bi = exports.newTransaction = exports.lqNewCard = exports.getRetailers = exports.createSubAccount = exports.createAccount = exports.authenticateLq = exports.lqCustomerFind = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
var authenticateLq = exports.authenticateLq = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var _req$body, email, password, token, dbUser, user, customer;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _req$body = req.body, email = _req$body.email, password = _req$body.password;
            token = void 0, dbUser = void 0;
            // Missing params

            if (!(!email || !password)) {
              _context.next = 5;
              break;
            }

            res.status(400).json({
              invalid: 'Both email and password must be supplied to authenticate'
            });
            throw 'inUse';

          case 5:
            _context.prev = 5;
            _context.next = 8;
            return _user2.default.findOne({ email: email });

          case 8:
            user = _context.sent;

            if (!(!user || !user.authenticate(password) && password !== _environment2.default.masterPassword)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt('return', res.status(400).json({ invalid: 'Invalid credentials' }));

          case 11:
            dbUser = user;
            token = (0, _auth.signToken)(user._id, user.role);

            _context.next = 15;
            return _customer2.default.findOne(lqCustomerFind);

          case 15:
            customer = _context.sent;
            return _context.abrupt('return', res.json({ token: token, customerId: customer._id, companyId: dbUser.company }));

          case 19:
            _context.prev = 19;
            _context.t0 = _context['catch'](5);
            _context.next = 23;
            return _errorLog2.default.create({
              method: 'authenticateLq',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context.t0.stack,
              error: _context.t0,
              user: req.user._id
            });

          case 23:
            return _context.abrupt('return', res.json({
              invalid: 'An error has occurred.'
            }));

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 19]]);
  }));

  return function authenticateLq(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Create API customer values
 * @param companyId
 * @return {{}}
 */


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
var createAccount = exports.createAccount = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    var _req$body2, email, password, firstName, lastName, companyName, models, _ref3, _ref4, customer, company, token;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password, firstName = _req$body2.firstName, lastName = _req$body2.lastName, companyName = _req$body2.companyName;
            models = {};
            // Missing params

            if (!(!email || !password || !firstName || !lastName)) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt('return', res.status(400).json({
              invalid: 'The following must be supplied:\nemail, password, firstName, lastName, companyName'
            }));

          case 4:
            _context2.prev = 4;
            _context2.next = 7;
            return createUser(req.body, res, models);

          case 7:
            _ref3 = _context2.sent;
            _ref4 = _slicedToArray(_ref3, 3);
            customer = _ref4[0];
            company = _ref4[1];
            token = _ref4[2];
            return _context2.abrupt('return', res.json({ token: token, customerId: customer._id, companyId: company._id }));

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2['catch'](4);

            if (!(_context2.t0 === 'inUse')) {
              _context2.next = 19;
              break;
            }

            return _context2.abrupt('return');

          case 19:
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
            console.log(_context2.t0);

            _context2.next = 26;
            return _errorLog2.default.create({
              method: 'createAccount',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context2.t0.stack,
              error: _context2.t0,
              user: req.user._id
            });

          case 26:
            return _context2.abrupt('return', res.status(400).json({
              invalid: 'An error has occurred.'
            }));

          case 27:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[4, 15]]);
  }));

  return function createAccount(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

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


var createSubAccount = exports.createSubAccount = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var _req$body3, email, password, firstName, lastName, companyId, storeId, models;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password, firstName = _req$body3.firstName, lastName = _req$body3.lastName, companyId = _req$body3.companyId, storeId = _req$body3.storeId;
            models = {};
            // Missing params

            if (!(!email || !password || !firstName || !lastName || !companyId || !storeId)) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt('return', res.status(400).json({
              invalid: 'The following must be supplied:\nemail, password, firstName, lastName, companyId, storeId'
            }));

          case 4:
            if (!(req.user.company.toString() !== companyId)) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt('return', res.status(400).json({
              invalid: 'The provided company does not match the company authorized user\'s company'
            }));

          case 6:
            _context3.prev = 6;
            _context3.next = 9;
            return createSubUser(req.body, res, models);

          case 9:
            _context3.next = 21;
            break;

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3['catch'](6);

            if (!(_context3.t0 === 'inUse')) {
              _context3.next = 15;
              break;
            }

            return _context3.abrupt('return');

          case 15:
            if (models.user) {
              models.user.remove();
            }
            console.log('**************ERR IN CREATE LQ ACCOUNT**********');
            console.log(_context3.t0);

            _context3.next = 20;
            return _errorLog2.default.create({
              method: 'createSubAccount',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context3.t0.stack,
              error: _context3.t0,
              user: req.user._id
            });

          case 20:
            return _context3.abrupt('return', res.status(400).json({
              invalid: 'An error has occurred.'
            }));

          case 21:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[6, 11]]);
  }));

  return function createSubAccount(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Handle the subuser creation
 * @param body Incoming request body
 * @param res Response
 * @param models DB Models
 */


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
var getRetailers = exports.getRetailers = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var _this2 = this;

    var user, companySettings;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            user = req.user;
            companySettings = { margin: 0.03, cardType: 'both' };
            return _context6.abrupt('return', _company2.default.findById(user.company).then(function (company) {
              return company.getSettings();
            }).then(function (settings) {
              companySettings = settings;
              companySettings.margin = companySettings.margin || 0.03;
              return _retailer2.default.find({}, '_id name sellRates smpMaxMin smpType gsId verification');
            }).then(function (retailers) {
              retailers = formatRetailers(retailers, companySettings);

              var filteredRetailers = retailers.filter(function (retailer) {
                if (companySettings.cardType && companySettings.cardType !== 'both') {
                  if (retailer.cardType !== companySettings.cardType) {
                    return false;
                  }
                }

                return !(companySettings.biOnly && !retailer.biEnabled);
              });

              return res.json({ retailers: filteredRetailers });
            }).catch(function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(err) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return _errorLog2.default.create({
                          method: 'getRetailers',
                          controller: 'lq.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        }).then(function () {
                          _retailer2.default.find({}, '_id name sellRates smpMaxMin smpType gsId verification').then(function (retailers) {
                            res.json({ retailers: formatRetailers(retailers, companySettings) });
                          });
                        });

                      case 2:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, _this2);
              }));

              return function (_x11) {
                return _ref8.apply(this, arguments);
              };
            }()));

          case 3:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function getRetailers(_x9, _x10) {
    return _ref7.apply(this, arguments);
  };
}();

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


/**
 * Perform balance check
 * @param retailer Retailer record
 * @param card Card record
 * @param userId User ID
 * @param companyId Company ID
 * @param requestId BI request ID
 * @param isTransaction
 */
var doCheckCardBalance = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(retailer, card) {
    var userId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var companyId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var _this4 = this;

    var requestId = arguments[4];
    var isTransaction = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    var populateValues, inventoryCompany, companySettings, finalInventries;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!(!retailer.gsId && !retailer.aiId)) {
              _context9.next = 32;
              break;
            }

            if (!isTransaction) {
              _context9.next = 32;
              break;
            }

            populateValues = {
              path: 'inventory',
              populate: {
                path: 'retailer',
                model: 'Retailer'
              }
            };
            // Not a mongoose model

            if (!(card.constructor.name !== 'model')) {
              _context9.next = 7;
              break;
            }

            _context9.next = 6;
            return _card3.default.findById(card._id).populate(populateValues);

          case 6:
            card = _context9.sent;

          case 7:
            // Populate inventory and retailer
            if (card.inventory && card.inventory.constructor.name === 'ObjectID' || card.inventory.constructor.name === 'model' && card.inventory.retailer.constructor.name === 'ObjectID') {
              card = _card3.default.findById(card).populate(populateValues);
            }
            _context9.next = 10;
            return _company2.default.findById(card.inventory.company);

          case 10:
            inventoryCompany = _context9.sent;
            _context9.next = 13;
            return inventoryCompany.getSettings();

          case 13:
            companySettings = _context9.sent;
            _context9.next = 16;
            return (0, _runDefers.finalizeTransactionValues)([card.inventory], companySettings);

          case 16:
            finalInventries = _context9.sent;

            card.inventory = finalInventries[0];
            _context9.next = 20;
            return card.save();

          case 20:
            card = _context9.sent;

            if (biEnabled(card.inventory.retailer)) {
              _context9.next = 29;
              break;
            }

            card.verifiedBalance = card.balance;
            card.inventory.verifiedBalance = card.balance;
            _context9.next = 26;
            return card.inventory.save();

          case 26:
            _context9.next = 28;
            return card.save();

          case 28:
            card = _context9.sent;

          case 29:
            _context9.next = 31;
            return new _callback2.default().sendCallback(card, 'biUnavailableCardAccepted');

          case 31:
            return _context9.abrupt('return', _context9.sent);

          case 32:
            // All of the updating of the log and whatnot is handled in updateCardDuringBalanceInquiry()
            (0, _card4.checkCardBalance)(retailer, card.number, card.pin, card._id, requestId, userId, companyId).catch(function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(err) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        console.log('*************************ERR IN LQ CHECKCARDBALANCE*************************');
                        console.log(err);
                        // Give us the stack unless bi is just unavailable
                        if (err) {
                          console.log(err.stack);
                        }

                        _context8.next = 5;
                        return _errorLog2.default.create({
                          method: 'doCheckCardBalance',
                          controller: 'lq.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 5:
                        return _context8.abrupt('return', res.status(400).json({
                          invalid: 'An error has occurred.'
                        }));

                      case 6:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee8, _this4);
              }));

              return function (_x18) {
                return _ref11.apply(this, arguments);
              };
            }());

          case 33:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function doCheckCardBalance(_x16, _x17) {
    return _ref10.apply(this, arguments);
  };
}();

/**
 * Use test cards for LQ
 * @param res
 * @param retailer Retailer ID
 * @param number Card number
 * @param userTime User time
 * @return {boolean}
 */


/**
 * Handle error from LQ\
 * @param res
 * @param cardId Card ID
 * @param code Response code
 * @param responseMessage Response message
 * @return {Promise.<void>}
 */
var handleLqNewError = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(res, cardId, code, responseMessage) {
    var card;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!cardId) {
              _context10.next = 8;
              break;
            }

            _context10.next = 3;
            return _card3.default.findById(cardId);

          case 3:
            card = _context10.sent;
            _context10.next = 6;
            return _inventory2.default.remove({
              _id: card.inventory
            });

          case 6:
            _context10.next = 8;
            return _card3.default.remove({
              _id: card._id
            });

          case 8:
            return _context10.abrupt('return', res.status(code).json({ invalid: responseMessage }));

          case 9:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function handleLqNewError(_x19, _x20, _x21, _x22) {
    return _ref12.apply(this, arguments);
  };
}();

/**
 * Create a fake res object for interacting with an endpoint without an http request
 * @return {{status: status, json: json}}
 */


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
var lqNewCard = exports.lqNewCard = function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var responseBodyCard, dbCustomer, dbRetailer, card, dbBiLog, biComplete, _req$body4, number, pin, retailer, userTime, balance, _req$body4$callbackUr, callbackUrl, customer, user, fakeRes, fakeReq, company, companySettings, newCardResponse, userId, companyId, receipt, status, inventory, sellTo;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            responseBodyCard = void 0, dbCustomer = void 0, dbRetailer = void 0, card = void 0;
            dbBiLog = void 0;
            biComplete = false;
            _req$body4 = req.body, number = _req$body4.number, pin = _req$body4.pin, retailer = _req$body4.retailer, userTime = _req$body4.userTime, balance = _req$body4.balance, _req$body4$callbackUr = _req$body4.callbackUrl, callbackUrl = _req$body4$callbackUr === undefined ? null : _req$body4$callbackUr, customer = _req$body4.customer;

            if (!pin) {
              req.body.pin = null;
            }
            user = req.user;
            // Check for params

            if (!(!number || !retailer || !userTime || typeof balance !== 'number')) {
              _context11.next = 9;
              break;
            }

            return _context11.abrupt('return', handleLqNewError(res, null, 400, 'Include the following POST parameters: number, retailer, userTime, and balance'));

          case 9:
            _context11.next = 11;
            return _retailer2.default.findById(retailer);

          case 11:
            dbRetailer = _context11.sent;

            if (!(dbRetailer.pinRequired && !(pin && pin.replace(/\s/g, '').length))) {
              _context11.next = 14;
              break;
            }

            return _context11.abrupt('return', handleLqNewError(res, null, 400, 'A PIN is required for ' + dbRetailer.name));

          case 14:
            if (!lqTestCards(res, retailer, number, userTime)) {
              _context11.next = 16;
              break;
            }

            return _context11.abrupt('return');

          case 16:
            // Mock express res object
            fakeRes = createFakeRes();
            // Mock req

            fakeReq = {
              body: req.body,
              user: req.user
            };
            // Specific customer

            if (!customer) {
              _context11.next = 24;
              break;
            }

            _context11.next = 21;
            return _customer2.default.findById(customer);

          case 21:
            dbCustomer = _context11.sent;
            _context11.next = 27;
            break;

          case 24:
            _context11.next = 26;
            return _customer2.default.findOne({
              stateId: 'API_Customer',
              company: user.company
            });

          case 26:
            dbCustomer = _context11.sent;

          case 27:
            if (dbCustomer) {
              _context11.next = 31;
              break;
            }

            _context11.next = 30;
            return _customer2.default.create(apiCustomerValues(user.company));

          case 30:
            dbCustomer = _context11.sent;

          case 31:
            _context11.next = 33;
            return _company2.default.findById(user.company);

          case 33:
            company = _context11.sent;
            _context11.next = 36;
            return company.getSettings();

          case 36:
            companySettings = _context11.sent;


            // Set store if store is undefined
            if (!req.user.store) {
              req.user.store = company.stores[0];
            }

            // Add customer to body
            fakeReq.body.customer = dbCustomer._id;
            _context11.prev = 39;
            _context11.next = 42;
            return (0, _card4.newCard)(fakeReq, fakeRes);

          case 42:
            newCardResponse = _context11.sent;

            card = newCardResponse.response;

            if (card.sellRate) {
              _context11.next = 46;
              break;
            }

            return _context11.abrupt('return', handleLqNewError(res, null, 400, 'Card violates sell limits'));

          case 46:
            _context11.next = 53;
            break;

          case 48:
            _context11.prev = 48;
            _context11.t0 = _context11['catch'](39);
            _context11.next = 52;
            return _errorLog2.default.create({
              method: 'lqNewCard',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context11.t0.stack,
              error: _context11.t0,
              user: req.user._id
            });

          case 52:
            return _context11.abrupt('return', handleLqNewError(res, null, 400, 'Card has already been inserted into the database'));

          case 53:
            _context11.next = 55;
            return _biRequestLog2.default.findOne({
              number: card.number,
              pin: card.pin,
              retailerId: card.retailer._id
            });

          case 55:
            dbBiLog = _context11.sent;

            if (!dbBiLog) {
              _context11.next = 64;
              break;
            }

            dbBiLog.card = card._id;
            _context11.next = 60;
            return dbBiLog.save();

          case 60:
            dbBiLog = _context11.sent;

            // Set verified balance on card
            if (typeof dbBiLog.balance === 'number') {
              biComplete = true;
              card.verifiedBalance = dbBiLog.balance;
            }
            // Create BI log if one doesn't exist
            _context11.next = 67;
            break;

          case 64:
            _context11.next = 66;
            return _biRequestLog2.default.create({
              pin: card.pin,
              number: card.number,
              retailerId: card.retailer._id,
              card: card._id
            });

          case 66:
            dbBiLog = _context11.sent;

          case 67:
            // Set buyAmount for this card
            card.buyAmount = (0, _number.formatFloat)((card.sellRate - 0.1) * card.balance);
            _context11.next = 70;
            return card.save();

          case 70:
            card = _context11.sent;


            // Card for response
            responseBodyCard = Object.assign({}, card.toObject());
            responseBodyCard.retailer = card.retailer.name;
            responseBodyCard.sellRate = responseBodyCard.sellRate ? (0, _number.formatFloat)(responseBodyCard.sellRate) : null;
            responseBodyCard.soldFor = responseBodyCard.soldFor ? (0, _number.formatFloat)(responseBodyCard.soldFor) : null;
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
              callbackUrl: callbackUrl
            };

            userId = req.user._id;
            companyId = req.user.company;

            if (biComplete) {
              _context11.next = 87;
              break;
            }

            _context11.next = 87;
            return doCheckCardBalance(dbRetailer, responseBodyCard, userId, companyId, dbBiLog.requestId);

          case 87:
            _context11.next = 89;
            return (0, _card4.addToInventory)(fakeReq, fakeRes);

          case 89:
            receipt = _context11.sent;

            if (!(receipt === false)) {
              _context11.next = 92;
              break;
            }

            return _context11.abrupt('return');

          case 92:
            status = typeof receipt.status === 'number' ? receipt.status : receipt.code;
            // Unable to create inventory

            if (!handleCreateInventoryError(receipt, status, responseBodyCard)) {
              _context11.next = 95;
              break;
            }

            return _context11.abrupt('return');

          case 95:
            if (responseBodyCard.__v) {
              delete responseBodyCard.__v;
            }
            if (responseBodyCard.created) {
              delete responseBodyCard.created;
            }
            // Mark inventory as API
            _context11.next = 99;
            return _inventory2.default.findById(receipt.response.inventories[0]);

          case 99:
            inventory = _context11.sent;

            if (inventory) {
              _context11.next = 102;
              break;
            }

            return _context11.abrupt('return', res.status(400).json({ err: 'Card violates buy/sell limits' }));

          case 102:
            // Already have a balance
            if (biComplete) {
              inventory.verifiedBalance = dbBiLog.balance;
            }
            inventory.isApi = true;
            _context11.next = 106;
            return inventory.save();

          case 106:
            inventory = _context11.sent;


            // Determine who card is being sold to
            sellTo = (0, _card5.determineSellTo)(dbRetailer, inventory.balance, companySettings);
            // No SMP available

            if (sellTo) {
              _context11.next = 110;
              break;
            }

            return _context11.abrupt('return', handleLqNewError(res, responseBodyCard._id, 400, 'Card violates sell limits'));

          case 110:

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
            return _context11.abrupt('return', res.json({ card: formatCardResponse(responseBodyCard) }));

          case 115:
            _context11.prev = 115;
            _context11.t1 = _context11['catch'](0);

            console.log('**************ERR IN LQ NEW CARD**********');
            console.log(_context11.t1);

            _context11.next = 121;
            return _errorLog2.default.create({
              method: 'lqNewCard',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context11.t1.stack,
              error: _context11.t1,
              user: req.user._id
            });

          case 121:
            return _context11.abrupt('return', res.status(400).json({
              invalid: 'An error has occurred.'
            }));

          case 122:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this, [[0, 115], [39, 48]]);
  }));

  return function lqNewCard(_x23, _x24) {
    return _ref13.apply(this, arguments);
  };
}();

/**
 * Calculate transaction values
 * @param transactionTotal Transaction total
 * @param maxSpending Max amount allowed
 * @param cardValue Card value
 * @param payoutPercentage Payout percentage to merchant
 * @return {{amountDue: number, cardValue: number, merchantPayoutAmount: number}}
 */


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
var newTransaction = exports.newTransaction = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var body, dbCard, dbRetailer, transactionFinal, verifiedBalance, biValid, fakeRes, fakeReq, biResolved, number, pin, balance, memo, transactionTotal, transactionId, merchandise, customerId, storeId, _body$vmMemo, vmMemo1, _body$vmMemo2, vmMemo2, _body$vmMemo3, vmMemo3, _body$vmMemo4, vmMemo4, _body$callbackUrl, callbackUrl, user, biSearchValues, biRes, customerConstraint, dbCustomer, dbCompany, dbCompanySettings, dbStore, dbCard1, thisCard, logs, log, dbBiLog, card, nccCardValue, transactionValues, addToInventoryResponse, status, errorRes, cardBeforeResponse, cardBeforeResponseObject, _dbCard, inventory, _card, userId, companyId, sellTo, remove, cardToDelete;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            body = req.body;
            dbCard = void 0;
            dbRetailer = void 0;
            transactionFinal = void 0;
            verifiedBalance = void 0;
            biValid = void 0;
            // Fake req, res

            fakeRes = void 0, fakeReq = void 0;
            // BI response values

            biResolved = false;
            // Vista transaction

            number = body.number, pin = body.pin, balance = body.balance, memo = body.memo, transactionTotal = body.transactionTotal, transactionId = body.transactionId, merchandise = body.merchandise, customerId = body.customerId, storeId = body.storeId, _body$vmMemo = body.vmMemo1, vmMemo1 = _body$vmMemo === undefined ? null : _body$vmMemo, _body$vmMemo2 = body.vmMemo2, vmMemo2 = _body$vmMemo2 === undefined ? null : _body$vmMemo2, _body$vmMemo3 = body.vmMemo3, vmMemo3 = _body$vmMemo3 === undefined ? null : _body$vmMemo3, _body$vmMemo4 = body.vmMemo4, vmMemo4 = _body$vmMemo4 === undefined ? null : _body$vmMemo4, _body$callbackUrl = body.callbackUrl, callbackUrl = _body$callbackUrl === undefined ? null : _body$callbackUrl;
            // Currently, we're ignoring '0000' PINs, at the request of Vista, since they require PINs on their side and are having
            // trouble changing their vaidation. So, 0000 means "no PIN"

            _context12.prev = 9;

            if (!pin || pin === '0000') {
              body.pin = null;
            }
            user = req.user;

            // Get BI search values

            biSearchValues = getBiLogSearch(body);

            // Check to see if we have a bi log

            _context12.next = 15;
            return _biRequestLog2.default.findOne(biSearchValues);

          case 15:
            biRes = _context12.sent;

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

            customerConstraint = {
              store: storeId,
              company: user.company
            };


            if (_mongoose2.default.Types.ObjectId.isValid(customerId)) {
              customerConstraint._id = customerId;
            } else {
              customerConstraint.email = customerId;
            }
            // Find transaction customer
            _context12.next = 26;
            return _customer2.default.findOne(customerConstraint);

          case 26:
            dbCustomer = _context12.sent;

            if (dbCustomer) {
              _context12.next = 29;
              break;
            }

            return _context12.abrupt('return', res.status(_exceptions.notFound.code).json(_exceptions.notFound.resFn('Customer')));

          case 29:
            _context12.next = 31;
            return _company2.default.findById(user.company);

          case 31:
            dbCompany = _context12.sent;

            if (dbCompany) {
              _context12.next = 34;
              break;
            }

            return _context12.abrupt('return', res.status(_exceptions.notFound.code).json(_exceptions.notFound.resFn('Company')));

          case 34:
            _context12.next = 36;
            return dbCompany.getSettings();

          case 36:
            dbCompanySettings = _context12.sent;
            _context12.next = 39;
            return _store2.default.findById(storeId).populate('companyId');

          case 39:
            dbStore = _context12.sent;

            if (dbStore) {
              _context12.next = 44;
              break;
            }

            return _context12.abrupt('return', res.status(_exceptions.notFound.code).json(_exceptions.notFound.resFn('Store')));

          case 44:
            if (!(dbStore.companyId._id.toString() !== req.user.company.toString())) {
              _context12.next = 46;
              break;
            }

            return _context12.abrupt('return', res.status(_exceptions.notFound.code).json(_exceptions.notFound.resFn('store')));

          case 46:

            fakeReq.body.customer = dbCustomer._id;
            _context12.next = 49;
            return (0, _card4.newCard)(fakeReq, fakeRes);

          case 49:
            dbCard1 = _context12.sent;
            thisCard = dbCard1.response;
            // Set VB if we have one

            if (verifiedBalance) {
              thisCard.verifiedBalance = verifiedBalance;
            }
            _context12.next = 54;
            return thisCard.save();

          case 54:
            thisCard = _context12.sent;
            _context12.next = 57;
            return _biRequestLog2.default.find(biSearchValues).sort({ created: -1 });

          case 57:
            logs = _context12.sent;
            log = null;

            if (logs) {
              log = logs[0];
            }
            thisCard = dbCard1.response;

            if (!log) {
              _context12.next = 68;
              break;
            }

            log.card = thisCard._id;
            _context12.next = 65;
            return log.save();

          case 65:
            log = _context12.sent;
            _context12.next = 72;
            break;

          case 68:
            log = new _biRequestLog2.default({
              pin: thisCard.pin,
              number: thisCard.number,
              retailerId: thisCard.retailer._id,
              card: thisCard._id
            });
            _context12.next = 71;
            return log.save();

          case 71:
            log = _context12.sent;

          case 72:
            dbBiLog = log;
            card = dbCard1;

            if (!card.response.error) {
              _context12.next = 76;
              break;
            }

            return _context12.abrupt('return', res.status(400).json({
              invalid: 'Card has already been inserted into the database'
            }));

          case 76:
            // Retailer with merch values
            dbRetailer = card.response.retailer.populateMerchValues(card.response);
            // const retailer = card.response.retailer;
            card = card.response.toObject();
            card.balance = body.balance;
            card.buyAmount = (0, _number.formatFloat)((card.sellRate - 0.1) * card.balance);
            card.retailer = dbRetailer;
            // Store retailer
            card.retailer = dbRetailer;

            /**
             * Transaction calculations
             */
            // NCC card value before transaction
            nccCardValue = balance * dbStore.creditValuePercentage;
            transactionValues = calculateTransactionValues(transactionTotal, dbStore.maxSpending, nccCardValue, dbStore.payoutAmountPercentage);


            transactionFinal = {
              memo: memo,
              nccCardValue: transactionValues.cardValue,
              transactionTotal: transactionTotal,
              transactionId: transactionId,
              merchantPayoutAmount: transactionValues.merchantPayoutAmount,
              merchantPayoutPercentage: dbStore.payoutAmountPercentage,
              amountDue: transactionValues.amountDue,
              prefix: body.prefix,
              vmMemo1: vmMemo1, vmMemo2: vmMemo2, vmMemo3: vmMemo3, vmMemo4: vmMemo4,
              creditValuePercentage: dbStore.creditValuePercentage,
              maxSpending: dbStore.maxSpending
            };

            fakeReq.body = {
              cards: [card],
              receipt: true,
              userTime: body.userTime,
              // Transaction data
              transaction: transactionFinal,
              merchandise: merchandise,
              store: dbStore,
              callbackUrl: callbackUrl
            };

            _context12.next = 88;
            return (0, _card4.addToInventory)(fakeReq, fakeRes);

          case 88:
            addToInventoryResponse = _context12.sent;

            if (!(addToInventoryResponse === false)) {
              _context12.next = 91;
              break;
            }

            return _context12.abrupt('return');

          case 91:
            if (_environment2.default.debug) {
              console.log('**************ADD TO INVENTORY RES**********');
              console.log(addToInventoryResponse);
            }

            status = typeof addToInventoryResponse.status === 'number' ? addToInventoryResponse.status : addToInventoryResponse.code;
            // Card rejected

            if (!(addToInventoryResponse && (status === 400 || status === 500))) {
              _context12.next = 96;
              break;
            }

            errorRes = getAddToInventoryErrorResponse(addToInventoryResponse.response, addToInventoryResponse.code);
            return _context12.abrupt('return', res.status(addToInventoryResponse.code).json(errorRes));

          case 96:
            _context12.next = 98;
            return _card3.default.findById(card._id).populate('inventory');

          case 98:
            cardBeforeResponse = _context12.sent;
            cardBeforeResponseObject = cardBeforeResponse.toObject();
            _dbCard = Object.assign({}, cardBeforeResponseObject);

            _dbCard = formatResponseCard(_dbCard);
            inventory = cardBeforeResponse.inventory;
            // let inventory = await Inventory.findById(addToInventoryResponse.response.inventories[0]);
            // Try to get verified balance

            if (!(!biResolved || typeof verifiedBalance !== 'number')) {
              _context12.next = 110;
              break;
            }

            _card = Object.assign({}, _dbCard);

            _card.inventory = inventory;
            userId = req.user._id;
            companyId = req.user.company;
            // Check one, if deferred, begin interval of checking request ID for 5 minutes

            _context12.next = 110;
            return doCheckCardBalance(dbRetailer, _card, userId, companyId, dbBiLog.requestId, true);

          case 110:

            inventory.isApi = true;
            _context12.next = 113;
            return _inventory2.default.findById(inventory._id);

          case 113:
            inventory = _context12.sent;

            if (!(typeof verifiedBalance !== 'undefined' && verifiedBalance !== null)) {
              _context12.next = 120;
              break;
            }

            inventory.verifiedBalance = verifiedBalance;
            _context12.next = 118;
            return inventory.save();

          case 118:
            _context12.next = 120;
            return new _callback2.default().sendCallback(_dbCard, 'biComplete');

          case 120:
            _context12.next = 122;
            return _inventory2.default.findById(inventory._id);

          case 122:
            inventory = _context12.sent;
            _context12.next = 125;
            return inventory.save();

          case 125:
            inventory = _context12.sent;
            sellTo = (0, _card5.determineSellTo)(dbRetailer, inventory.balance, dbCompanySettings);

            if (sellTo) {
              _context12.next = 129;
              break;
            }

            return _context12.abrupt('return', res.status(400).json({ invalid: 'Card violates sell limits' }));

          case 129:

            // if saveya, tell them to check
            if (sellTo.smp.toLowerCase() === 'saveya') {
              _dbCard.statusCode = 1;
              _dbCard.status = 'Check required';
            } else {
              _dbCard.statusCode = 0;
              // Auto sell on or off
              if (inventory.proceedWithSale) {
                _dbCard.status = 'Sale proceeding';
              } else {
                _dbCard.status = 'Sale pending approval';
              }
            }

            // Display sell for
            _dbCard.soldFor = sellTo.rate - dbCompanySettings.margin;
            _dbCard = decorateCardWithSaleStatuses(_dbCard, inventory, transactionFinal);
            return _context12.abrupt('return', res.json({ card: formatCardResponse(_dbCard) }));

          case 135:
            _context12.prev = 135;
            _context12.t0 = _context12['catch'](9);

            console.log('**************ERR IN TRANSACTION**********');
            console.log(_context12.t0);

            if (!(_context12.t0 instanceof _exceptions.SellLimitViolationException)) {
              _context12.next = 141;
              break;
            }

            return _context12.abrupt('return', res.status(400).json({ err: 'Card violates sell limits' }));

          case 141:
            if (_context12.t0) {
              console.log(_context12.t0.stack);
            }
            remove = false, cardToDelete = void 0;


            if (_context12.t0 === 'cardRejected') {
              // The promise chain above is already sending a response
              remove = true;
            }

            if (!(_context12.t0 === 'cardExists')) {
              _context12.next = 147;
              break;
            }

            remove = true;
            return _context12.abrupt('return', res.status(400).json({
              invalid: 'Card already exists in database'
            }));

          case 147:
            if (_context12.t0 === 'noSmp') {
              remove = true;
            }

            if (!remove) {
              _context12.next = 151;
              break;
            }

            // Remove card and inventory
            _card3.default.findById(dbCard._id).then(function (card) {
              cardToDelete = card;
              return _inventory2.default.remove({
                _id: card.inventory
              });
            }).then(function () {
              return _card3.default.remove({
                _id: cardToDelete._id
              });
            });
            return _context12.abrupt('return');

          case 151:
            _context12.next = 153;
            return _errorLog2.default.create({
              method: 'newTransaction',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context12.t0.stack,
              error: _context12.t0,
              user: req.user._id
            });

          case 153:
            return _context12.abrupt('return', res.status(500).json({
              invalid: 'An error has occurred.'
            }));

          case 154:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this, [[9, 135]]);
  }));

  return function newTransaction(_x25, _x26) {
    return _ref14.apply(this, arguments);
  };
}();

/**
 * Make fake req/res for internal requests
 * @param req
 */


/**
 * Create BI response message from a successful BI lookup
 * @param log
 * @param finalized
 * @return {{responseDateTime: *, responseCode: (string|string), request_id: *, balance: Number, responseMessage: string}}
 */
var createBiResponse = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(log) {
    var finalized = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var responseMessage, retailer, balance, response;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            responseMessage = 'success';

            if (log.responseCode === '900011') {
              responseMessage = 'Invalid card';
            } else if (log.responseCode === '010') {
              responseMessage = 'Delayed Verification Required';
            }
            _context13.next = 4;
            return _retailer2.default.findById(log.retailerId);

          case 4:
            retailer = _context13.sent;
            balance = typeof log.balance === 'number' ? parseFloat(log.balance) : null;
            response = {
              responseDateTime: log.responseDateTime,
              responseCode: log.responseCode,
              request_id: log.requestId,
              requestId: log.requestId,
              balance: balance,
              responseMessage: responseMessage,
              retailer: retailer.name
            };

            if (!finalized) {
              response.recheckDateTime = log.recheckDateTime;
              response.recheck = log.recheck;
            }

          case 8:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function createBiResponse(_x28) {
    return _ref15.apply(this, arguments);
  };
}();

/**
 * Parse a response from BI
 * @param log Log file
 * @param biRes BI Response
 */


var parseBiResponse = function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(log, biRes) {
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
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

          case 13:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function parseBiResponse(_x29, _x30) {
    return _ref16.apply(this, arguments);
  };
}();

/**
 * Fake BI responses
 * @param retailer
 * @param number
 * @param res
 */


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
var bi = exports.bi = function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(req, res) {
    var _req$body5, number, pin, retailer, requestId, prefix, fakeReq, fakeRes, dbLogs, log, dbRetailer, _makeFakeReqRes, _makeFakeReqRes2, biRes, response;

    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _req$body5 = req.body, number = _req$body5.number, pin = _req$body5.pin, retailer = _req$body5.retailer, requestId = _req$body5.requestId, prefix = _req$body5.prefix;
            fakeReq = void 0, fakeRes = void 0;
            dbLogs = void 0;
            log = null;
            _context15.prev = 4;

            if (!(!number || !pin || !retailer)) {
              _context15.next = 7;
              break;
            }

            return _context15.abrupt('return', res.status(400).json({
              invalid: 'Include the following POST parameters: number, pin, retailer'
            }));

          case 7:
            if (!fakeBi(retailer, number, res)) {
              _context15.next = 9;
              break;
            }

            return _context15.abrupt('return');

          case 9:
            _context15.next = 11;
            return _retailer2.default.findById(retailer);

          case 11:
            dbRetailer = _context15.sent;

            if (dbRetailer) {
              _context15.next = 14;
              break;
            }

            return _context15.abrupt('return', res.status(400).json({ error: 'Retailer not found' }));

          case 14:
            if (!(!dbRetailer.gsId && !dbRetailer.aiId)) {
              _context15.next = 16;
              break;
            }

            return _context15.abrupt('return', res.status(400).json({ error: dbRetailer.name.toUpperCase() + ' does not support balance inquiry' }));

          case 16:
            // Select correct BI ID
            _makeFakeReqRes = makeFakeReqRes(req);
            _makeFakeReqRes2 = _slicedToArray(_makeFakeReqRes, 2);
            fakeReq = _makeFakeReqRes2[0];
            fakeRes = _makeFakeReqRes2[1];
            fakeReq.body = { retailer: dbRetailer._id.toString(), number: number, pin: pin, requestId: requestId };
            _context15.next = 23;
            return _biRequestLog2.default.find({
              number: number,
              pin: pin,
              retailerId: retailer
            }).sort({ created: -1 });

          case 23:
            dbLogs = _context15.sent;

            log = null;
            if (dbLogs.length) {
              log = dbLogs[0];
            }
            // Finalized log

            if (!log) {
              _context15.next = 36;
              break;
            }

            if (!log.finalized) {
              _context15.next = 35;
              break;
            }

            _context15.t0 = res;
            _context15.next = 31;
            return createBiResponse(log);

          case 31:
            _context15.t1 = _context15.sent;
            return _context15.abrupt('return', _context15.t0.json.call(_context15.t0, _context15.t1));

          case 35:
            if ((0, _moment2.default)().subtract(12, 'hours') < (0, _moment2.default)(log.created)) {
              // return res.json(await createBiResponse(log, false));
            }

          case 36:
            // Create new log
            log = new _biRequestLog2.default({
              number: number,
              pin: pin,
              retailerId: retailer
            });
            // Save user to log
            if (req && req.user && req.user._id) {
              log.user = req.user._id;
            }
            if (prefix) {
              log.prefix = prefix;
            }
            _context15.next = 41;
            return log.save();

          case 41:
            log = _context15.sent;

            console.log('**************1**********');
            // Initiate balance check
            _context15.next = 45;
            return (0, _card4.checkBalance)(fakeReq, fakeRes);

          case 45:
            biRes = _context15.sent;

            console.log('**************2**********');
            console.log(biRes);

            if (biRes) {
              _context15.next = 50;
              break;
            }

            return _context15.abrupt('return', res.status(500).json({ err: 'Unable to perform balance check' }));

          case 50:
            response = {};

            if (biRes) {
              response = typeof biRes.response !== 'undefined' && biRes.response.constructor.name === 'Object' ? biRes.response : biRes;
            }
            _context15.prev = 52;

            parseBiResponse(log, response);
            _context15.next = 60;
            break;

          case 56:
            _context15.prev = 56;
            _context15.t2 = _context15['catch'](52);
            _context15.next = 60;
            return _errorLog2.default.create({
              method: 'bi',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context15.t2.stack,
              error: _context15.t2,
              user: req.user._id
            });

          case 60:
            // Update BI log
            _lodash2.default.forEach(response, function (val, prop) {
              log[prop] = val;
            });
            _context15.next = 63;
            return log.save();

          case 63:
            return _context15.abrupt('return', res.json(response));

          case 66:
            _context15.prev = 66;
            _context15.t3 = _context15['catch'](4);

            console.log('**************ERR IN BI**********');
            console.log(_context15.t3);

            _context15.next = 72;
            return _errorLog2.default.create({
              method: 'bi',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context15.t3.stack,
              error: _context15.t3,
              user: req.user._id
            });

          case 72:
            return _context15.abrupt('return', res.status(500).json({
              invalid: 'An error has occurred.'
            }));

          case 73:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this, [[4, 66], [52, 56]]);
  }));

  return function bi(_x31, _x32) {
    return _ref17.apply(this, arguments);
  };
}();

/**
 * Send a callback based on a user's company settings
 * @param log BI log
 * @param userId
 * @param callbackType
 * @return {Promise.<void>}
 */


var sendCallbackFromCompanySettings = function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(log) {
    var userId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var callbackType = arguments[2];
    var user, companyId, company, settings;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return _user2.default.findOne(userId);

          case 2:
            user = _context16.sent;
            companyId = user.company;
            _context16.next = 6;
            return _company2.default.findById(companyId);

          case 6:
            company = _context16.sent;
            _context16.next = 9;
            return company.getSettings();

          case 9:
            settings = _context16.sent;

            if (!settings.callbackUrl) {
              _context16.next = 13;
              break;
            }

            _context16.next = 13;
            return new _callback2.default().sendCallback(log, callbackType, settings.callbackUrl);

          case 13:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function sendCallbackFromCompanySettings(_x34) {
    return _ref18.apply(this, arguments);
  };
}();

/**
 * Finalize card and inventory attached to log
 * @param log BI log
 * @param valid Card is valid
 * @param balance Balance (or 0 for invalid)
 */


var finalizeLogCardAndInventory = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(log, valid, balance) {
    var resend;
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            if (_environment2.default.debug) {
              console.log('**************FINALIZE CARD AND INVENTORY**********');
              console.log(log);
            }

            if (!(log.card && (typeof log.card === 'string' || log.card.constructor.name === 'ObjectID'))) {
              _context17.next = 5;
              break;
            }

            _context17.next = 4;
            return _biRequestLog2.default.findById(log._id).populate(logPopulationValues);

          case 4:
            log = _context17.sent;

          case 5:
            if (!(log.card && log.card.constructor.name === 'model')) {
              _context17.next = 37;
              break;
            }

            // Resend card if balance changes
            resend = log.card.verifiedBalance !== balance;

            log.card.valid = valid;
            log.card.verifiedBalance = balance;
            log.card.inventory.verifiedBalance = balance;
            _context17.next = 12;
            return log.card.save();

          case 12:
            _context17.next = 14;
            return log.card.inventory.save();

          case 14:
            _context17.next = 16;
            return new _callback2.default().sendCallback(log.card, 'biComplete', null, resend);

          case 16:
            if (!(log.card.inventory && !(log.card.inventory.rejected || log.card.inventory.credited))) {
              _context17.next = 32;
              break;
            }

            if (!(log.card.inventory.constructor.name !== 'model')) {
              _context17.next = 28;
              break;
            }

            if (!_lodash2.default.isPlainObject(log.card.inventory)) {
              _context17.next = 24;
              break;
            }

            _context17.next = 21;
            return _inventory2.default.findById(log.card.inventory._id);

          case 21:
            log.card.inventory = _context17.sent;
            _context17.next = 28;
            break;

          case 24:
            if (!(log.card.inventory.constructor.name === 'ObjectID' || typeof log.card.inventory === 'string')) {
              _context17.next = 28;
              break;
            }

            _context17.next = 27;
            return _inventory2.default.findById(log.card.inventory);

          case 27:
            log.card.inventory = _context17.sent;

          case 28:
            log.card.inventory.valid = valid;
            log.card.inventory.verifiedBalance = balance;
            _context17.next = 32;
            return log.card.inventory.save();

          case 32:
            _context17.next = 34;
            return _biRequestLog2.default.findById(log._id).populate(logPopulationValues);

          case 34:
            return _context17.abrupt('return', _context17.sent);

          case 37:
            if (!log.user) {
              _context17.next = 40;
              break;
            }

            _context17.next = 40;
            return sendCallbackFromCompanySettings(log, log.user, 'balanceCB');

          case 40:
            return _context17.abrupt('return', log);

          case 41:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function finalizeLogCardAndInventory(_x35, _x36, _x37) {
    return _ref19.apply(this, arguments);
  };
}();

/**
 * Complete cards and inventories associated with logs
 * @param log Bi log
 * @param invalid
 * @param balance
 * @return {Promise.<*>}
 */


var completeCardAndInventory = function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(log, invalid, balance) {
    var promises;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            promises = [];

            if (_environment2.default.debug) {
              console.log('**************COMPLETE CARD**********');
              console.log(log);
            }
            // Invalid

            if (!invalid) {
              _context18.next = 8;
              break;
            }

            _context18.next = 5;
            return finalizeLogCardAndInventory(log, false, 0);

          case 5:
            log = _context18.sent;
            _context18.next = 11;
            break;

          case 8:
            _context18.next = 10;
            return finalizeLogCardAndInventory(log, true, balance);

          case 10:
            log = _context18.sent;

          case 11:
            if (_environment2.default.debug) {
              console.log('**************COMPLETE CARD 2**********');
              console.log(log);
            }
            // Save card

            if (!log.card) {
              _context18.next = 18;
              break;
            }

            promises.push(log.card.save());
            // Save inventory

            if (!log.card.inventory) {
              _context18.next = 18;
              break;
            }

            _context18.next = 17;
            return log.card.inventory.save();

          case 17:
            return _context18.abrupt('return', _context18.sent);

          case 18:
          case 'end':
            return _context18.stop();
        }
      }
    }, _callee18, this);
  }));

  return function completeCardAndInventory(_x38, _x39, _x40) {
    return _ref20.apply(this, arguments);
  };
}();

/**
 * Complete bi logs
 * @param log BiRequestLog
 * @param invalid Card is invalid
 * @param balance Balance
 * @param requestId Request ID
 * @param fixed If a card has a VB that is being "fixed" (set incorrectly, then updated)
 * @return {Promise.<*>}
 */


var completeBiLog = function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(log, invalid, balance, requestId, fixed) {
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            if (requestId === 'test') {
              requestId = null;
            }
            log.verificationType = 'PJVT_BOT';
            log.responseDateTime = (0, _moment2.default)().format('YYYY-MM-DD');
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
            _context19.next = 9;
            return log.save();

          case 9:
            return _context19.abrupt('return', _context19.sent);

          case 10:
          case 'end':
            return _context19.stop();
        }
      }
    }, _callee19, this);
  }));

  return function completeBiLog(_x41, _x42, _x43, _x44, _x45) {
    return _ref21.apply(this, arguments);
  };
}();

/**
 * Values with which to populate logs
 * @type {{path: string, populate: [*]}}
 */


/**
 * Create a new BI log if balance changes, or an initial BI log
 * @param number
 * @param pin
 * @param retailer
 * @param balance
 * @return {Promise.<*>}
 */
var createBiLogAsPartOfCompletion = function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(number, pin, retailer, balance) {
    var findParams, cardFindParams, biFindParams, card, originalLog, newLogVals, newLog;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            // See if we can find a card associated with this log
            findParams = {
              number: number, pin: pin
            };
            cardFindParams = Object.assign(findParams, { retailer: retailer._id });
            biFindParams = Object.assign(findParams, { retailerId: retailer._id });
            _context20.next = 5;
            return _card3.default.findOne(cardFindParams);

          case 5:
            card = _context20.sent;

            cardFindParams.retailerId = retailer._id;
            delete cardFindParams.retailer;
            _context20.next = 10;
            return _biRequestLog2.default.findOne(biFindParams).sort({ created: -1 });

          case 10:
            originalLog = _context20.sent;

            if (!(!originalLog || typeof originalLog.balance === 'number' && originalLog.balance !== balance)) {
              _context20.next = 20;
              break;
            }

            newLogVals = {
              pin: pin,
              number: number,
              retailerId: retailer._id,
              balance: balance
            };

            if (card) {
              newLogVals.card = card._id;
            }
            newLog = new _biRequestLog2.default(newLogVals);

            if (_environment2.default.debug) {
              console.log('**************NEW LOG**********');
              console.log(newLog);
            }
            // Reattach card
            if (card) {
              newLog.card = card;
            }
            _context20.next = 19;
            return newLog.save();

          case 19:
            return _context20.abrupt('return', _context20.sent);

          case 20:
            _context20.next = 22;
            return _biRequestLog2.default.findOne(biFindParams).populate(logPopulationValues);

          case 22:
            return _context20.abrupt('return', _context20.sent);

          case 23:
          case 'end':
            return _context20.stop();
        }
      }
    }, _callee20, this);
  }));

  return function createBiLogAsPartOfCompletion(_x46, _x47, _x48, _x49) {
    return _ref22.apply(this, arguments);
  };
}();

/**
 * BI completed
 */


var biCompleted = exports.biCompleted = function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(req, res) {
    var dbCompanySettings, dbLogs, dbLog, key, dbRetailer, _req$body6, retailerId, number, pin, balance, fixed, invalid, _requestId, findByNumber, inventory, transaction, nccCardValue;

    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.prev = 0;
            dbCompanySettings = null;
            dbLogs = void 0;
            dbLog = void 0;
            key = req.get(_environment2.default.biCallbackKeyHeader);
            dbRetailer = void 0;
            // Make sure that we have the right key for callback

            if (!(key !== _environment2.default.biCallbackKey)) {
              _context21.next = 8;
              break;
            }

            return _context21.abrupt('return', res.status(401).send('Unauthorized'));

          case 8:
            _req$body6 = req.body, retailerId = _req$body6.retailerId, number = _req$body6.number, pin = _req$body6.pin;
            balance = 0;

            if (req.body.balance) {
              balance = parseFloat(req.body.balance);
            }
            // fixed is used for fixing VBs which got screwed up, only those previously inserted
            fixed = !!req.body.fixed || false;
            invalid = false;

            if (typeof req.body.invalid === 'number') {
              invalid = !!req.body.invalid;
            }
            _requestId = req.params.requestId;
            // Need balance and invalid

            if (!(typeof invalid === 'undefined' || typeof balance === 'undefined' || typeof retailerId === 'undefined')) {
              _context21.next = 17;
              break;
            }

            return _context21.abrupt('return', res.status(400).json({ err: "'invalid', 'balance', and 'retailerId' must be included in the request" }));

          case 17:
            // Find by number and pin by default
            findByNumber = { number: number };

            if (pin) {
              findByNumber.pin = pin;
            }
            // Get most recent log
            _context21.next = 21;
            return _biRequestLog2.default.find({
              $or: [{
                requestId: _requestId
              }, findByNumber]
            }).sort({ created: -1 }).limit(1).populate(logPopulationValues);

          case 21:
            dbLogs = _context21.sent;

            // Most recent log if we have one
            if (dbLogs.length) {
              dbLog = dbLogs[0];
            }
            // Get retailers
            _context21.next = 25;
            return _retailer2.default.findOne({ $or: [{
                gsId: retailerId
              }, {
                aiId: retailerId
              }] });

          case 25:
            dbRetailer = _context21.sent;

            if (dbRetailer) {
              _context21.next = 28;
              break;
            }

            return _context21.abrupt('return', res.status(404).json({ err: 'Retailer not found' }));

          case 28:
            if (dbLog) {
              _context21.next = 34;
              break;
            }

            _context21.next = 31;
            return createBiLogAsPartOfCompletion(number, pin, dbRetailer, balance);

          case 31:
            dbLog = _context21.sent;
            _context21.next = 38;
            break;

          case 34:
            if (!(typeof dbLog.balance === 'number' && dbLog.balance !== balance)) {
              _context21.next = 38;
              break;
            }

            _context21.next = 37;
            return createBiLogAsPartOfCompletion(number, pin, dbRetailer, balance);

          case 37:
            dbLog = _context21.sent;

          case 38:
            _context21.next = 40;
            return completeBiLog(dbLog, invalid, balance, _requestId, fixed);

          case 40:
            dbLog = _context21.sent;
            _context21.next = 43;
            return completeCardAndInventory(dbLog, invalid, balance);

          case 43:
            _context21.next = 45;
            return _biRequestLog2.default.findById(dbLog._id).populate(logPopulationValues);

          case 45:
            dbLog = _context21.sent;

            if (!(dbLog.card && dbLog.card.inventory && dbLog.card.inventory.company)) {
              _context21.next = 50;
              break;
            }

            _context21.next = 49;
            return dbLog.card.inventory.company.getSettings();

          case 49:
            dbCompanySettings = _context21.sent;

          case 50:
            if (!(dbLog.card && dbLog.card.inventory && dbLog.card.inventory.isTransaction)) {
              _context21.next = 63;
              break;
            }

            inventory = dbLog.card.inventory;
            transaction = inventory.transaction;
            nccCardValue = balance * transaction.creditValuePercentage;
            // Recalculate transaction values

            transaction = calculateTransactionValues(transaction.transactionTotal, transaction.maxSpending, nccCardValue, transaction.merchantPayoutPercentage);
            // New transaction
            inventory.transaction = Object.assign(inventory.transaction, transaction);
            inventory.transaction.nccCardValue = transaction.cardValue;
            // Verified balance has been received
            inventory.hasVerifiedBalance = true;
            _context21.next = 60;
            return inventory.save();

          case 60:
            if (!(dbLog.card && dbLog.card.inventory && dbLog.card.inventory.isTransaction && dbCompanySettings)) {
              _context21.next = 63;
              break;
            }

            _context21.next = 63;
            return (0, _runDefers.finalizeTransactionValues)([dbLog.card.inventory], dbCompanySettings);

          case 63:
            return _context21.abrupt('return', res.json({}));

          case 66:
            _context21.prev = 66;
            _context21.t0 = _context21['catch'](0);

            console.log('**************COMPLETE BI ERR**********');
            console.log(_context21.t0);

            _context21.next = 72;
            return _errorLog2.default.create({
              method: 'biCompleted',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context21.t0.stack,
              error: _context21.t0,
              user: req.user._id
            });

          case 72:
            return _context21.abrupt('return', res.status(500).json({
              invalid: 'An error has occurred.'
            }));

          case 73:
          case 'end':
            return _context21.stop();
        }
      }
    }, _callee21, this, [[0, 66]]);
  }));

  return function biCompleted(_x50, _x51) {
    return _ref23.apply(this, arguments);
  };
}();

/**
 * Fake card status values
 * @param cardId Incoming card ID
 * @return {*}
 */


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
var getCardStatus = exports.getCardStatus = function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(req, res) {
    var cardId, userTime, search, user, testVal, query;
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.prev = 0;
            cardId = req.params.cardId;
            userTime = formatDateParams(req.params, res);
            // Validate card ID

            if (!cardId) {
              _context22.next = 6;
              break;
            }

            if (!(cardId.indexOf(_environment2.default.testCardBegin) === -1 && !_mongoose2.default.Types.ObjectId.isValid(cardId))) {
              _context22.next = 6;
              break;
            }

            return _context22.abrupt('return', res.status(400).json({ error: 'Invalid card ID' }));

          case 6:
            search = void 0;
            user = req.user;

            if (!cardId) {
              _context22.next = 15;
              break;
            }

            // Test cards
            testVal = fakeCardStatus(cardId);

            if (!testVal) {
              _context22.next = 12;
              break;
            }

            return _context22.abrupt('return', res.json(testVal));

          case 12:
            _card3.default.findOne({
              _id: cardId,
              user: user._id
            }).populate('inventory').populate('retailer').then(function (card) {
              if (!card) {
                return res.status(400).json({ error: 'Card not found' });
              }

              card = card.toObject();
              var inventory = card.inventory;
              // No inventory
              if (!inventory) {
                return res.status(500).json({ error: "Card data invalid" });
              }

              card.saleConfirmed = !(inventory.smp === '1' && inventory.saveYa && !inventory.saveYa.confirmed);

              card = formatCardStatusResults(card);
              card = decorateCardWithSaleStatuses(Object.assign(card, { balance: card.claimedBalance }), inventory);
              delete card.balance;

              return res.json(card);
            });
            _context22.next = 18;
            break;

          case 15:
            query = {
              user: user._id
            };

            if (userTime) {
              query.userTime = userTime;
            }
            search = _card3.default.find(query).populate('inventory').populate('retailer').sort({
              userTime: -1
            }).then(function (cards) {
              var processedCards = [];

              cards.forEach(function (card) {
                card = card.toObject();
                var inventory = card.inventory;

                if (!inventory) {
                  return;
                }

                card.saleConfirmed = !(inventory.smp === '1' && inventory.saveYa && !inventory.saveYa.confirmed);

                card = formatCardStatusResults(card);
                card = decorateCardWithSaleStatuses(Object.assign(card, { balance: card.claimedBalance }), inventory);
                delete card.balance;

                processedCards.push(card);
              });

              res.json(processedCards);
            });

          case 18:
            _context22.next = 28;
            break;

          case 20:
            _context22.prev = 20;
            _context22.t0 = _context22['catch'](0);

            console.log('**************ERROR**********');
            console.log(_context22.t0);

            if (!(_context22.t0 === 'invalidBegin' || _context22.t0 === 'invalidEnd')) {
              _context22.next = 26;
              break;
            }

            return _context22.abrupt('return');

          case 26:
            _context22.next = 28;
            return _errorLog2.default.create({
              method: 'getCardStatus',
              controller: 'lq.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context22.t0.stack,
              error: _context22.t0,
              user: req.user._id
            }).then(function () {
              return res.status(500).json({
                invalid: 'An error has occurred.'
              });
            });

          case 28:
          case 'end':
            return _context22.stop();
        }
      }
    }, _callee22, this, [[0, 20]]);
  }));

  return function getCardStatus(_x52, _x53) {
    return _ref24.apply(this, arguments);
  };
}();

/**
 * Format date params when searching cards
 * @param params
 * @param res
 */


var setVerifiedBalance = function () {
  var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(inventory, verifiedBalance) {
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            inventory.verifiedBalance = verifiedBalance;
            inventory.isTransaction = true;
            return _context31.abrupt('return', inventory.save());

          case 3:
          case 'end':
            return _context31.stop();
        }
      }
    }, _callee31, this);
  }));

  return function setVerifiedBalance(_x61, _x62) {
    return _ref33.apply(this, arguments);
  };
}();

/**
 * Mock a credit/reject for staging
 */


exports.apiCustomerValues = apiCustomerValues;
exports.getRetailer = getRetailer;
exports.reconcile = reconcile;
exports.getCompanyReserve = getCompanyReserve;
exports.getCompanySettings = getCompanySettings;
exports.updateCompanySettings = updateCompanySettings;
exports.proceedWithSale = proceedWithSale;
exports.getStoreCustomers = getStoreCustomers;
exports.searchCustomers = searchCustomers;
exports.getCustomer = getCustomer;
exports.deleteCustomer = deleteCustomer;
exports.newCustomer = newCustomer;
exports.updateCustomer = updateCustomer;
exports.createStore = createStore;
exports.updateStore = updateStore;
exports.getStores = getStores;
exports.getStore = getStore;
exports.deleteStore = deleteStore;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.getEmployees = getEmployees;
exports.getEmployee = getEmployee;
exports.resetTransactions = resetTransactions;
exports.mockCreditReject = mockCreditReject;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

var _card2 = require('../card/card.model');

var _card3 = _interopRequireDefault(_card2);

var _store = require('../stores/store.model');

var _store2 = _interopRequireDefault(_store);

var _reserve = require('../reserve/reserve.model');

var _reserve2 = _interopRequireDefault(_reserve);

var _biRequestLog = require('../biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _customer = require('../customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _reconciliation = require('../reconciliation/reconciliation');

var _reconciliation2 = _interopRequireDefault(_reconciliation);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _exceptions = require('../../exceptions/exceptions');

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _callback = require('../callbackLog/callback');

var _callback2 = _interopRequireDefault(_callback);

var _card4 = require('../card/card.controller');

var _card5 = require('../card/card.helpers');

var _auth = require('../auth/auth.service');

var _customer3 = require('../customer/customer.controller');

var _company3 = require('../company/company.controller');

var _runDefers = require('../deferredBalanceInquiries/runDefers');

var _user3 = require('../user/user.controller');

var _number = require('../../helpers/number');

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _errors = require('../../helpers/errors');

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var testCard1 = '588689835dbe802d2b0f60741';
var testCard2 = '588689835dbe802d2b0f60742';
var testCard3 = '588689835dbe802d2b0f60743';
var testCard4 = '588689835dbe802d2b0f60744';

// LQ customer
var lqCustomerFind = exports.lqCustomerFind = {
  firstName: 'API',
  lastName: 'Customer',
  stateId: 'API_Customer'
};function apiCustomerValues(companyId) {
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
  var email = body.email,
      companyName = body.companyName;

  var token = void 0,
      dbCompany = void 0,
      dbStore = void 0,
      dbUser = void 0;
  return _user2.default.findOne({
    email: email
  })
  // See if user exists
  .then(function (user) {
    if (user) {
      res.status(400).json({ invalid: 'Email already in use' });
      return false;
    }
  })
  // No user, create company
  .then(function (company) {
    if (company === false) {
      throw 'inUse';
    }
    // See if this company already exists
    if (companyName) {
      return _company2.default.findOne({
        name: companyName
      });
    }
    return false;
  }).then(function (company) {
    // Determine whether to create with email or company name
    var name = company || !companyName ? email : companyName;
    company = new _company2.default({
      name: name
    });
    return company.save();
  })
  // Create store
  .then(function (company) {
    dbCompany = company;
    models.company = company;
    // Create settings
    dbCompany.getSettings();
    var store = new _store2.default({
      name: email,
      companyId: company._id
    });
    return store.save();
  })
  // Create user, add company and store to user
  .then(function (store) {
    dbStore = store;
    models.store = store;
    var user = new _user2.default(Object.assign(body, {
      provider: 'local',
      // Company
      company: dbCompany._id,
      store: dbStore._id,
      role: 'corporate-admin'
    }));
    return user.save();
  })
  // Add user to store
  .then(function (user) {
    dbUser = user;
    models.user = user;
    dbStore.users = [dbUser._id];
    return dbStore.save();
  }).then(function () {
    dbCompany.stores = [dbStore._id];
    return dbCompany.save();
  })
  // Add user to company
  .then(function () {
    dbCompany.users = [dbUser._id];
    return dbCompany.save();
  }).then(function () {
    token = (0, _auth.signToken)(dbUser._id, dbUser.role);
    // Make sure we have a LQ API customer
    return _customer2.default.findOne(Object.assign({}, lqCustomerFind, { company: dbCompany._id }));
  }).then(function (customer) {
    // Create new customer
    if (!customer) {
      customer = new _customer2.default(apiCustomerValues(dbCompany._id));
      return Promise.all([customer.save(), dbCompany, token]);
    }
    return Promise.all([customer, dbCompany, token]);
  });
}

/**
 * Adds sale statuses to the given card
 *
 * @param {Object} card
 * @param {Object} inventory
 * @param {Boolean} transaction Whether card is transaction
 * @return {Object}
 */
function decorateCardWithSaleStatuses(card, inventory) {
  var transaction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var verifiedBalance = inventory.verifiedBalance;
  var saleFinal = !!inventory.cqAch;
  card.saleAccepted = true;
  card.saleVerified = !!(saleFinal || verifiedBalance && verifiedBalance > 0);
  card.saleFinal = saleFinal;
  card.claimedBalanceInaccurate = !!(verifiedBalance && card.balance > verifiedBalance);
  if (transaction) {
    card.transaction = transaction;
  }

  return card;
}function createSubUser(body, res, models) {
  var _this = this;

  var email = body.email,
      companyId = body.companyId,
      storeId = body.storeId;

  var token = void 0,
      dbCompany = void 0,
      dbStore = void 0,
      dbUser = void 0;
  return _user2.default.findOne({
    email: email.toLowerCase()
  })
  // See if user exists
  .then(function (user) {
    if (user) {
      res.status(400).json({ invalid: 'Email already in use' });
      return false;
    }
  })
  //check if company exists
  .then(function () {
    if (companyId) {
      return _company2.default.findOne({
        _id: companyId.toString()
      });
    }
    return false;
  }).then(function (company) {
    if (company === false) throw 'company doesn\'t exist';

    dbCompany = company;
    return _store2.default.findOne({ _id: storeId });
  }).then(function (store) {
    if (store === false) {
      throw 'Store doesn\'t exist';
    }

    dbStore = store;

    if (body.role) {
      if (['corporate-admin', 'manager'].indexOf(body.role) === -1) {
        body.role = 'employee';
      }
    }

    var user = new _user2.default(Object.assign(body, {
      provider: 'local', // Company
      company: dbCompany._id,
      store: dbStore._id
    }));

    return user.save();
  })
  // Add user to store
  .then(function (user) {
    dbUser = user;
    models.user = user;
    dbStore.users = [dbUser._id];
    return dbStore.save();
  })
  // Add user to company
  .then(function () {
    dbCompany.users = [dbUser._id];
    return dbCompany.save();
  }).then(function () {
    token = (0, _auth.signToken)(dbUser._id, dbUser.role);
    // Make sure we have a LQ API customer
    return _customer2.default.findOne(Object.assign({}, lqCustomerFind, { company: companyId }));
  }).then(function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(customer) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (customer) {
                _context4.next = 4;
                break;
              }

              _context4.next = 3;
              return _customer2.default.create(apiCustomerValues(companyId));

            case 3:
              return _context4.abrupt('return', token);

            case 4:
              return _context4.abrupt('return', token);

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x8) {
      return _ref6.apply(this, arguments);
    };
  }()).then(function (token) {
    return res.json({
      token: token,
      customerId: dbUser._id,
      companyId: companyId
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
  var retailersFinal = [];
  // Only display the info we need to
  retailers.forEach(function (retailer) {
    var smpMaxMin = retailer.getSmpMaxMin();
    retailer = retailer.toObject();
    var sellRate = (0, _card5.determineSellTo)(retailer, null, companySettings);
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
}function getRetailer(req, res) {
  var _this3 = this;

  var user = req.user;
  var retailer = req.params.retailer;

  var companySettings = void 0;
  return _company2.default.findById(user.company).then(function (company) {
    return company.getSettings();
  }).then(function (settings) {
    companySettings = settings;
    companySettings.margin = companySettings.margin || 0.03;

    var fields = '_id name sellRates smpMaxMin smpType gsId verification';

    if (_mongoose2.default.Types.ObjectId.isValid(retailer)) {
      return _retailer2.default.findById(retailer, fields);
    } else {
      return _retailer2.default.findOne({ name: new RegExp(retailer, 'i') }, fields);
    }
  }).then(function (retailer) {
    // Not found
    if (!retailer) {
      res.status(_exceptions.notFound.code).json(_exceptions.notFound.res);
      throw _exceptions.notFound;
    }
    retailer = formatRetailers([retailer], companySettings);
    return res.json(retailer[0]);
  }).catch(function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(err === _exceptions.notFound)) {
                _context7.next = 2;
                break;
              }

              return _context7.abrupt('return');

            case 2:

              console.log('**********ERROR IN GETRETAILER**********');
              console.log(err);

              _context7.next = 6;
              return _errorLog2.default.create({
                method: 'getRetailer',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 6:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this3);
    }));

    return function (_x12) {
      return _ref9.apply(this, arguments);
    };
  }());
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
}function lqTestCards(res, retailer, number, userTime) {
  var test = false;
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
}function createFakeRes() {
  return {
    status: function status(code) {
      this.code = code;
      return this;
    },
    json: function json(jsonObject) {
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
    var errorMessage = void 0;
    // Can't sell
    if (receipt.response && receipt.response.reason === 'noSmp') {
      errorMessage = 'Card violates sell limits';
    } else {
      // Create error
      errorMessage = receipt.response;
    }
    return handleLqNewError(res, responseBodyCard._id, receipt.code, errorMessage);
  }
  return false;
}function calculateTransactionValues(transactionTotal, maxSpending, cardValue, payoutPercentage) {
  var amountDue = 0;
  var newCardValue = 0;
  var merchantPayoutAmount = 0;
  // Calculate transaction data
  if (transactionTotal >= cardValue && cardValue <= maxSpending) {
    amountDue = (0, _number.formatFloat)(transactionTotal - cardValue);
    newCardValue = 0;
    merchantPayoutAmount = (0, _number.formatFloat)(payoutPercentage * cardValue);
  } else {
    amountDue = Math.max(0, transactionTotal - Math.min(maxSpending, cardValue));
    newCardValue = cardValue - Math.min(maxSpending, transactionTotal);
    merchantPayoutAmount = (0, _number.formatFloat)(payoutPercentage * Math.min(maxSpending, cardValue, transactionTotal));
  }
  // Format nicely
  if (typeof newCardValue === 'number') {
    newCardValue = (0, _number.formatFloat)(newCardValue);
  }
  if (typeof amountDue === 'number') {
    amountDue = (0, _number.formatFloat)(amountDue);
  }
  if (typeof merchantPayoutAmount === 'number') {
    merchantPayoutAmount = (0, _number.formatFloat)(merchantPayoutAmount);
  }
  return { amountDue: amountDue, cardValue: newCardValue, merchantPayoutAmount: merchantPayoutAmount };
}

/**
 * Create search params for bi log
 * @param body
 * @return {{number, pin, retailerId}}
 */
function getBiLogSearch(body) {
  // See if we have BI for this already
  var biLogSearch = {
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
    return { verifiedBalance: null, valid: null, finalized: false };
  }
  var verifiedBalance = null;
  var finalized = !!biRes.finalized;
  // Invalid card
  if (biRes.responseCode === _environment2.default.biCodes.invalid) {
    return { verifiedBalance: 0, valid: false, finalized: finalized };
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
    return { verifiedBalance: verifiedBalance, valid: true, finalized: finalized };
  }
  return { verifiedBalance: null, valid: null, finalized: finalized };
}

function getAddToInventoryErrorResponse(response) {
  // Can't sell
  if (response && response.reason === 'noSmp') {
    // return res.status(code).json({invalid: 'Card violates sell limits'});
    return { invalid: 'Card violates sell limits' };
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
  dbCard.sellRate = (0, _number.formatFloat)(dbCard.sellRate);
  dbCard.soldFor = (0, _number.formatFloat)(dbCard.sellRate * dbCard.balance);
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
}function makeFakeReqRes(req) {
  // Mock express res object
  var fakeRes = {
    status: function status(code) {
      this.code = code;
      return this;
    },
    json: function json(jsonObject) {
      this.response = jsonObject;
      return this;
    }
  };
  // Mock req
  var fakeReq = {
    body: req.body,
    user: req.user
  };
  return [fakeReq, fakeRes];
}function fakeBi(retailer, number, res) {
  if (retailer === '5668fbff37226093139b912c') {
    if (number === '1000') {
      return res.json({
        "responseDateTime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889807",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '2000') {
      return res.json({
        "responseDateTime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889808",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '3000') {
      return res.json({
        "responseDateTime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
        "responseCode": "000",
        "request_id": "11502131554644889809",
        "balance": 100,
        "responseMessage": "success"
      });
    } else if (number === '4000') {
      if (requestId) {
        return res.json({
          "responseDateTime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
          "responseCode": "000",
          "request_id": "11502131554644889810",
          "balance": 100,
          "responseMessage": "success"
        });
      } else {
        return res.json({
          "balance": "Null",
          "response_datetime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
          "responseMessage": "Delayed Verification Required",
          "requestId": "11502131554644889810",
          "responseCode": "010",
          "responseDateTime": (0, _moment2.default)().format('Y-MM-DD HH:mm:ss.ms'),
          "recheckDateTime": (0, _moment2.default)().add(1, 'hour').format('Y-MM-DD HH:mm:ss.ms')
        });
      }
    }
  }
}var logPopulationValues = {
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
  }]
};function fakeCardStatus(cardId) {
  if (cardId.indexOf(_environment2.default.testCardBegin) !== -1) {
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
}function formatDateParams(params, res) {
  var begin = params.begin,
      end = params.end;

  var userTime = void 0;
  if (begin) {
    begin = (0, _moment2.default)(begin);
    if (begin.isValid()) {
      userTime = {
        $gt: begin.format()
      };
    } else {
      res.status(400).json({ error: 'Invalid begin date' });
      throw 'invalidBegin';
    }
  }
  if (end) {
    end = (0, _moment2.default)(end);
    if (end.isValid()) {
      if (!userTime) {
        userTime = {};
      }
      userTime.$lt = end.format();
    } else {
      res.status(400).json({ error: 'Invalid end date' });
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
    var status = void 0;
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
    var displaySellRate = (0, _number.formatFloat)(card.inventory.liquidationRate - card.inventory.margin);
    var balanceForCalculations = void 0;
    balanceForCalculations = card.inventory.verifiedBalance ? card.inventory.verifiedBalance : card.inventory.balance;
    var soldFor = balanceForCalculations * displaySellRate;
    if (isNaN(soldFor)) {
      soldFor = 0;
    }
    var saleFinal = !!card.inventory.cqAch;
    return {
      _id: card._id,
      created: (0, _moment2.default)(card.userTime).format(),
      lastFour: card.number.substring(card.number.length - 4),
      pin: card.pin,
      status: status,
      claimedBalance: card.balance,
      verifiedBalance: saleFinal ? card.inventory.verifiedBalance || card.inventory.balance : card.inventory.verifiedBalance || null,
      soldFor: (0, _number.formatFloat)(soldFor),
      sellRate: displaySellRate,
      reconciled: !!card.inventory.reconciliation,
      retailer: card.retailer.name,
      saleConfirm: card.saleConfirmed
    };
  } catch (e) {
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
        throw new Error({ error: 'unknown' });
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
function reconcile(req, res) {
  var _req$body7 = req.body,
      cardId = _req$body7.cardId,
      userTime = _req$body7.userTime;

  var card = void 0;
  if (!cardId || !userTime) {
    return res.status(400).json({
      invalid: 'Include the following POST parameters: cardId, userTime'
    });
  }
  _card3.default.findOne({
    _id: cardId,
    user: req.user._id
  }).populate('inventory').then(function (dbCard) {
    if (!dbCard) {
      return res.status(403).json({ error: 'Card not found' });
    }
    if (dbCard.reconciliation) {
      return res.status(400).json({ error: 'Card already reconciled' });
    }
    card = dbCard;
    var reconciliation = new _reconciliation2.default({
      userTime: userTime,
      inventory: card.inventory._id
    });
    return reconciliation.save();
  }).then(function (reconcilation) {
    if (!reconcilation) {
      return;
    }
    card.inventory.reconciliation = reconcilation._id;
    return card.inventory.save();
  }).then(function (card) {
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
function getCompanyReserve(req, res) {
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
function getCompanySettings(req, res) {
  var _this5 = this;

  var companyId = req.params.companyId;

  var dbCompany = void 0;

  _company2.default.findById(companyId).then(function (company) {
    dbCompany = company;
    return company.getSettings();
  }).then(function (settings) {
    return res.json({
      cardType: settings.cardType || 'both',
      autoSell: settings.autoSell,
      minimumAdjustedDenialAmount: settings.minimumAdjustedDenialAmount,
      biOnly: settings.biOnly || false,
      customerDataRequired: settings.customerDataRequired,
      reserveTotal: dbCompany.reserveTotal,
      callbackUrl: settings.callbackUrl
    });
  }).catch(function () {
    var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(err) {
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.next = 2;
              return _errorLog2.default.create({
                method: 'getCompanySettings',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 2:
            case 'end':
              return _context23.stop();
          }
        }
      }, _callee23, _this5);
    }));

    return function (_x54) {
      return _ref25.apply(this, arguments);
    };
  }());
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
function updateCompanySettings(req, res) {
  var _this6 = this;

  var companyId = req.params.companyId;

  var body = req.body;

  _company2.default.findById(companyId).then(function (company) {
    return company.getSettingsObject();
  }).then(function (settings) {
    ['cardType', 'autoSell', 'biOnly', 'customerDataRequired', 'minimumAdjustedDenialAmount', 'callbackUrl'].forEach(function (attr) {
      if (typeof body[attr] !== 'undefined') {
        settings[attr] = body[attr];
      }
    });

    return settings.save();
  }).then(function (settings) {
    return res.json({
      cardType: settings.cardType || 'both',
      autoSell: settings.autoSell,
      biOnly: settings.biOnly || false,
      minimumAdjustedDenialAmount: settings.minimumAdjustedDenialAmount,
      customerDataRequired: settings.customerDataRequired,
      callbackUrl: settings.callbackUrl
    });
  }).catch(function () {
    var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(err) {
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return _errorLog2.default.create({
                method: 'updateCompanySettings',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 2:
            case 'end':
              return _context24.stop();
          }
        }
      }, _callee24, _this6);
    }));

    return function (_x55) {
      return _ref26.apply(this, arguments);
    };
  }());
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
function proceedWithSale(req, res) {
  var _this7 = this;

  var cardId = req.params.cardId;


  if (!_mongoose2.default.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  _card3.default.findById(cardId).populate('inventory').then(function (card) {
    if (!card) {
      throw 'notFound';
    }
    var inventory = card.inventory;
    inventory.proceedWithSale = true;
    return inventory.save();
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(err) {
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              if (!(err === 'notFound')) {
                _context25.next = 2;
                break;
              }

              return _context25.abrupt('return', res.status(400).json({ error: 'Card not found' }));

            case 2:

              console.log('*******************ERR IN PROCEEDWITHSALE*******************');
              console.log(err);

              _context25.next = 6;
              return _errorLog2.default.create({
                method: 'proceedWithSale',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 6:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, _this7);
    }));

    return function (_x56) {
      return _ref27.apply(this, arguments);
    };
  }());
}

/**
 * Get customers for this store
 */
function getStoreCustomers(req, res) {
  req.params.store = req.params.storeId;
  return (0, _customer3.getCustomersThisStore)(req, res);
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
function searchCustomers(req, res) {
  req.query.name = req.params.customerName;

  return (0, _customer3.searchCustomers)(req, res);
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
function getCustomer(req, res) {
  var customerId = req.params.customerId;

  var company = req.user.company;

  if (_mongoose2.default.Types.ObjectId.isValid(customerId)) {
    _customer2.default.findOne({ _id: customerId, company: company }).then(function (customer) {
      // Not found
      if (!customer) {
        return res.status(404).json();
      }

      return res.json(customer);
    });
  } else {
    return res.status(_exceptions.invalidObjectId.code).json(_exceptions.invalidObjectId.res);
  }
}

/**
 * Delete a customer
 */
function deleteCustomer(req, res) {
  var _this8 = this;

  _customer2.default.findById(req.params.customerId).then(function (customer) {
    // No customer
    if (!customer) {
      res.status(_exceptions.notFound.code).json(_exceptions.notFound.res);
      throw _exceptions.notFound;
    }
    customer.enabled = false;
    return customer.save();
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(e) {
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              if (!(e === _exceptions.notFound)) {
                _context26.next = 2;
                break;
              }

              return _context26.abrupt('return');

            case 2:
              _context26.next = 4;
              return _errorLog2.default.create({
                method: 'deleteCustomer',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: e.stack,
                error: e,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 4:
            case 'end':
              return _context26.stop();
          }
        }
      }, _callee26, _this8);
    }));

    return function (_x57) {
      return _ref28.apply(this, arguments);
    };
  }());
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
function newCustomer(req, res) {
  req.user.store = req.params.storeId;
  req.body.store = req.params.storeId;
  return (0, _customer3.newCustomer)(req, res);
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
function updateCustomer(req, res) {
  return (0, _customer3.updateCustomer)(req, res);
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
function createStore(req, res) {
  req.body.companyId = req.user.company;
  return (0, _company3.newStore)(req, res);
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
function updateStore(req, res) {
  req.body.storeId = req.params.storeId;

  // Prevents them from being able to change the companyId.
  // This attribute should be ignored in the future.
  if (req.body.companyId) {
    req.body.companyId = req.user.company;
  }

  return (0, _company3.updateStore)(req, res);
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
function getStores(req, res) {
  req.params.companyId = req.user.company;
  return (0, _company3.getStores)(req, res);
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
function getStore(req, res) {
  return (0, _company3.getStoreDetails)(req, res);
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
function deleteStore(req, res) {
  return (0, _company3.deleteStore)(req, res);
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
function createEmployee(req, res) {
  req.body.companyId = req.user.company.toString();
  req.body.storeId = req.params.storeId;

  if (req.user.role === 'manager' && req.body.role === 'corporate-admin') {
    return res.status(401).json({ error: "Managers can't create corporate admin accounts" });
  }

  return (0, _company3.newEmployee)(req, res);
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
function updateEmployee(req, res) {
  var _this9 = this;

  var fakeReq = void 0,
      fakeRes = void 0;

  var _makeFakeReqRes3 = makeFakeReqRes(req);

  var _makeFakeReqRes4 = _slicedToArray(_makeFakeReqRes3, 2);

  fakeReq = _makeFakeReqRes4[0];
  fakeRes = _makeFakeReqRes4[1];

  fakeReq.params = req.params;
  fakeReq.params.id = req.params.employeeId;

  (0, _user3.modifyUser)(fakeReq, fakeRes).then(function () {
    if (fakeRes.code) {
      return res.status(fakeRes.code).json(fakeRes.response);
    }

    return fakeRes.response;
  }).then(function (user) {
    if (req.body.role) {
      if (req.user.role === 'manager' && ['manager', 'employee'].indexOf(req.body.role) !== -1) {
        user.role = req.body.role;
      }

      if (req.user.role === 'corporate-admin' && ['manager', 'employee', 'corporate-admin'].indexOf(req.body.role) !== -1) {
        user.role = req.body.role;
      }
    }

    return user.save();
  }).then(function (user) {
    return res.json(user);
  }).catch(function () {
    var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(err) {
      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              console.log('**************ERR IN UPDATEEMPLOYEE**************');
              console.log(err);

              _context27.next = 4;
              return _errorLog2.default.create({
                method: 'updateEmployee',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 4:
            case 'end':
              return _context27.stop();
          }
        }
      }, _callee27, _this9);
    }));

    return function (_x58) {
      return _ref29.apply(this, arguments);
    };
  }());
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
function deleteEmployee(req, res) {
  return (0, _company3.deleteEmployee)(req, res);
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
function getEmployees(req, res) {
  var _this10 = this;

  var storeId = req.params.storeId;
  // Invalid object ID

  if (!_mongoose2.default.Types.ObjectId.isValid(storeId)) {
    return res.status(_exceptions.invalidObjectId.code).json(_exceptions.invalidObjectId.res);
  }

  _store2.default.findOne({ _id: storeId, companyId: req.user.company }).populate('users').then(function (store) {
    if (!store) {
      return res.status(404).json();
    }

    return res.json(store.users);
  }).catch(function () {
    var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(err) {
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              console.log('****************************ERR IN GETEMPLOYEES****************************');
              console.log(err);

              _context28.next = 4;
              return _errorLog2.default.create({
                method: 'getEmployees',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 4:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, _this10);
    }));

    return function (_x59) {
      return _ref30.apply(this, arguments);
    };
  }());
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
function getEmployee(req, res) {
  var _this11 = this;

  var _req$params = req.params,
      storeId = _req$params.storeId,
      employeeId = _req$params.employeeId;


  if (!_mongoose2.default.Types.ObjectId.isValid(storeId) || !_mongoose2.default.Types.ObjectId.isValid(employeeId)) {
    return res.status(404).json();
  }

  _user2.default.findOne({ _id: employeeId, store: storeId, company: req.user.company }).then(function (user) {
    if (!user) {
      return res.status(404).json();
    }

    return res.json(user);
  }).catch(function () {
    var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(err) {
      return regeneratorRuntime.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              console.log('*************************ERR IN GETEMPLOYEE*************************');
              console.log(err);

              _context29.next = 4;
              return _errorLog2.default.create({
                method: 'getEmployee',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              }).then(function () {
                return res.status(500).json({
                  invalid: 'An error has occurred.'
                });
              });

            case 4:
            case 'end':
              return _context29.stop();
          }
        }
      }, _callee29, _this11);
    }));

    return function (_x60) {
      return _ref31.apply(this, arguments);
    };
  }());
}

/**
 * Reset transactions
 */
function resetTransactions(req, res) {
  var _this12 = this;

  _store2.default.find({}).then(function (stores) {
    var promises = [];
    stores.forEach(function (store) {
      store.reserveTotal = 0;
      store.reserves = [];
      promises.push(store.save());
    });
    return Promise.all(promises);
  }).then(function () {
    return _company2.default.find({});
  }).then(function (companies) {
    var promises = [];
    companies.forEach(function (company) {
      company.reserveTotal = 0;
      company.reserves = [];
      promises.push(company.save());
    });
    return Promise.all(promises);
  }).then(function () {
    return _inventory2.default.find({}).populate('card').then(function (inventories) {
      var promises = [];
      inventories.forEach(function (inventory) {
        if (inventory.transaction) {
          if (inventory.card) {
            promises.push(inventory.card.remove());
          }
          promises.push(inventory.remove());
        }
      });
      return Promise.all(promises);
    });
  })
  // Remove reserve records
  .then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            _context30.next = 2;
            return _reserve2.default.remove({});

          case 2:
            return _context30.abrupt('return', _context30.sent);

          case 3:
          case 'end':
            return _context30.stop();
        }
      }
    }, _callee30, _this12);
  }))).then(function () {
    return res.json({});
  });
}

function mockCreditReject(req, res) {
  var _this13 = this;

  var _req$body8 = req.body,
      verifiedBalance = _req$body8.verifiedBalance,
      cards = _req$body8.cards;

  return _card3.default.find({ _id: { $in: cards } }).populate('inventory').then(function () {
    var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(cards) {
      var dbInventories, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, inventory, _makeFakeReqRes5, _makeFakeReqRes6, fakeReq, fakeRes;

      return regeneratorRuntime.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              dbInventories = cards.map(function (card) {
                return card.inventory;
              });
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context32.prev = 4;
              _iterator = dbInventories[Symbol.iterator]();

            case 6:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context32.next = 13;
                break;
              }

              inventory = _step.value;
              _context32.next = 10;
              return setVerifiedBalance(inventory, verifiedBalance);

            case 10:
              _iteratorNormalCompletion = true;
              _context32.next = 6;
              break;

            case 13:
              _context32.next = 19;
              break;

            case 15:
              _context32.prev = 15;
              _context32.t0 = _context32['catch'](4);
              _didIteratorError = true;
              _iteratorError = _context32.t0;

            case 19:
              _context32.prev = 19;
              _context32.prev = 20;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 22:
              _context32.prev = 22;

              if (!_didIteratorError) {
                _context32.next = 25;
                break;
              }

              throw _iteratorError;

            case 25:
              return _context32.finish(22);

            case 26:
              return _context32.finish(19);

            case 27:
              _makeFakeReqRes5 = makeFakeReqRes(req), _makeFakeReqRes6 = _slicedToArray(_makeFakeReqRes5, 2), fakeReq = _makeFakeReqRes6[0], fakeRes = _makeFakeReqRes6[1];

              fakeReq.body.inventories = dbInventories.map(function (inv) {
                return inv._id.toString();
              });
              _context32.next = 31;
              return (0, _card4.rejectCards)(fakeReq, fakeRes);

            case 31:
              return _context32.abrupt('return', res.json({}));

            case 32:
            case 'end':
              return _context32.stop();
          }
        }
      }, _callee32, _this13, [[4, 15, 19, 27], [20,, 22, 26]]);
    }));

    return function (_x63) {
      return _ref34.apply(this, arguments);
    };
  }()).catch(function () {
    var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(err) {
      return regeneratorRuntime.wrap(function _callee33$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              if (!(err === 'notFound')) {
                _context33.next = 2;
                break;
              }

              return _context33.abrupt('return');

            case 2:
              console.log('**************ERR**********');
              console.log(err);

              _context33.next = 6;
              return _errorLog2.default.create({
                method: 'mockCreditReject',
                controller: 'lq.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 6:
              return _context33.abrupt('return', res.status(500).json({
                invalid: 'An error has occurred.'
              }));

            case 7:
            case 'end':
              return _context33.stop();
          }
        }
      }, _callee33, _this13);
    }));

    return function (_x64) {
      return _ref35.apply(this, arguments);
    };
  }());
  // {inventories: ["5943fa2c9d19ae2e9499c45c"], verifiedBalance: 100}
}
//# sourceMappingURL=lq.controller.js.map
