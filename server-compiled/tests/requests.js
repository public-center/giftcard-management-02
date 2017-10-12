'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chai = require('chai');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _card = require('../api/card/card.model');

var _card2 = _interopRequireDefault(_card);

var _environment = require('../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _retailer = require('../api/retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Requests = function () {
  function Requests() {
    _classCallCheck(this, Requests);
  }

  _createClass(Requests, [{
    key: 'loginUserSaveToken',

    /**
     * Login as a user of any type
     * @param type Type of user
     * @param setNumber Which set of data we're referring to
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type) {
        var _this = this;

        var setNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.request.post('/api/auth/local').send({
                  email: this.credentials['' + type + setNumber].email,
                  password: this.credentials['' + type + setNumber].password
                }).then(function (res) {
                  (0, _chai.expect)(res).to.have.status(200);
                  (0, _chai.expect)(res.body.token).to.not.be.empty;
                  _this.tokens['' + type + setNumber].token = res.body.token;
                  _this.tokens['' + type + setNumber]._id = res.body.user._id.toString();
                }).catch(function () {
                  (0, _chai.expect)(false).to.be.equal(true);
                });

              case 2:
                return _context.abrupt('return', _context.sent);

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loginUserSaveToken(_x2) {
        return _ref.apply(this, arguments);
      }

      return loginUserSaveToken;
    }()

    /**
     * Create a card from UI interaction
     * @param setNumber
     * @return {Promise.<void>}
     */

  }, {
    key: 'createCardFromUi',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this2 = this;

        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var retailerId, customerId, storeId, balance, tokenType, params;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                retailerId = this.getDefaultReferenceId('retailers', setNumber);
                customerId = this.getDefaultReferenceId('customers', setNumber);
                storeId = this.getDefaultReferenceId('stores', setNumber);

                this.cardNumber = this.cardNumber + 1;
                balance = 50 * setNumber;
                tokenType = 'employee' + setNumber;
                params = {
                  "retailer": retailerId,
                  "number": this.cardNumber,
                  "pin": this.cardNumber,
                  "customer": customerId,
                  "store": storeId,
                  "userTime": new Date(),
                  "balance": balance
                };
                _context3.next = 9;
                return this.request.post('/api/card/newCard').set('Authorization', 'bearer ' + this.tokens[tokenType].token).send(params).then(function () {
                  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(res) {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            (0, _chai.expect)(res).to.have.status(200);
                            return _context2.abrupt('return', res);

                          case 2:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this2);
                  }));

                  return function (_x4) {
                    return _ref3.apply(this, arguments);
                  };
                }());

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function createCardFromUi() {
        return _ref2.apply(this, arguments);
      }

      return createCardFromUi;
    }()

    /**
     * Create a card from lq/new
     * @param setNumber
     * @return {Promise.<TResult>}
     */

  }, {
    key: 'createCardFromLqNew',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _this3 = this;

        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var balance, tokenType, params;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.cardNumber = this.cardNumber + 1;
                balance = 50 * setNumber;
                tokenType = 'employee' + setNumber;
                params = {
                  number: this.cardNumber,
                  pin: this.cardNumber,
                  retailer: this.getDefaultReferenceId('retailers', setNumber),
                  customer: this.getDefaultReferenceId('customers', setNumber),
                  userTime: (0, _moment2.default)().format(),
                  balance: balance
                };
                _context5.next = 6;
                return this.request.post('/api/lq/new').set('Authorization', 'bearer ' + this.tokens[tokenType].token).send(params).then(function () {
                  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(res) {
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            (0, _chai.expect)(res).to.have.status(200);
                            return _context4.abrupt('return', res);

                          case 2:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee4, _this3);
                  }));

                  return function (_x6) {
                    return _ref5.apply(this, arguments);
                  };
                }());

              case 6:
                return _context5.abrupt('return', _context5.sent);

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createCardFromLqNew() {
        return _ref4.apply(this, arguments);
      }

      return createCardFromLqNew;
    }()

    /**
     * Create a card from a transaction
     * @param params Additional params
     * @param setNumber
     * @return {Promise.<TResult>}
     */

  }, {
    key: 'createCardFromTransaction',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(params) {
        var _this4 = this;

        var setNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var balance, tokenType;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.cardNumber = this.cardNumber + 1;
                balance = 50 * setNumber;
                tokenType = 'employee' + setNumber;

                params = Object.assign({
                  number: this.cardNumber,
                  pin: this.cardNumber,
                  retailer: this.getDefaultReferenceId('retailers', setNumber),
                  "userTime": (0, _moment2.default)().format(),
                  "balance": balance,
                  "memo": 'memo' + setNumber,
                  "merchandise": false,
                  "transactionTotal": 50,
                  "transactionId": 12345,
                  "customerId": this.getDefaultReferenceId('customers', setNumber),
                  "storeId": this.getDefaultReferenceId('stores', setNumber),
                  "prefix": 'prefix' + setNumber,
                  "vmMemo1": "a",
                  "vmMemo2": "b",
                  "vmMemo3": "c",
                  "vmMemo4": "d"
                }, params);

                _context7.next = 6;
                return this.request.post('/api/lq/transactions').set('Authorization', 'bearer ' + this.tokens[tokenType].token).send(params).then(function () {
                  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(res) {
                    return regeneratorRuntime.wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            (0, _chai.expect)(res).to.have.status(200);
                            return _context6.abrupt('return', res);

                          case 2:
                          case 'end':
                            return _context6.stop();
                        }
                      }
                    }, _callee6, _this4);
                  }));

                  return function (_x9) {
                    return _ref7.apply(this, arguments);
                  };
                }());

              case 6:
                return _context7.abrupt('return', _context7.sent);

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function createCardFromTransaction(_x8) {
        return _ref6.apply(this, arguments);
      }

      return createCardFromTransaction;
    }()

    /**
     * Add card to inventory from UI
     * @param setNumber
     * @return {Promise.<TResult>}
     */

  }, {
    key: 'addCardsToInventory',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var _this5 = this;

        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var tokenType, cards, requestBody;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                tokenType = 'employee' + setNumber;
                _context9.next = 3;
                return _card2.default.find({ user: this.tokens[tokenType]._id });

              case 3:
                cards = _context9.sent;
                requestBody = {
                  "cards": cards,
                  "userTime": new Date(),
                  "receipt": false,
                  "modifiedDenials": 0
                };
                _context9.next = 7;
                return this.request.post('/api/card/addToInventory').set('Authorization', 'bearer ' + this.tokens[tokenType].token).send(requestBody).then(function () {
                  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(res) {
                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            (0, _chai.expect)(res).to.have.status(200);
                            return _context8.abrupt('return', res);

                          case 2:
                          case 'end':
                            return _context8.stop();
                        }
                      }
                    }, _callee8, _this5);
                  }));

                  return function (_x11) {
                    return _ref9.apply(this, arguments);
                  };
                }());

              case 7:
                return _context9.abrupt('return', _context9.sent);

              case 8:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function addCardsToInventory() {
        return _ref8.apply(this, arguments);
      }

      return addCardsToInventory;
    }()

    /**
     * Request /lq/new
     * @param params Request body
     * @param userType Type of user making request
     * @param setNumber Set of cards, users, etc
     * @return {Promise.<*>}
     */

  }, {
    key: 'lqNew',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(params) {
        var userType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'corporateAdmin';
        var setNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                if (!params) {
                  this.cardNumber = this.cardNumber + 1;
                  params = {
                    number: this.cardNumber,
                    pin: this.cardNumber,
                    retailer: this.getDefaultReferenceId('retailers', setNumber),
                    userTime: (0, _moment2.default)().format(),
                    balance: 40,
                    merchandise: false
                  };
                }

                _context10.next = 3;
                return this.request.post('/api/lq/new').set('Authorization', 'bearer ' + this.tokens['' + userType + setNumber].token).send(params);

              case 3:
                return _context10.abrupt('return', _context10.sent);

              case 4:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function lqNew(_x14) {
        return _ref10.apply(this, arguments);
      }

      return lqNew;
    }()

    /**
     * Request /lq/transactions
     * @param params Request body
     * @param userType Type of user making request
     * @param setNumber Set of cards, users, etc
     * @return {Promise.<*>}
     */

  }, {
    key: 'lqTransactions',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var userType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'corporateAdmin';
        var setNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        var balance;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                this.cardNumber = this.cardNumber + 1;
                balance = 50 * setNumber;

                if (params === null) {
                  params = {};
                } else {
                  params = Object.assign({
                    number: this.cardNumber,
                    pin: this.cardNumber,
                    retailer: this.getDefaultReferenceId('retailers', setNumber),
                    userTime: new Date(),
                    balance: balance,
                    memo: "Match example",
                    merchandise: false,
                    transactionTotal: 50,
                    transactionId: 12345,
                    customerId: this.getDefaultReferenceId('customers', setNumber),
                    storeId: this.getDefaultReferenceId('stores', setNumber),
                    prefix: "xyz",
                    vmMemo1: "a",
                    vmMemo2: "b",
                    vmMemo3: "c",
                    vmMemo4: "d"
                  }, params);
                }

                _context11.next = 5;
                return this.request.post('/api/lq/transactions').set('Authorization', 'bearer ' + this.tokens['' + userType + setNumber].token).send(params);

              case 5:
                return _context11.abrupt('return', _context11.sent);

              case 6:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function lqTransactions() {
        return _ref11.apply(this, arguments);
      }

      return lqTransactions;
    }()

    /**
     * Create a BI request log
     * @param params Additional params for log
     * @return {Promise.<void>}
     */

  }, {
    key: 'createBiLog',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var biLogParams;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                biLogParams = Object.assign({
                  number: '1',
                  pin: '1',
                  retailer: this.getDefaultReferenceId('retailers'),
                  requestId: '1',
                  prefix: '1'
                }, params);
                _context12.next = 3;
                return this.request.post('/api/lq/bi').set('Authorization', 'bearer ' + this.tokens.employee1.token).send(biLogParams);

              case 3:
                return _context12.abrupt('return', _context12.sent);

              case 4:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function createBiLog() {
        return _ref12.apply(this, arguments);
      }

      return createBiLog;
    }()

    /**
     * Send callbacks for transaction
     * @param callbackType Callback type
     * @param inventories Inventories to send callbacks for
     * @return {Promise.<*>}
     */

  }, {
    key: 'sendTransactionCallback',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(callbackType, inventories) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt('return', this.request.put('/api/admin/callbacks/' + callbackType).set('Authorization', 'bearer ' + this.tokens.admin1.token).send({
                  inventories: inventories,
                  type: callbackType,
                  force: true
                }));

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function sendTransactionCallback(_x19, _x20) {
        return _ref13.apply(this, arguments);
      }

      return sendTransactionCallback;
    }()

    /**
     * Complete a BI log
     * @param params
     * @param requestId BI request ID
     * @return {Promise.<void>}
     */

  }, {
    key: 'completeBiLog',
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var requestId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '1';
        var retailer;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                if (params === null) {
                  params = {};
                } else {
                  params = Object.assign({
                    "number": 1,
                    "pin": 1,
                    "retailerId": this.getDefaultReferenceId('retailers'),
                    "invalid": 0,
                    "balance": 100,
                    "fixed": 0
                  }, params);
                }
                _context14.next = 3;
                return _retailer2.default.findById(params.retailerId);

              case 3:
                retailer = _context14.sent;

                if (retailer) {
                  // Set the BI value for retailer
                  params.retailerId = retailer.gsId || retailer.aiId;
                }
                return _context14.abrupt('return', this.request.post('/api/lq/bi/' + requestId).set(_environment2.default.biCallbackKeyHeader, _environment2.default.biCallbackKey).send(params));

              case 6:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function completeBiLog() {
        return _ref14.apply(this, arguments);
      }

      return completeBiLog;
    }()

    /**
     * Update inventory details
     * @param {Array} inventories Selected inventories
     * @param {Object} params
     */

  }, {
    key: 'updateInventoryDetails',
    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(inventories) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt('return', this.request.post('/api/card/updateDetails').set('Authorization', 'bearer ' + this.tokens.admin1.token).send(Object.assign({
                  ids: inventories
                }, params)));

              case 1:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function updateInventoryDetails(_x24) {
        return _ref15.apply(this, arguments);
      }

      return updateInventoryDetails;
    }()

    /**
     * Reject card
     */

  }, {
    key: 'rejectCard',
    value: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(inventories) {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                return _context16.abrupt('return', this.request.post('/api/card/reject').set('Authorization', 'bearer ' + this.tokens.admin1.token).send({
                  inventories: inventories
                }));

              case 1:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function rejectCard(_x25) {
        return _ref16.apply(this, arguments);
      }

      return rejectCard;
    }()
  }]);

  return Requests;
}();

exports.default = Requests;
//# sourceMappingURL=requests.js.map
