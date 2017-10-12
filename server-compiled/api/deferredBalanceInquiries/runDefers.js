'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.completeTransactions = exports.finalizeTransactionValues = exports.finalizeTransaction = exports.sellCardsInLiquidation = exports.defaultMargin = exports.INVALID = exports.GIFTCARDRESCUE = exports.CARDPOOL = exports.CARDCASH = exports.SAVEYA = exports.updateRetailerPath = exports.updateRatesPath = exports.updateRatesFromLqPath = exports.smpMaxMinPath = exports.ratesPath = exports.liquidationApiUrl = exports.liquidationApiPort = exports.liquidationApiKey = exports.deletePath = exports.csvRatesPath = exports.activityPath = undefined;

/**
 * Sell cards which have been added to the liquidation API
 */
var sellCardsInLiquidation = exports.sellCardsInLiquidation = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var inventories, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, inventory, retailer, companySettings, sellTo, balance, liquidationRate;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _inventory2.default.find({
              soldToLiquidation: false,
              // Only if allowed to proceed
              proceedWithSale: { $ne: false },
              disableAddToLiquidation: { $nin: ['sell', 'all'] },
              // Don't sell disabled cards
              type: { $ne: 'DISABLED' },
              locked: { $ne: true },
              // Don't run transactions
              isTransaction: { $ne: true }
            }).limit(10);

          case 3:
            inventories = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;
            _iterator = inventories[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 35;
              break;
            }

            inventory = _step.value;
            _context.next = 13;
            return _inventory2.default.findById(inventory._id).populate('card').populate('retailer').populate('company');

          case 13:
            inventory = _context.sent;

            if (!inventory.locked) {
              _context.next = 16;
              break;
            }

            return _context.abrupt('continue', 32);

          case 16:
            // Lock inventory
            inventory.locked = true;
            _context.next = 19;
            return inventory.save();

          case 19:
            // Get retailer with merch values
            retailer = inventory.retailer.populateMerchValues(inventory);

            if (!retailer) {
              _context.next = 32;
              break;
            }

            _context.next = 23;
            return inventory.company.getSettings();

          case 23:
            companySettings = _context.sent;
            sellTo = (0, _card.determineSellTo)(retailer, inventory.balance, companySettings);

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
              balance = inventory.balance;
              liquidationRate = inventory.liquidationRate;

              if (typeof balance !== 'number') {
                balance = 0;
              }
              if (typeof liquidationRate !== 'number') {
                liquidationRate = 0;
              }
              inventory.liquidationSoldFor = liquidationRate * balance;
              inventory.cqTransactionId = (0, _nodeUuid2.default)();
            }
            // Unlock card
            inventory.locked = false;
            _context.next = 31;
            return inventory.save();

          case 31:
            // Notify frontend
            _card2.updateInventory.socketUpdate(inventory);

          case 32:
            _iteratorNormalCompletion = true;
            _context.next = 9;
            break;

          case 35:
            _context.next = 41;
            break;

          case 37:
            _context.prev = 37;
            _context.t0 = _context['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 41:
            _context.prev = 41;
            _context.prev = 42;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 44:
            _context.prev = 44;

            if (!_didIteratorError) {
              _context.next = 47;
              break;
            }

            throw _iteratorError;

          case 47:
            return _context.finish(44);

          case 48:
            return _context.finish(41);

          case 49:
            _context.next = 57;
            break;

          case 51:
            _context.prev = 51;
            _context.t1 = _context['catch'](0);

            console.log('**************SELL CARDS ERR**********');
            console.log(_context.t1);
            _context.next = 57;
            return _errorLog2.default.create({
              method: 'sellCardsInLiquidation',
              controller: 'runDefers',
              revision: (0, _errors.getGitRev)(),
              stack: _context.t1.stack,
              error: _context.t1
            });

          case 57:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 51], [7, 37, 41, 49], [42,, 44, 48]]);
  }));

  return function sellCardsInLiquidation() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Determine SMP
 * @param sellTo { rate: 0.58, smp: 'cardCash', type: 'electronic' }
 * @param inventory
 * @return {*}
 */


/**
 * Finalize transaction values
 * @param inventory
 * @param dbCompanySettings
 * @param recalculating Recalculating a transaction which was previously calculated
 * @return {Promise.<*>}
 */
