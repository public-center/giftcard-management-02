'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inventorySchemaObject = undefined;

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

var _environment = require('../../config/environment');

var _number = require('../../helpers/number');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var inventorySchemaObject = exports.inventorySchemaObject = {
  // Balance (either from BI or from manual)
  balance: Number,
  // Actual card buy rate, which can differ from buy rate calculated by retailer minus margin
  buyRate: Number,
  // Buy amount (the amount that the store bought the card from the customer for)
  buyAmount: Number,
  // SMP Transaction ID (not Vista)
  transactionId: String,
  // CQ transaction ID (not Vista)
  cqTransactionId: String,
  // SMP to whom card is sold
  // CC: 2
  // CP: 3
  smp: String,
  // Type of card (electronic or physical) as returned from LQAPI
  type: { type: String, get: convertToLowerCase, set: convertToLowerCase },
  // Transaction status (pending, shipped, paid, denied)
  status: String,
  // Notes added in activity
  adminActivityNote: String,
  // Liquidation status message
  status_message: { type: String },
  // The amount that CQ receives from the SMP for the sale of a card
  liquidationSoldFor: { type: Number },
  // Rate returned from liquidation API (Without margin)
  liquidationRate: { type: Number },
  // Rate at purchase (without margin included)
  sellRateAtPurchase: Number,
  // Disable adding to liquidation
  disableAddToLiquidation: { type: String },
  // Margin at time of adding to liquidation
  margin: { type: Number, default: 0.03, min: 0, max: 1 },
  // Service fee at time of transaction
  serviceFee: { type: Number, default: 0.0075, min: 0, max: 1 },
  // User timezone offset
  tzOffset: String,
  // Rejected
  rejected: { type: Boolean, default: false },
  // Rejected date
  rejectedDate: Date,
  // Reject amount
  rejectAmount: Number,
  // Credited
  credited: { type: Boolean, default: false },
  // Credited date
  creditedDate: Date,
  // Credit amount
  creditAmount: Number,
  /**
   * LQ interactions
   */
  // Proceed with sale is set to false when auto-sell is turned off, and requires an admin to approve the sale
  proceedWithSale: { type: Boolean, default: true },
  // Sold via liquidation
  soldToLiquidation: { type: Boolean, default: false },
  /**
   * SaveYa confirms
   */
  saveYaConfirmLastRunTime: {
    type: Date,
    default: Date.now
  },
  // @todo Save ya info (I wanna delete you, fucker, but we've got some old data that needs you
  saveYa: {
    // In the process of selling to SY
    selling: { type: Boolean },
    // SaveYa verification
    confirmed: { type: Boolean, default: false },
    // Save ya rejected
    rejected: { type: Boolean, default: false },
    // Saveya reject reason
    rejectReason: String,
    // SaveYa returned balance
    balance: { type: Number },
    // SaveYa rate
    saveYaRate: { type: Number },
    // SaveYa status (can set if not confirmed)
    saveYaStatus: { type: String },
    // Under review by SY
    underReview: { type: Boolean, default: false },
    // SY offer
    offer: Number,
    // payment type
    paymentType: String,
    // Error in connections with SY
    error: String
  },
  // Activity status (THIS IS THE USED STATUS)
  activityStatus: String,
  // Corporate ship status (will be set from corporate activity page)
  // @todo Unused
  buyerShipStatus: String,
  // Corporate ACH (will be set from corporate activity page)
  buyerAch: String,
  // Paid status
  paidStatus: String,
  // Ach number
  achNumber: String,
  // Verified balance (set to 0 for invalid cards)
  verifiedBalance: { type: Number, get: defaultsToBalance, default: null },
  // Verified balance has been received
  hasVerifiedBalance: { type: Boolean, default: false },
  // Order number
  orderNumber: String,
  // SMP ACH
  smpAch: String,
  // CQ ACH
  cqAch: String,
  /**
   * Created
   */
  created: {
    type: Date,
    default: Date.now
  },
  /**
   * User time when inventory created
   */
  userTime: {
    type: Date
  },
  /**
   * System time, because we've come full fucking circle
   */
  systemTime: { type: Date, default: Date.now },

  // Card is invalid, set either by an admin or by BI response
  valid: Boolean,

  // Deduction number
  deduction: String,
  // Process lock
  locked: { type: Boolean, default: false },
  // Merchandise
  merchandise: { type: Boolean, default: false },
  /**
   * Vista data
   */
  isTransaction: { type: Boolean, default: false },
  // Transaction data
  transaction: {
    // can be set to whatever they want
    memo: String,
    // verifiedBalance * retailer.creditValuePercentage - amount spent
    nccCardValue: {
      type: Number
    },
    // Value of the complete transaction, both GC and cash
    transactionTotal: Number,
    // Transaction ID
    transactionId: String,
    // Amount paid to the merchant for this transaction
    merchantPayoutAmount: Number,
    // Percentage paid out to the merchant for this transaction
    merchantPayoutPercentage: Number,
    // Amount due in cash for this transaction
    amountDue: Number,
    // Amount CQ paid to vista
    cqPaid: Number,
    // Reserve
    reserve: { type: Schema.Types.ObjectId, ref: 'Reserve' },
    // Reserve amount
    reserveAmount: Number,
    // CQ withheld
    cqWithheld: Number,
    // Net payout to Vista
    netPayout: Number,
    // Prefix (whatever they want this to be, like memo)
    prefix: String,
    // Service fees are handled differently for transactions. This is the dollar figure, not the rate
    serviceFee: Number,
    // Amount credited based on card balance
    creditValuePercentage: Number,
    // Current max spending for this store
    maxSpending: Number,
    // VM Memos
    vmMemo1: String,
    vmMemo2: String,
    vmMemo3: String,
    vmMemo4: String,
    // Which callbacks have already been sent (we don't want repeat callbacks)
    callbacks: []
  },
  // Callback URL once a VB is determined
  callbackUrl: String,
  // Inventory has changed
  changed: { type: Boolean, default: true },
  // Is sold via LQ API
  isApi: { type: Boolean, default: false },
  /**
   * Relations
   */
  // User checking the card
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  // Retailer
  retailer: { type: Schema.Types.ObjectId, ref: 'Retailer' },
  // Store
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Company
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  // Liquidation error
  liquidationError: [{ type: Schema.Types.ObjectId, ref: 'LiquidationError' }],
  // Card
  card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  // User
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  // Reconciliation
  reconciliation: { type: Schema.Types.ObjectId, ref: 'Reconciliation' },
  // Batch
  batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
  // Receipt
  receipt: { type: Schema.Types.ObjectId, ref: 'Receipt' }
};

