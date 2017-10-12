'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fireAllCallbacks = exports.refireCallbackFromList = exports.reFireCallback = exports.resendCallback = exports.getCallbacksInDateRange = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Get callbacks in a date range
 */
var getCallbacksInDateRange = exports.getCallbacksInDateRange = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var _req$params, begin, end, company, findParams, logs;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (req.user.company) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', res.status(400).json({ err: 'This user does not have a company associated with their account' }));

          case 3:
            _req$params = req.params, begin = _req$params.begin, end = _req$params.end;
            company = req.user.company.toString();
            findParams = { company: company };

            if (begin && end) {
              findParams.begin = { $gt: new Date(begin) };
              findParams.end = { $lt: new Date(end) };
            }
            // Get all logs for this company
            _context.next = 9;
            return _callbackLog2.default.find(findParams);

          case 9:
            logs = _context.sent;
            return _context.abrupt('return', res.json(logs));

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](0);
            _context.next = 17;
            return _errorLog2.default.create({
              method: 'getCallbacksInDateRange',
              controller: 'callbackLog.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context.t0.stack,
              error: _context.t0,
              user: req.user._id
            });

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 13]]);
  }));

  return function getCallbacksInDateRange(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Resend callbacks for a specific card
 * @param res
 * @param card
 * @param callbackType
 * @param resend Resend a callback which has already been sent
 * @return {Promise.<boolean>}
 */


var resendCallback = exports.resendCallback = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(res, card, callbackType) {
    var resend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var log, retailer;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.t0 = callbackType;
            _context2.next = _context2.t0 === 'biComplete' ? 4 : _context2.t0 === 'cardFinalized' ? 12 : _context2.t0 === 'cqPaymentInitiated' ? 21 : _context2.t0 === 'denial' ? 30 : _context2.t0 === 'credit' ? 33 : _context2.t0 === 'biUnavailableCardAccepted' ? 42 : _context2.t0 === 'needsAttention' ? 52 : 55;
            break;

          case 4:
            log = _biRequestLog2.default.findOne({ card: card._id });

            if (log) {
              _context2.next = 9;
              break;
            }

            if (!res) {
              _context2.next = 9;
              break;
            }

            res.status(404).json({ err: 'Unable to find BI log for the requested card' });
            return _context2.abrupt('return', true);

          case 9:
            _context2.next = 11;
            return new _callback2.default().sendCallback(card, 'biComplete', null, resend);

          case 11:
            return _context2.abrupt('break', 55);

          case 12:
            if (!(['sentToSmp', 'receivedSmp', 'rejected'].indexOf(card.inventory.activityStatus) > -1)) {
              _context2.next = 17;
              break;
            }

            _context2.next = 15;
            return new _callback2.default().sendCallback(card, 'cardFinalized', null, resend);

          case 15:
            _context2.next = 20;
            break;

          case 17:
            if (!res) {
              _context2.next = 20;
              break;
            }

            res.json({ err: 'Card has not been finalized' });
            return _context2.abrupt('return', true);

          case 20:
            return _context2.abrupt('break', 55);

          case 21:
            if (!card.inventory.cqAch) {
              _context2.next = 26;
              break;
            }

            _context2.next = 24;
            return new _callback2.default().sendCallback(card, 'cqPaymentInitiated', null, resend);

          case 24:
            _context2.next = 29;
            break;

          case 26:
            if (!res) {
              _context2.next = 29;
              break;
            }

            res.json({ err: 'Card has not had payment initiated yet' });
            return _context2.abrupt('return', true);

          case 29:
            return _context2.abrupt('break', 55);

          case 30:
            _context2.next = 32;
            return new _callback2.default().sendCallback(card, 'denial', null, resend);

          case 32:
            return _context2.abrupt('break', 55);

          case 33:
            if (!card.inventory.credited) {
              _context2.next = 38;
              break;
            }

            _context2.next = 36;
            return new _callback2.default().sendCallback(card, 'credit', null, resend);

          case 36:
            _context2.next = 41;
            break;

          case 38:
            if (!res) {
              _context2.next = 41;
              break;
            }

            res.json({ err: 'Card has not been credited' });
            return _context2.abrupt('return', true);

          case 41:
            return _context2.abrupt('break', 55);

          case 42:
            retailer = _retailer2.default.findById(card.retailer);

            if (!(retailer.gsId || retailer.aiId)) {
              _context2.next = 49;
              break;
            }

            if (!res) {
              _context2.next = 47;
              break;
            }

            res.json({ err: 'BI is available for this card' });
            return _context2.abrupt('return', true);

          case 47:
            _context2.next = 51;
            break;

          case 49:
            _context2.next = 51;
            return new _callback2.default().sendCallback(card, 'biUnavailableCardAccepted', null, resend);

          case 51:
            return _context2.abrupt('break', 55);

          case 52:
            _context2.next = 54;
            return new _callback2.default().sendCallback(card, 'needsAttention', null, resend);

          case 54:
            return _context2.abrupt('break', 55);

          case 55:
            return _context2.abrupt('return', false);

          case 58:
            _context2.prev = 58;
            _context2.t1 = _context2['catch'](0);

            console.log('**************ERR IN RESEND CALLBACK**********');
            console.log(_context2.t1);

          case 62:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 58]]);
  }));

  return function resendCallback(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Fire a callback for a card whether it has been fired before or not
 */


var reFireCallback = exports.reFireCallback = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var _req$params2, cardId, callbackType, card, noCallbackSent;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _req$params2 = req.params, cardId = _req$params2.cardId, callbackType = _req$params2.callbackType;
            _context3.next = 4;
            return _card2.default.findById(cardId).populate('inventory');

          case 4:
            card = _context3.sent;
            _context3.next = 7;
            return resendCallback(res, card, callbackType, true);

          case 7:
            noCallbackSent = _context3.sent;

            if (!noCallbackSent) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt('return');

          case 10:
            return _context3.abrupt('return', res.json({}));

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3['catch'](0);
            _context3.next = 17;
            return _errorLog2.default.create({
              method: 'reFireCallback',
              controller: 'callbackLog.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context3.t0.stack,
              error: _context3.t0,
              user: req.user._id
            });

          case 17:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 13]]);
  }));

  return function reFireCallback(_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Refire a callback from a list
 */


var refireCallbackFromList = exports.refireCallbackFromList = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var _this2 = this;

    var _ret;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            return _context7.delegateYield( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
              var callbackType, cardIds, cards, counter, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, card;

              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      callbackType = req.params.callbackType;
                      cardIds = void 0;
                      _context6.prev = 2;

                      if (callbackType === 'cqPaymentInitiated') {
                        cardIds = require('./cqPaymentInitiatedBadVb').cqPaymentInitiatedBadVb;
                      } else if (callbackType === 'cardFinalized') {
                        cardIds = require('./cardFinalizedBadVb').cardFinalizedBadVb;
                      }
                      _context6.next = 13;
                      break;

                    case 6:
                      _context6.prev = 6;
                      _context6.t0 = _context6['catch'](2);

                      console.log('**************ERR**********');
                      console.log(_context6.t0);
                      _context6.next = 12;
                      return _errorLog2.default.create({
                        method: 'refireCallbackFromList',
                        controller: 'callbackLog.controller',
                        revision: (0, _errors.getGitRev)(),
                        stack: _context6.t0.stack,
                        error: _context6.t0,
                        user: req.user._id
                      });

                    case 12:
                      return _context6.abrupt('return', {
                        v: res.status(500).json({ err: 'Unable to include list of card IDs' })
                      });

                    case 13:
                      _context6.next = 15;
                      return _card2.default.find({ _id: {
                          $in: cardIds
                        } }).populate('inventory');

                    case 15:
                      cards = _context6.sent;
                      counter = 1;

                      _loop = function _loop(card) {
                        // Send callbacks
                        (function () {
                          var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(multiplier) {
                            var _this = this;

                            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                              while (1) {
                                switch (_context5.prev = _context5.next) {
                                  case 0:
                                    setTimeout(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                                      return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                        while (1) {
                                          switch (_context4.prev = _context4.next) {
                                            case 0:
                                              if (!card.inventory.isTransaction) {
                                                _context4.next = 3;
                                                break;
                                              }

                                              _context4.next = 3;
                                              return resendCallback(null, card, callbackType, true);

                                            case 3:
                                            case 'end':
                                              return _context4.stop();
                                          }
                                        }
                                      }, _callee4, _this);
                                    })), 1000 * multiplier);

                                  case 1:
                                  case 'end':
                                    return _context5.stop();
                                }
                              }
                            }, _callee5, this);
                          }));

                          return function (_x11) {
                            return _ref5.apply(this, arguments);
                          };
                        })()(counter);
                        counter = counter + 1;
                      };

                      _iteratorNormalCompletion = true;
                      _didIteratorError = false;
                      _iteratorError = undefined;
                      _context6.prev = 21;

                      for (_iterator = cards[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        card = _step.value;

                        _loop(card);
                      }
                      _context6.next = 29;
                      break;

                    case 25:
                      _context6.prev = 25;
                      _context6.t1 = _context6['catch'](21);
                      _didIteratorError = true;
                      _iteratorError = _context6.t1;

                    case 29:
                      _context6.prev = 29;
                      _context6.prev = 30;

                      if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                      }

                    case 32:
                      _context6.prev = 32;

                      if (!_didIteratorError) {
                        _context6.next = 35;
                        break;
                      }

                      throw _iteratorError;

                    case 35:
                      return _context6.finish(32);

                    case 36:
                      return _context6.finish(29);

                    case 37:
                      return _context6.abrupt('return', {
                        v: res.json({})
                      });

                    case 38:
                    case 'end':
                      return _context6.stop();
                  }
                }
              }, _callee6, _this2, [[2, 6], [21, 25, 29, 37], [30,, 32, 36]]);
            })(), 't0', 2);

          case 2:
            _ret = _context7.t0;

            if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
              _context7.next = 5;
              break;
            }

            return _context7.abrupt('return', _ret.v);

          case 5:
            _context7.next = 12;
            break;

          case 7:
            _context7.prev = 7;
            _context7.t1 = _context7['catch'](0);
            _context7.next = 11;
            return _errorLog2.default.create({
              method: 'refireCallbackFromList',
              controller: 'callbackLog.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context7.t1.stack,
              error: _context7.t1,
              user: req.user._id
            });

          case 11:
            return _context7.abrupt('return', res.status(500).json({}));

          case 12:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 7]]);
  }));

  return function refireCallbackFromList(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Fire all callbacks which should have been fired but which were not
 * @return {Promise.<void>}
 */


var fireAllCallbacks = exports.fireAllCallbacks = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var _this4 = this;

    var _ret3;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            return _context11.delegateYield( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
              var companyId, _req$body, _req$body$resend, resend, _req$body$dateBegin, dateBegin, _req$body$dateEnd, dateEnd, _req$body$callbacks, callbacks, findParams, inventories, cardIds, cards, counter, _loop2, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, card;

              return regeneratorRuntime.wrap(function _callee10$(_context10) {
                while (1) {
                  switch (_context10.prev = _context10.next) {
                    case 0:
                      companyId = req.params.companyId;
                      _req$body = req.body, _req$body$resend = _req$body.resend, resend = _req$body$resend === undefined ? false : _req$body$resend, _req$body$dateBegin = _req$body.dateBegin, dateBegin = _req$body$dateBegin === undefined ? null : _req$body$dateBegin, _req$body$dateEnd = _req$body.dateEnd, dateEnd = _req$body$dateEnd === undefined ? null : _req$body$dateEnd;
                      _req$body$callbacks = req.body.callbacks, callbacks = _req$body$callbacks === undefined ? [] : _req$body$callbacks;
                      // Only allow them to do this for their own company

                      if (!(req.user.company.toString() !== companyId)) {
                        _context10.next = 5;
                        break;
                      }

                      return _context10.abrupt('return', {
                        v: res.status(401).send('Unauthorized')
                      });

                    case 5:
                      findParams = { company: companyId, cqAch: { $exists: true }, isTransaction: true };
                      // If we're not resending, then only do it on new callbacks

                      if (resend === false && callbacks.length === 0) {
                        findParams['transaction.callbacks'] = { $size: 0 };
                        callbacks = ['cardFinalized', 'cqPaymentInitiated', 'denial', 'credit'];
                      }
                      if (dateEnd && dateBegin) {
                        findParams['created'] = { $gt: new Date(dateBegin), $lt: new Date(dateEnd) };
                      } else if (dateEnd) {
                        findParams['created'] = { $lt: new Date(dateEnd) };
                      } else if (dateBegin) {
                        findParams['created'] = { $gt: new Date(dateBegin) };
                      }
                      // Get inventories
                      _context10.next = 10;
                      return _inventory2.default.find(findParams);

                    case 10:
                      inventories = _context10.sent;

                      // Card IDs for those inventories
                      cardIds = inventories.map(function (i) {
                        return i.card.toString();
                      });
                      // Get in correct format

                      _context10.next = 14;
                      return _card2.default.find({ _id: {
                          $in: cardIds
                        } }).populate('inventory');

                    case 14:
                      cards = _context10.sent;
                      counter = 1;
                      // Iterate cards

                      _loop2 = function _loop2(card) {
                        var _loop3 = function _loop3(callback) {
                          // Wait a second between each callback
                          (function () {
                            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(multiplier) {
                              var _this3 = this;

                              return regeneratorRuntime.wrap(function _callee9$(_context9) {
                                while (1) {
                                  switch (_context9.prev = _context9.next) {
                                    case 0:
                                      setTimeout(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                                        return regeneratorRuntime.wrap(function _callee8$(_context8) {
                                          while (1) {
                                            switch (_context8.prev = _context8.next) {
                                              case 0:
                                                if (!card.inventory.isTransaction) {
                                                  _context8.next = 3;
                                                  break;
                                                }

                                                _context8.next = 3;
                                                return resendCallback(null, card, callback, resend);

                                              case 3:
                                              case 'end':
                                                return _context8.stop();
                                            }
                                          }
                                        }, _callee8, _this3);
                                      })), 1000 * multiplier);

                                    case 1:
                                    case 'end':
                                      return _context9.stop();
                                  }
                                }
                              }, _callee9, this);
                            }));

                            return function (_x14) {
                              return _ref8.apply(this, arguments);
                            };
                          })()(counter);
                          counter = counter + 1;
                        };

                        // Iterate desired callbacks
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                          for (var _iterator3 = callbacks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var callback = _step3.value;

                            _loop3(callback);
                          }
                        } catch (err) {
                          _didIteratorError3 = true;
                          _iteratorError3 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                              _iterator3.return();
                            }
                          } finally {
                            if (_didIteratorError3) {
                              throw _iteratorError3;
                            }
                          }
                        }
                      };

                      _iteratorNormalCompletion2 = true;
                      _didIteratorError2 = false;
                      _iteratorError2 = undefined;
                      _context10.prev = 20;
                      for (_iterator2 = cards[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        card = _step2.value;

                        _loop2(card);
                      }
                      _context10.next = 28;
                      break;

                    case 24:
                      _context10.prev = 24;
                      _context10.t0 = _context10['catch'](20);
                      _didIteratorError2 = true;
                      _iteratorError2 = _context10.t0;

                    case 28:
                      _context10.prev = 28;
                      _context10.prev = 29;

                      if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                      }

                    case 31:
                      _context10.prev = 31;

                      if (!_didIteratorError2) {
                        _context10.next = 34;
                        break;
                      }

                      throw _iteratorError2;

                    case 34:
                      return _context10.finish(31);

                    case 35:
                      return _context10.finish(28);

                    case 36:
                      return _context10.abrupt('return', {
                        v: res.json({})
                      });

                    case 37:
                    case 'end':
                      return _context10.stop();
                  }
                }
              }, _callee10, _this4, [[20, 24, 28, 36], [29,, 31, 35]]);
            })(), 't0', 2);

          case 2:
            _ret3 = _context11.t0;

            if (!((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object")) {
              _context11.next = 5;
              break;
            }

            return _context11.abrupt('return', _ret3.v);

          case 5:
            _context11.next = 12;
            break;

          case 7:
            _context11.prev = 7;
            _context11.t1 = _context11['catch'](0);
            _context11.next = 11;
            return _errorLog2.default.create({
              method: 'fireAllCallbacks',
              controller: 'callbackLog.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context11.t1.stack,
              error: _context11.t1,
              user: req.user._id
            });

          case 11:
            return _context11.abrupt('return', res.status(500).json({}));

          case 12:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this, [[0, 7]]);
  }));

  return function fireAllCallbacks(_x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}();

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

var _biRequestLog = require('../biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _callback = require('./callback');

var _callback2 = _interopRequireDefault(_callback);

var _callbackLog = require('./callbackLog.model');

var _callbackLog2 = _interopRequireDefault(_callbackLog);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//# sourceMappingURL=callbackLog.controller.js.map