var finalizeTransaction = exports.finalizeTransaction = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(inventory, dbCompanySettings) {
    var recalculating = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var companySettings, retailer, retailerId, sellTo, serviceFeeRate, margin, balance, cqPaid, reserveAmount;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // Use either array of settings or a single settings
            companySettings = dbCompanySettings[inventory._id] ? dbCompanySettings[inventory._id] : dbCompanySettings;
            retailer = void 0;
            // Populate retailer if we have a plain object

            retailerId = null;
            // Make sure we have a valid retailer object

            if (!(inventory.retailer.constructor.name === 'model')) {
              _context2.next = 7;
              break;
            }

            retailer = inventory.retailer;
            _context2.next = 11;
            break;

          case 7:
            if (_lodash2.default.isPlainObject(inventory.retailer)) {
              retailerId = inventory.retailer._id;
            } else if (inventory.retailer instanceof ObjectId) {
              retailerId = inventory.retailer;
            }
            _context2.next = 10;
            return _retailer2.default.findById(retailerId);

          case 10:
            retailer = _context2.sent;

          case 11:
            if (retailer) {
              _context2.next = 13;
              break;
            }

            throw new _exceptions.DocumentNotFoundException('Retailer not found', 404);

          case 13:
            retailer = retailer.populateMerchValues(inventory);
            // Don't redetermine SMP if we're recalculating, since SMP might have changes since original purchase

            if (recalculating) {
              _context2.next = 19;
              break;
            }

            // Sell to rates
            sellTo = (0, _card.determineSellTo)(retailer, inventory.balance, companySettings);
            // Unable to sell card

            if (sellTo) {
              _context2.next = 18;
              break;
            }

            throw new _exceptions.SellLimitViolationException('Card violates sell limits', 400);

          case 18:
            inventory = determineSmp(sellTo, inventory);

          case 19:
            // Service fee RATE
            serviceFeeRate = typeof inventory.serviceFee !== 'undefined' ? inventory.serviceFee : companySettings.serviceFee;
            margin = typeof inventory.margin !== 'undefined' ? inventory.margin : companySettings.margin;
            balance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : inventory.balance;
            // Service fee dollar value

            inventory.transaction.serviceFee = parseFloat((serviceFeeRate * (balance * (inventory.liquidationRate - margin))).toFixed(3));
            inventory.margin = typeof inventory.margin !== 'undefined' ? inventory.margin : companySettings.margin;
            // Lock
            inventory.soldToLiquidation = true;
            // Determine amount paid
            cqPaid = _inventory2.default.getCqPaid(balance, inventory.liquidationRate - inventory.margin);
            // Create reserve

            reserveAmount = _inventory2.default.getReserveAmount(balance, _environment2.default.reserveRate);

            inventory.transaction.reserveAmount = reserveAmount;
            // Get transaction values
            inventory = inventory.getTransactionValues(reserveAmount, cqPaid, balance);
            return _context2.abrupt('return', inventory.save());

          case 30:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function finalizeTransaction(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Calculate transaction values
 * @param dbInventories
 * @param dbCompanySettings
 * @return {Promise.<*>}
 */


var finalizeTransactionValues = exports.finalizeTransactionValues = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(dbInventories, dbCompanySettings) {
    var finalInventories, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, inventory;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            finalInventories = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context3.prev = 4;
            _iterator2 = dbInventories[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context3.next = 16;
              break;
            }

            inventory = _step2.value;
            _context3.t0 = finalInventories;
            _context3.next = 11;
            return finalizeTransaction(inventory, dbCompanySettings);

          case 11:
            _context3.t1 = _context3.sent;

            _context3.t0.push.call(_context3.t0, _context3.t1);

          case 13:
            _iteratorNormalCompletion2 = true;
            _context3.next = 6;
            break;

          case 16:
            _context3.next = 22;
            break;

          case 18:
            _context3.prev = 18;
            _context3.t2 = _context3['catch'](4);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t2;

          case 22:
            _context3.prev = 22;
            _context3.prev = 23;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 25:
            _context3.prev = 25;

            if (!_didIteratorError2) {
              _context3.next = 28;
              break;
            }

            throw _iteratorError2;

          case 28:
            return _context3.finish(25);

          case 29:
            return _context3.finish(22);

          case 30:
            return _context3.abrupt('return', finalInventories);

          case 31:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[4, 18, 22, 30], [23,, 25, 29]]);
  }));

  return function finalizeTransactionValues(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Create reserve for inventories
 * @param inventories
 * @return {Promise.<Array|*>}
 */


var createInventoryReserves = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(inventories) {
    var final, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, inventory;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            final = [];
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context4.prev = 4;
            _iterator3 = inventories[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context4.next = 16;
              break;
            }

            inventory = _step3.value;
            _context4.t0 = final;
            _context4.next = 11;
            return inventory.createReserve();

          case 11:
            _context4.t1 = _context4.sent;

            _context4.t0.push.call(_context4.t0, _context4.t1);

          case 13:
            _iteratorNormalCompletion3 = true;
            _context4.next = 6;
            break;

          case 16:
            _context4.next = 22;
            break;

          case 18:
            _context4.prev = 18;
            _context4.t2 = _context4['catch'](4);
            _didIteratorError3 = true;
            _iteratorError3 = _context4.t2;

          case 22:
            _context4.prev = 22;
            _context4.prev = 23;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 25:
            _context4.prev = 25;

            if (!_didIteratorError3) {
              _context4.next = 28;
              break;
            }

            throw _iteratorError3;

          case 28:
            return _context4.finish(25);

          case 29:
            return _context4.finish(22);

          case 30:
            return _context4.abrupt('return', final);

          case 31:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[4, 18, 22, 30], [23,, 25, 29]]);
  }));

  return function createInventoryReserves(_x8) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Sell cards for transactions
 */