// Schema
var InventorySchema = new Schema(inventorySchemaObject);

// Indexes
var indexes = [
// Unique card index
[{ card: 1 }, { name: 'card', unique: true }], [{ soldToLiquidation: 1, proceedWithSale: 1, disableAddToLiquidation: 1, type: 1, locked: 1, isTransaction: 1 }]];
(0, _indexDb2.default)(InventorySchema, indexes);

// Static methods
InventorySchema.statics = {
  /**
   * Cache inventory values
   * @param inventory
   */
  cacheInventoryValues: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(inventory) {
      var companyMargin, cache;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              companyMargin = isNaN(inventory.companyMargin) ? 0 : inventory.companyMargin;
              cache = new (this.model('InventoryCache'))({
                inventory: inventory._id,
                corpRateThisInventory: inventory.corpRateThisInventory,
                serviceFee: inventory.serviceFee,
                companyMargin: companyMargin,
                displayMargin: inventory.displayMargin,
                companyActivityStatus: inventory.activityStatus,
                adjustedBuyAmountAfterRejection: inventory.realBuyAmount,
                amountOwed: inventory.amountOwed,
                cqPaid: inventory.cqPaid,
                netAmount: inventory.netAmount
              });
              return _context.abrupt('return', cache.save());

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function cacheInventoryValues(_x) {
      return _ref.apply(this, arguments);
    }

    return cacheInventoryValues;
  }(),
  /**
   * Get reserve amount for a card
   * @param balance Claimed or verified balance
   * @param reserveRate Reserve rate
   * @return {Number}
   */
  getReserveAmount: function getReserveAmount(balance, reserveRate) {
    return (0, _number.formatFloat)(balance * reserveRate);
  },

  /**
   * Get CQ paid amount
   * @param balance Claimed or VB
   * @param rateAfterMargin LQ rate minus margin
   * @return {number}
   */
  getCqPaid: function getCqPaid(balance, rateAfterMargin) {
    return (0, _number.formatFloat)(balance * rateAfterMargin);
  },

  /**
   * Determine if we have valid calculated values for this inventory
   */
  getCalculatedValues: function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(inventory) {
      var _this = this;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', new Promise(function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
                  var changed, cache;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          changed = inventory.changed;
                          // See if we have calculated values

                          _context2.next = 3;
                          return _this.model('InventoryCache').findOne({ inventory: inventory._id });

                        case 3:
                          cache = _context2.sent;

                          if (cache) {
                            _context2.next = 6;
                            break;
                          }

                          return _context2.abrupt('return', resolve(null));

                        case 6:
                          if (changed) {
                            _context2.next = 10;
                            break;
                          }

                          return _context2.abrupt('return', resolve(cache));

                        case 10:
                          cache.remove().then(function () {
                            return resolve(null);
                          }).catch(function (err) {
                            console.log('**************ERR REMOVING CACHE**********');
                            console.log(err);
                            resolve(null);
                          });

                        case 11:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this);
                }));

                return function (_x3) {
                  return _ref3.apply(this, arguments);
                };
              }()));

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function getValues(_x2) {
      return _ref2.apply(this, arguments);
    }

    return getValues;
  }(),
  /**
   * Add new reserve to a company or store set of reserves
   * @param model Company or Store model
   * @param reserve Incoming reserve
   * @return {Promise.<void>}
   */
  addReserveToSet: function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(model, reserve) {
      var reserveId;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              reserveId = reserve._id;

              if (!(model.reserves.map(function (r) {
                return r.toString();
              }).indexOf(reserveId) === -1)) {
                _context4.next = 6;
                break;
              }

              model.reserves.push(reserveId);
              model.reserveTotal = model.reserveTotal + reserve.amount;
              _context4.next = 6;
              return model.save();

            case 6:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function addReserveToSet(_x4, _x5) {
      return _ref4.apply(this, arguments);
    }

    return addReserveToSet;
  }(),

  /**
   * Store an error log item if we cannot find a reference that should exist
   * @param modelType
   * @return {Promise.<*>}
   */
  addToRelatedErrorLog: function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(modelType) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.model('Log').create({
                path: 'runDefers/completeTransactions/addToRelatedReserveRecords',
                params: reserve,
                isError: true,
                statusMessage: 'Unable to retrieve ' + modelType
              });

            case 2:
              return _context5.abrupt('return', _context5.sent);

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function addToRelatedErrorLog(_x6) {
      return _ref5.apply(this, arguments);
    }

    return addToRelatedErrorLog;
  }(),

  /**
   * Add reserve values to store, company, and inventory
   * @return {Promise.<void>}
   */
  addToRelatedReserveRecords: function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(reserve) {
      var company, store;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return this.model('Company').findById(reserve.company);

            case 2:
              company = _context6.sent;

              if (company) {
                _context6.next = 7;
                break;
              }

              _context6.next = 6;
              return this.addToRelatedErrorLog('company');

            case 6:
              return _context6.abrupt('return', _context6.sent);

            case 7:
              _context6.next = 9;
              return this.addReserveToSet(company, reserve);

            case 9:
              _context6.next = 11;
              return this.model('Store').findById(reserve.store);

            case 11:
              store = _context6.sent;

              if (company) {
                _context6.next = 16;
                break;
              }

              _context6.next = 15;
              return this.addToRelatedErrorLog('store');

            case 15:
              return _context6.abrupt('return', _context6.sent);

            case 16:
              _context6.next = 18;
              return this.addReserveToSet(store, reserve);

            case 18:
              _context6.next = 20;
              return this.update({ _id: reserve.inventory }, {
                $set: { 'transaction.reserve': reserve._id, 'transaction.reserveAmount': reserve.amount }
              });

            case 20:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function addToRelatedReserveRecords(_x7) {
      return _ref6.apply(this, arguments);
    }

    return addToRelatedReserveRecords;
  }()
};

