'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

require('../company/company.model');

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

require('../stores/store.model');

require('../reserve/reserve.model');

var _callbackLog = require('./callbackLog.model');

var _callbackLog2 = _interopRequireDefault(_callbackLog);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

var _card3 = require('../card/card.helpers');

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Callback = function () {
  function Callback() {
    _classCallCheck(this, Callback);
  }

  _createClass(Callback, [{
    key: 'makeCallbackFromCard',

    // Make a callback as part of a transaction
    /*
     {
     id: string <card ID>,
     number: string <last 4 digits of card>,
     claimedBalance: float <balance claimed by user>,
     verifiedBalance: float <balance verified by BI>,
     cqPaid: float <the amount CQ is paying before fees>,
     netPayout: float <the amount CQ is paying after fees>,
     prefix: string <card prefix>,
     cqAch: string<the CQ number in our payment to you>,
     finalized: boolean <whether the sale is finalized>,
     callbackType: string <type of callback>
     }
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(card, callbackUrl, callbackType, finalized) {
        var verifiedBalance, data, logEntry;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                verifiedBalance = card.inventory.verifiedBalance;
                data = {
                  id: card._id,
                  number: card.getLast4Digits(),
                  claimedBalance: card.balance,
                  verifiedBalance: verifiedBalance,
                  cqPaid: card.inventory.transaction.cqPaid,
                  netPayout: card.inventory.transaction.netPayout,
                  prefix: card.inventory.transaction.prefix,
                  cqAch: card.inventory.cqAch,
                  finalized: finalized,
                  callbackType: callbackType
                };

                if (callbackType === 'cardFinalized' || callbackType === 'cqPaymentInitiated') {
                  if (verifiedBalance === null || typeof verifiedBalance === 'undefined') {
                    data.verifiedBalance = card.inventory.balance;
                  }
                } else if (callbackType === 'needsAttention') {
                  data.note = card.inventory.adminActivityNote;
                }

                if (_environment2.default.debug) {
                  console.log('**************CALLBACK DATA FROM TRANSACTION**********');
                  console.log(data);
                }

                // Save initial log entry
                _context2.next = 6;
                return _callbackLog2.default.create({
                  callbackType: callbackType,
                  number: card.getLast4Digits(),
                  pin: card.pin,
                  claimedBalance: card.balance,
                  verifiedBalance: verifiedBalance,
                  cqPaid: card.inventory.transaction.cqPaid,
                  netPayout: card.inventory.transaction.netPayout,
                  prefix: card.inventory.transaction.prefix,
                  cqAch: card.inventory.cqAch,
                  finalized: finalized,
                  success: false,
                  url: callbackUrl,
                  card: card._id,
                  company: card.inventory.company,
                  statusCode: 0
                });

              case 6:
                logEntry = _context2.sent;

                if (!(_environment2.default.env === 'development' || _environment2.default.env === 'test')) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt('return');

              case 9:

                _superagent2.default.post(callbackUrl).send(data).end(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err, res) {
                    var success, text, statusCode;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!err) {
                              if (_environment2.default.debug) {
                                console.log('Sent ' + JSON.stringify(data) + ' to ' + callbackUrl);
                              }
                            } else {
                              if (_environment2.default.debug) {
                                console.log('*************ERROR SENDING CALLBACK*************');
                                console.log(err);
                              }
                            }
                            success = false;
                            text = '';
                            statusCode = 404;

                            if (res) {
                              success = res.status ? res.status < 300 : false;
                              text = res.text ? res.text : '';
                              statusCode = res.status;
                            }

                            logEntry.failResponse = success ? '' : text;
                            logEntry.statusCode = statusCode;
                            logEntry.success = success;
                            logEntry.finalized = finalized;
                            _context.next = 11;
                            return logEntry.save();

                          case 11:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x5, _x6) {
                    return _ref2.apply(this, arguments);
                  };
                }());

              case 10:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function makeCallbackFromCard(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return makeCallbackFromCard;
    }()
    // Make a callback directly from a /bi requests
    /*
     {
     number: string <last 4 digits of card>,
     verifiedBalance: number <balance from BI>,
     pin: string <card pin>,
     callbackType: "balanceCB",
     prefix: string <card prefix>
     }
     */

  }, {
    key: 'makeCallbackFromLog',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(log, callbackUrl, callbackType) {
        var inventory, data, logData, logEntry;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                inventory = {};
                // This is actually a card, since we're using a card for BiUnavailable callbacks

                if (!(log.constructor.modelName === 'Card' && log.inventory)) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 4;
                return _inventory2.default.findById(log.inventory);

              case 4:
                inventory = _context4.sent;

              case 5:
                data = {
                  number: log.getLast4Digits(),
                  verifiedBalance: log.balance,
                  pin: log.pin,
                  callbackType: callbackType
                };
                // BiLog callback

                if (log.prefix) {
                  data.prefix = log.prefix;
                  // BiUnavailable callback
                } else if (inventory.isTransaction && inventory.transaction.prefix) {
                  data.prefix = inventory.transaction.prefix;
                }

                if (_environment2.default.debug) {
                  console.log('**************CALLBACK DATA FROM LOG**********');
                  console.log(data);
                }

                logData = Object.assign(data, {
                  success: false,
                  url: callbackUrl,
                  finalized: false,
                  statusCode: 0
                });
                logEntry = new _callbackLog2.default(logData);
                _context4.next = 12;
                return logEntry.save();

              case 12:
                logEntry = _context4.sent;

                if (!(_environment2.default.env === 'development' || _environment2.default.env === 'test')) {
                  _context4.next = 15;
                  break;
                }

                return _context4.abrupt('return');

              case 15:

                _superagent2.default.post(callbackUrl).send(data).end(function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err, res) {
                    var success, text, statusCode;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            if (!err) {
                              console.log('Sent ' + JSON.stringify(data) + ' to ' + callbackUrl);
                            } else {
                              console.log('*************ERROR SENDING CALLBACK*************');
                              console.log(err);
                            }

                            success = false;
                            text = '';
                            statusCode = 404;

                            if (res) {
                              success = res.status ? res.status < 300 : false;
                              text = res.text ? res.text : '';
                              statusCode = res.status;
                            }
                            // Update log with result
                            logEntry.success = success;
                            logEntry.failResponse = success ? '' : text;
                            logEntry.statusCode = statusCode;
                            logEntry.finalized = log.finalized;

                            _context3.next = 11;
                            return logEntry.save();

                          case 11:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x10, _x11) {
                    return _ref4.apply(this, arguments);
                  };
                }());

              case 16:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function makeCallbackFromLog(_x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
      }

      return makeCallbackFromLog;
    }()

    /**
     * Update inventory with the type of callback being made
     * @param inventory Inventory
     * @param callbackType Callback type
     * @return {Promise.<void>}
     */

  }, {
    key: 'updateInventory',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(inventory, callbackType) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!Array.isArray(inventory.transaction.callbacks)) {
                  inventory.transaction.callbacks = [];
                }

                if (!(inventory.transaction.callbacks.indexOf(callbackType) === -1)) {
                  _context5.next = 6;
                  break;
                }

                inventory.transaction.callbacks.push(callbackType);
                _context5.next = 5;
                return inventory.save();

              case 5:
                return _context5.abrupt('return', _context5.sent);

              case 6:
                return _context5.abrupt('return', Promise.resolve(inventory));

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function updateInventory(_x12, _x13) {
        return _ref5.apply(this, arguments);
      }

      return updateInventory;
    }()
    /**
     * Notifies the company of a certain card
     *
     * @param {Object} card
     * @param {String} callbackType One of "balanceCB", "biComplete", "cardFinalized", "cqPaymentInitiated"
     * @param {String} callbackUrl Send a callback directly to this URL
     * @param {Boolean} resend Resend a callback which has already potentially been sent
     */

  }, {
    key: 'sendCallback',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(card, callbackType) {
        var callbackUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var resend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var _callbackUrl, finalized;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;

                if (!callbackUrl) {
                  _context6.next = 3;
                  break;
                }

                return _context6.abrupt('return', this.makeCallbackFromLog(card, callbackUrl, callbackType));

              case 3:
                if (!(card.constructor.name !== 'model' || !card.inventory)) {
                  _context6.next = 7;
                  break;
                }

                _context6.next = 6;
                return _card2.default.findOne({ _id: card._id }).populate('inventory');

              case 6:
                card = _context6.sent;

              case 7:
                if (card) {
                  _context6.next = 9;
                  break;
                }

                return _context6.abrupt('return');

              case 9:
                if (!(card.inventory && card.inventory.isTransaction)) {
                  _context6.next = 28;
                  break;
                }

                if (!(resend || card.inventory.transaction.callbacks.indexOf(callbackType) === -1)) {
                  _context6.next = 28;
                  break;
                }

                _context6.next = 13;
                return this.updateInventory(card.inventory, callbackType);

              case 13:
                card.inventory = _context6.sent;
                _context6.next = 16;
                return card.inventory.getCallbackUrl();

              case 16:
                _callbackUrl = _context6.sent;

                if (!_callbackUrl) {
                  _context6.next = 28;
                  break;
                }

                finalized = false;

                if (!(['receivedSmp', 'sendToSmp', 'rejected'].indexOf(card.inventory.activityStatus) > -1 || card.inventory.cqAch)) {
                  _context6.next = 26;
                  break;
                }

                finalized = true;
                // Recalculate card to see if anything has changes
                _context6.next = 23;
                return (0, _card3.recalculateTransactionAndReserve)(card.inventory);

              case 23:
                _context6.next = 25;
                return _card2.default.findById(card._id).populate('inventory');

              case 25:
                card = _context6.sent;

              case 26:
                _context6.next = 28;
                return this.makeCallbackFromCard(card, _callbackUrl, callbackType, finalized);

              case 28:
                _context6.next = 34;
                break;

              case 30:
                _context6.prev = 30;
                _context6.t0 = _context6['catch'](0);
                _context6.next = 34;
                return _errorLog2.default.create({
                  method: 'refireCallbackFromList',
                  controller: 'callbackLog.controller',
                  revision: (0, _errors.getGitRev)(),
                  stack: _context6.t0.stack,
                  error: _context6.t0
                });

              case 34:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[0, 30]]);
      }));

      function sendCallback(_x16, _x17) {
        return _ref6.apply(this, arguments);
      }

      return sendCallback;
    }()
  }]);

  return Callback;
}();

exports.default = Callback;
//# sourceMappingURL=callback.js.map