var completeTransactions = exports.completeTransactions = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var _this = this;

    var dbCompanySettings, dbInventories, dbReserves;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            dbCompanySettings = {};
            dbInventories = void 0;
            dbReserves = void 0;
            return _context8.abrupt('return', _inventory2.default.find({
              soldToLiquidation: false,
              // Only if allowed to proceed
              proceedWithSale: { $ne: false },
              disableAddToLiquidation: { $nin: ['sell', 'all'] },
              // Don't sell disabled cards
              type: { $ne: 'DISABLED' },
              locked: { $ne: true },
              // Don't run transactions
              isTransaction: true,
              // Make sure not invalid
              valid: { $ne: false }
            }).populate('card').populate('retailer').populate('company').populate('store').limit(10).then(function (inventories) {
              return lockInventories(inventories);
            }).then(function (inventories) {
              dbInventories = inventories;
              var promises = [];
              inventories.forEach(function (inventory) {
                promises.push(inventory.company.getSettings());
              });
              return Promise.all(promises);
            }).then(function (settings) {
              settings.forEach(function (setting, index) {
                dbCompanySettings[dbInventories[index]._id] = setting;
              });
            })
            // Create reserve
            .then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
              var inventories;
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return finalizeTransactionValues(dbInventories, dbCompanySettings);

                    case 2:
                      inventories = _context5.sent;
                      _context5.next = 5;
                      return createInventoryReserves(inventories);

                    case 5:
                      return _context5.abrupt('return', _context5.sent);

                    case 6:
                    case 'end':
                      return _context5.stop();
                  }
                }
              }, _callee5, _this);
            })))
            // Add reserve reference to inventory, store, and company
            .then(function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(reserves) {
                var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, reserve;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        dbReserves = reserves;
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context6.prev = 4;
                        _iterator4 = reserves[Symbol.iterator]();

                      case 6:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                          _context6.next = 13;
                          break;
                        }

                        reserve = _step4.value;
                        _context6.next = 10;
                        return _inventory2.default.addToRelatedReserveRecords(reserve);

                      case 10:
                        _iteratorNormalCompletion4 = true;
                        _context6.next = 6;
                        break;

                      case 13:
                        _context6.next = 19;
                        break;

                      case 15:
                        _context6.prev = 15;
                        _context6.t0 = _context6['catch'](4);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context6.t0;

                      case 19:
                        _context6.prev = 19;
                        _context6.prev = 20;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                          _iterator4.return();
                        }

                      case 22:
                        _context6.prev = 22;

                        if (!_didIteratorError4) {
                          _context6.next = 25;
                          break;
                        }

                        throw _iteratorError4;

                      case 25:
                        return _context6.finish(22);

                      case 26:
                        return _context6.finish(19);

                      case 27:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, _this, [[4, 15, 19, 27], [20,, 22, 26]]);
              }));

              return function (_x9) {
                return _ref7.apply(this, arguments);
              };
            }()).then(function (inventories) {
              return lockInventories(dbInventories, false);
            }).then(function () {}).catch(function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return _errorLog2.default.create({
                          method: 'completeTransactions',
                          controller: 'runDefers',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err
                        });

                      case 2:
                        console.log('**************RESOLVE TRANSACTION ERR**********');
                        console.log(err);
                        // Unlock on fuck up
                        lockInventories(dbInventories, false).then(function () {});

                      case 5:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this);
              }));

              return function (_x10) {
                return _ref8.apply(this, arguments);
              };
            }()));

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function completeTransactions() {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Update bi active every 5 hours
 */


exports.getRequestOptions = getRequestOptions;
exports.default = runDefers;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

require('../company/company.model');

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _daemonError = require('../daemonError/daemonError.model');

var _daemonError2 = _interopRequireDefault(_daemonError);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _card = require('../card/card.helpers');

var _exceptions = require('../../exceptions/exceptions');

var _retailer3 = require('../retailer/retailer.controller');

var _card2 = require('../card/card.socket');

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var ObjectId = _mongoose2.default.Types.ObjectId;


var biUpdateInteralLength = 1000 * 60 * 60 * 5;
var daemonEmail = 'daemon@daemon.com';
var intervalLength = 5000;
var daemonUser = void 0;
var dbDeferred = void 0;
var interval = void 0,
    biInterval = void 0;
var promises = [];

// If I use the http library I can't include http:. If I switch, I should add it back
// Liquidation API URL
var activityPath = exports.activityPath = 'sell/activity';
var csvRatesPath = exports.csvRatesPath = 'sell/smp/update_rate/csv';
var deletePath = exports.deletePath = 'giftcard/delete';
var liquidationApiKey = exports.liquidationApiKey = '1W7dti8ocRGLl7U';
var liquidationApiPort = exports.liquidationApiPort = 8080;
var liquidationApiUrl = exports.liquidationApiUrl = 'http://localhost';
var ratesPath = exports.ratesPath = 'sell/retailers/rates';
var smpMaxMinPath = exports.smpMaxMinPath = 'sell/smp/max_min';
var updateRatesFromLqPath = exports.updateRatesFromLqPath = 'sell/retailers/rates?combine=true';
var updateRatesPath = exports.updateRatesPath = 'sell/retailers/update';
var updateRetailerPath = exports.updateRetailerPath = 'sell/update_retailer';

// SMP codes
var SAVEYA = exports.SAVEYA = '1';
var CARDCASH = exports.CARDCASH = '2';
var CARDPOOL = exports.CARDPOOL = '3';
var GIFTCARDRESCUE = exports.GIFTCARDRESCUE = '4';
var INVALID = exports.INVALID = '0';

// Default margin
var defaultMargin = exports.defaultMargin = 0.03;

/**
 * Get request options for a particular request
 * @param queryParams Object of query params
 * @param path API path
 * @param overrides
 */
function getRequestOptions(queryParams, path) {
  var overrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // Initial liquidation communication object
  return Object.assign({
    host: liquidationApiUrl,
    port: liquidationApiPort,
    path: path + '?' + _querystring2.default.stringify(queryParams),
    headers: { apiKey: liquidationApiKey },
    method: 'post'
  }, overrides);
}

/**
 * Lock/unlock all inventories
 * @param inventories
 * @param lock Lock or unlock
 * @return {Promise.<*>}
 */
function lockInventories(inventories) {
  var lock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var promises = [];
  inventories.forEach(function (inventory) {
    inventory.locked = lock;
    promises.push(inventory.save());
  });
  return Promise.all(promises);
}function determineSmp(sellTo, inventory) {
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
    var balance = inventory.balance;
    var liquidationRate = inventory.liquidationRate;
    if (typeof balance !== 'number') {
      balance = 0;
    }
    if (typeof liquidationRate !== 'number') {
      liquidationRate = 0;
    }
    inventory.liquidationSoldFor = liquidationRate * balance;
    inventory.cqTransactionId = (0, _nodeUuid2.default)();
  }
  return inventory;
}function updateBiActive() {
  var fakeRes = { json: function json() {}, status: function status() {
      return {
        json: function json() {}
      };
    } };
  (0, _retailer3.syncWithBi)({}, fakeRes);
}

/**
 * Begin the process
 */
function startInterval() {
  promises = [];
  // Find daemon
  _user2.default.findOne({ email: daemonEmail }).then(function (daemon) {
    // Use daemon for making BI requests
    if (daemon) {
      daemonUser = daemon;
    } else {
      throw 'Could not find daemon';
    }
  }).then(function () {
    interval = setInterval(function () {
      // Attempt to sell any cards already in liquidation
      sellCardsInLiquidation();
      completeTransactions();
    }, intervalLength);
    biInterval = setInterval(function () {
      // Update BI active
      updateBiActive();
    }, biUpdateInteralLength);
  });
}

/**
 * Write errors to the Db
 */
function writeErrors() {
  var daemonError = new _daemonError2.default();
  daemonError.referenceId = dbDeferred._id;
  daemonError.referenceModel = 'DeferredBalanceInquiry';
  daemonError.save().catch(function (err) {
    console.log('**************DAEMON ERROR SAVE ERROR**********');
    console.log(err);
  });
}
/**
 * Continually perform balance inquiries on those cards which were returned deferred
 *
 * @todo I need to run this using forever.js, just need to figure out how to get socket into it
 */
function runDefers() {
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
//# sourceMappingURL=runDefers.js.map