InventorySchema.methods = {
  // Retrieve card associated with inventory
  getCard: function getCard() {
    return this.model('Card').findOne({ inventory: this._id });
  },
  getCallbackUrl: function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var _this2 = this;

      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!this.callbackUrl) {
                _context7.next = 2;
                break;
              }

              return _context7.abrupt('return', Promise.resolve(this.callbackUrl));

            case 2:
              return _context7.abrupt('return', this.model('Store').findOne({ _id: this.store }).then(function (store) {
                if (store.callbackUrl) {
                  return Promise.resolve(store.callbackUrl);
                }

                return _this2.model('CompanySettings').findOne({ company: _this2.company }).then(function (settings) {
                  return Promise.resolve(settings.callbackUrl);
                });
              }));

            case 3:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function getCallbackUrl() {
      return _ref7.apply(this, arguments);
    }

    return getCallbackUrl;
  }(),
  /**
   * Get transaction values
   * @param reserveAmount Reserve amount
   * @param cqPaid The amount CQ is paying for the card
   * @param balance Claimed or VB
   * @return {InventorySchema.methods}
   */
  getTransactionValues: function getTransactionValues(reserveAmount, cqPaid, balance) {
    this.transaction.cqWithheld = (0, _number.formatFloat)(this.transaction.serviceFee + reserveAmount);
    this.transaction.netPayout = (0, _number.formatFloat)(balance * (this.liquidationRate - this.margin) - this.transaction.cqWithheld);
    this.transaction.cqPaid = cqPaid;
    this.cqPaid = cqPaid;
    return this;
  },

  /**
   * Create a reserve for a transaction
   * @return {Promise.<*>}
   */
  createReserve: function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var company, reserve;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              company = this.company._id ? this.company._id : this.company;
              reserve = new (this.model('Reserve'))({
                inventory: this._id,
                amount: this.transaction.reserveAmount,
                company: company,
                store: this.store
              });
              return _context8.abrupt('return', reserve.save());

            case 3:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function createReserve() {
      return _ref8.apply(this, arguments);
    }

    return createReserve;
  }(),

  /**
   * Mongodb params for removing previously set reserves
   * @param reserve
   * @return {{$pull: {reserves: *}, set: {reserveTotal: *}}}
   */
  undoReserveValues: function undoReserveValues(reserve) {
    return {
      $pull: {
        reserves: reserve._id
      },
      $inc: { reserveTotal: reserve.amount * -1 }
    };
  },

  /**
   * Remove a reserve from a transaction
   * @return {Promise.<void>}
   */
  removeReserve: function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      var _this3 = this;

      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt('return', new Promise(function () {
                var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve) {
                  var reserveId, _reserve, company, store, inventory;

                  return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _context9.prev = 0;
                          reserveId = _this3.transaction.reserve;
                          // Remove a reserve from an inventory, company, and store so it can be recalculated

                          if (!_this3.transaction.reserve) {
                            _context9.next = 29;
                            break;
                          }

                          _context9.next = 5;
                          return _this3.model('Reserve').findById(_this3.transaction.reserve);

                        case 5:
                          _reserve = _context9.sent;

                          if (!_reserve) {
                            _context9.next = 29;
                            break;
                          }

                          _context9.next = 9;
                          return _this3.model('Reserve').remove({ _id: _reserve._id });

                        case 9:
                          _context9.next = 11;
                          return _this3.model('Company').findOne({ reserves: _reserve._id });

                        case 11:
                          company = _context9.sent;
                          _context9.next = 14;
                          return _this3.model('Store').findOne({ reserves: _reserve._id });

                        case 14:
                          store = _context9.sent;
                          _context9.next = 17;
                          return _this3.constructor.findById(_this3._id);

                        case 17:
                          inventory = _context9.sent;

                          if (!company) {
                            _context9.next = 21;
                            break;
                          }

                          _context9.next = 21;
                          return _this3.model('Company').update({ _id: company._id }, _this3.undoReserveValues(_reserve));

                        case 21:
                          if (!store) {
                            _context9.next = 24;
                            break;
                          }

                          _context9.next = 24;
                          return _this3.model('Store').update({ _id: store._id }, _this3.undoReserveValues(_reserve));

                        case 24:
                          if (!inventory) {
                            _context9.next = 27;
                            break;
                          }

                          _context9.next = 27;
                          return _this3.constructor.update({ _id: _this3._id }, {
                            $set: {
                              'transaction.reserve': null,
                              'transaction.reserveAmount': 0
                            }
                          });

                        case 27:
                          _context9.next = 29;
                          return _this3.model('Reserve').remove({ _id: reserveId });

                        case 29:

                          resolve(null);
                          _context9.next = 37;
                          break;

                        case 32:
                          _context9.prev = 32;
                          _context9.t0 = _context9['catch'](0);

                          console.log('**************ERR IN REMOVE RESERVE**********');
                          console.log(_context9.t0);
                          console.log(_context9.t0.stack);

                        case 37:
                        case 'end':
                          return _context9.stop();
                      }
                    }
                  }, _callee9, _this3, [[0, 32]]);
                }));

                return function (_x8) {
                  return _ref10.apply(this, arguments);
                };
              }()));

            case 1:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function removeReserve() {
      return _ref9.apply(this, arguments);
    }

    return removeReserve;
  }()
};

// Set number for SMP
InventorySchema.pre('save', function (next) {
  if (typeof this.smp !== 'undefined' && [_environment.smpIds.SAVEYA, _environment.smpIds.CARDCASH, _environment.smpIds.CARDPOOL, _environment.smpIds.GIFTCARDZEN].indexOf(this.smp) === -1) {
    var setSmp = parseInt(this.smp);
    // Change to int
    if (isNaN(setSmp)) {
      if (this.smp && [_environment.smpIds.SAVEYA, _environment.smpIds.CARDCASH, _environment.smpIds.CARDPOOL, _environment.smpIds.GIFTCARDZEN].indexOf(this.smp) === -1) {
        var smp = _environment.smpIds[this.smp.toUpperCase()];
        if (smp) {
          this.smp = smp;
        }
      }
    }
  }
  next();
});

/**
 * Determine if inventory has changed and needs to be recalculated
 */
InventorySchema.pre('validate', function (next) {
  var _this4 = this;

  try {
    this.constructor.findById(this._id).then(function (oldInventory) {
      if (!oldInventory) {
        _this4.changed = true;
      } else {
        // If anything has changed, set as changed
        var current = _this4.toObject();
        var old = oldInventory.toObject();
        delete old.changed;
        delete current.changed;
        if (JSON.stringify(current) !== JSON.stringify(old)) {
          _this4.changed = true;
        }
      }
      next();
    }).catch(function (err) {
      _this4.changed = true;
      next();
    });
  } catch (err) {
    this.changed = true;
    next();
  }
});

/**
 * Attribute methods
 * @param verifiedBalance
 * @return {*}
 */
function defaultsToBalance(verifiedBalance) {
  if (typeof verifiedBalance === 'number') {
    return verifiedBalance;
  }
  var claimedBalance = this.balance;
  // Use CB for VB if cqAch is set and VB is not set
  if (this.cqAch) {
    return claimedBalance;
  }
  // Use claimed balance if sent to SMP or received by SMP and VB is unavailable
  if (this.activityStatus) {
    var useClaimedIfNoVb = ['sentToSmp', 'receivedSmp'].indexOf(this.activityStatus) > -1;
    if (useClaimedIfNoVb) {
      return claimedBalance;
    }
  }

  return verifiedBalance;
}
function convertToLowerCase(whatever) {
  if (whatever) {
    return whatever.toLowerCase();
  }
}

InventorySchema.set('toJSON', { getters: true });
InventorySchema.set('toObject', { getters: true });

module.exports = mongoose.model('Inventory', InventorySchema);
//# sourceMappingURL=inventory.model.js.map
