const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
import createIndexes from '../../config/indexDb';
const Schema = mongoose.Schema;

import {smpIds} from '../../config/environment';
import {formatFloat} from '../../helpers/number';


export const inventorySchemaObject = {
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
  type: {type: String, get: convertToLowerCase, set: convertToLowerCase},
  // Transaction status (pending, shipped, paid, denied)
  status: String,
  // Notes added in activity
  adminActivityNote: String,
  // Liquidation status message
  status_message: {type: String},
  // The amount that CQ receives from the SMP for the sale of a card
  liquidationSoldFor: {type: Number},
  // Rate returned from liquidation API (Without margin)
  liquidationRate: {type: Number},
  // Rate at purchase (without margin included)
  sellRateAtPurchase: Number,
  // Disable adding to liquidation
  disableAddToLiquidation: {type: String},
  // Margin at time of adding to liquidation
  margin: {type: Number, default: 0.03, min: 0, max: 1},
  // Service fee at time of transaction
  serviceFee: {type: Number, default: 0.0075, min: 0, max: 1},
  // User timezone offset
  tzOffset: String,
  // Rejected
  rejected: {type: Boolean, default: false},
  // Rejected date
  rejectedDate: Date,
  // Reject amount
  rejectAmount: Number,
  // Credited
  credited: {type: Boolean, default: false},
  // Credited date
  creditedDate: Date,
  // Credit amount
  creditAmount: Number,
  /**
   * LQ interactions
   */
  // Proceed with sale is set to false when auto-sell is turned off, and requires an admin to approve the sale
  proceedWithSale: {type: Boolean, default: true},
  // Sold via liquidation
  soldToLiquidation: {type: Boolean, default: false},
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
    selling: {type: Boolean},
    // SaveYa verification
    confirmed: {type: Boolean, default: false},
    // Save ya rejected
    rejected: {type: Boolean, default: false},
    // Saveya reject reason
    rejectReason: String,
    // SaveYa returned balance
    balance: {type: Number},
    // SaveYa rate
    saveYaRate: {type: Number},
    // SaveYa status (can set if not confirmed)
    saveYaStatus: {type: String},
    // Under review by SY
    underReview: {type: Boolean, default: false},
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
  verifiedBalance: {type: Number, get: defaultsToBalance, default: null},
  // Verified balance has been received
  hasVerifiedBalance: {type: Boolean, default: false},
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
  systemTime: {type: Date, default: Date.now},

  // Card is invalid, set either by an admin or by BI response
  valid: Boolean,

  // Deduction number
  deduction: String,
  // Process lock
  locked: {type: Boolean, default: false},
  // Merchandise
  merchandise: {type: Boolean, default: false},
  /**
   * Vista data
   */
  isTransaction: {type: Boolean, default: false},
  // Transaction data
  transaction: {
    // can be set to whatever they want
    memo: String,
    // verifiedBalance * retailer.creditValuePercentage - amount spent
    nccCardValue: {
      type: Number,
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
    reserve: {type: Schema.Types.ObjectId, ref: 'Reserve'},
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
  changed: {type: Boolean, default: true},
  // Is sold via LQ API
  isApi: {type: Boolean, default: false},
  /**
   * Relations
   */
  // User checking the card
  customer: {type: Schema.Types.ObjectId, ref: 'Customer'},
  // Retailer
  retailer: {type: Schema.Types.ObjectId, ref: 'Retailer'},
  // Store
  store: {type: Schema.Types.ObjectId, ref: 'Store'},
  // Company
  company: {type: Schema.Types.ObjectId, ref: 'Company'},
  // Liquidation error
  liquidationError: [{type: Schema.Types.ObjectId, ref: 'LiquidationError'}],
  // Card
  card: {type: Schema.Types.ObjectId, ref: 'Card', required: true},
  // User
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  // Reconciliation
  reconciliation: {type: Schema.Types.ObjectId, ref: 'Reconciliation'},
  // Batch
  batch: {type: Schema.Types.ObjectId, ref: 'Batch'},
  // Receipt
  receipt: {type: Schema.Types.ObjectId, ref: 'Receipt'}
};

// Schema
const InventorySchema = new Schema(inventorySchemaObject);

// Indexes
const indexes = [
  // Unique card index
  [{card: 1}, {name: 'card', unique: true}],
  [{soldToLiquidation: 1, proceedWithSale: 1, disableAddToLiquidation: 1, type: 1, locked: 1, isTransaction: 1}],
];
createIndexes(InventorySchema, indexes);

// Static methods
InventorySchema.statics = {
  /**
   * Cache inventory values
   * @param inventory
   */
  cacheInventoryValues: async function (inventory) {
    const companyMargin = isNaN(inventory.companyMargin) ? 0 : inventory.companyMargin;
    const cache = new (this.model('InventoryCache'))({
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
    return cache.save();
  },
  /**
   * Get reserve amount for a card
   * @param balance Claimed or verified balance
   * @param reserveRate Reserve rate
   * @return {Number}
   */
  getReserveAmount(balance, reserveRate) {
    return formatFloat(balance * reserveRate);
  },
  /**
   * Get CQ paid amount
   * @param balance Claimed or VB
   * @param rateAfterMargin LQ rate minus margin
   * @return {number}
   */
  getCqPaid(balance, rateAfterMargin) {
    return formatFloat(balance * rateAfterMargin);
  },
  /**
   * Determine if we have valid calculated values for this inventory
   */
  getCalculatedValues: async function getValues(inventory) {
    return new Promise(async (resolve) => {
      const changed = inventory.changed;
      // See if we have calculated values
      const cache = await (this.model('InventoryCache')).findOne({inventory: inventory._id});
      // No cache
      if (!cache) {
        return resolve(null);
      }
      // Unchanged, so calculate
      if (!changed) {
        return resolve(cache);
      } else {
        cache.remove()
        .then(() => resolve(null))
        .catch(err => {
          console.log('**************ERR REMOVING CACHE**********');
          console.log(err);
          resolve(null);
        })
      }
    });
  },
  /**
   * Add new reserve to a company or store set of reserves
   * @param model Company or Store model
   * @param reserve Incoming reserve
   * @return {Promise.<void>}
   */
  async addReserveToSet(model, reserve) {
    const reserveId = reserve._id;
    if (model.reserves.map(r => r.toString()).indexOf(reserveId) === -1) {
      model.reserves.push(reserveId);
      model.reserveTotal = model.reserveTotal + reserve.amount;
      await model.save();
    }
  },
  /**
   * Store an error log item if we cannot find a reference that should exist
   * @param modelType
   * @return {Promise.<*>}
   */
  async addToRelatedErrorLog(modelType) {
    return await this.model('Log').create({
      path: 'runDefers/completeTransactions/addToRelatedReserveRecords',
      params: reserve,
      isError: true,
      statusMessage: `Unable to retrieve ${modelType}`
    });
  },
  /**
   * Add reserve values to store, company, and inventory
   * @return {Promise.<void>}
   */
  async addToRelatedReserveRecords(reserve) {
    const company = await this.model('Company').findById(reserve.company);
    // Cannot find company
    if (!company) {
      return await this.addToRelatedErrorLog('company')
    }
    // Add this reserve to the set if it doesn't exist
    await this.addReserveToSet(company, reserve);
    // Update store
    const store = await (this.model('Store')).findById(reserve.store);
    if (!company) {
      return await this.addToRelatedErrorLog('store');
    }
    await this.addReserveToSet(store, reserve);
    // Update inventory
    await this.update({_id: reserve.inventory}, {
      $set: {'transaction.reserve': reserve._id, 'transaction.reserveAmount': reserve.amount}
    });
  }
};

InventorySchema.methods = {
  // Retrieve card associated with inventory
  getCard: function () {
    return (this.model('Card')).findOne({inventory: this._id});
  },
  getCallbackUrl: async function () {
    if (this.callbackUrl) {
      return Promise.resolve(this.callbackUrl);
    }

    return (this.model('Store')).findOne({_id: this.store})
    .then(store => {
      if (store.callbackUrl) {
        return Promise.resolve(store.callbackUrl);
      }

      return (this.model('CompanySettings')).findOne({company: this.company})
      .then(settings => {
        return Promise.resolve(settings.callbackUrl);
      });
    });
  },
  /**
   * Get transaction values
   * @param reserveAmount Reserve amount
   * @param cqPaid The amount CQ is paying for the card
   * @param balance Claimed or VB
   * @return {InventorySchema.methods}
   */
  getTransactionValues(reserveAmount, cqPaid, balance) {
    this.transaction.cqWithheld = formatFloat(this.transaction.serviceFee + reserveAmount);
    this.transaction.netPayout = formatFloat((balance * (this.liquidationRate - this.margin)) - this.transaction.cqWithheld);
    this.transaction.cqPaid = cqPaid;
    this.cqPaid = cqPaid;
    return this;
  },
  /**
   * Create a reserve for a transaction
   * @return {Promise.<*>}
   */
  async createReserve() {
    const company = this.company._id ? this.company._id : this.company;
    const reserve = new (this.model('Reserve'))({
      inventory: this._id,
      amount: this.transaction.reserveAmount,
      company,
      store: this.store
    });
    return reserve.save();
  },
  /**
   * Mongodb params for removing previously set reserves
   * @param reserve
   * @return {{$pull: {reserves: *}, set: {reserveTotal: *}}}
   */
  undoReserveValues(reserve) {
    return {
      $pull: {
        reserves: reserve._id
      },
      $inc: {reserveTotal: reserve.amount * -1}
    }
  },
  /**
   * Remove a reserve from a transaction
   * @return {Promise.<void>}
   */
  async removeReserve() {
    return new Promise(async resolve => {
      try {
        const reserveId = this.transaction.reserve;
        // Remove a reserve from an inventory, company, and store so it can be recalculated
        if (this.transaction.reserve) {
          const reserve = await (this.model('Reserve')).findById(this.transaction.reserve);
          if (reserve) {
            await (this.model('Reserve')).remove({_id: reserve._id});
            // Find company and store with this reserve
            const company = await (this.model('Company')).findOne({reserves: reserve._id});
            const store = await (this.model('Store')).findOne({reserves: reserve._id});
            const inventory = await this.constructor.findById(this._id);
            // Undo company, store, and inventory for this reserve
            if (company) {
              await (this.model('Company')).update({_id: company._id}, this.undoReserveValues(reserve));
            }
            if (store) {
              await (this.model('Store')).update({_id: store._id}, this.undoReserveValues(reserve));
            }
            if (inventory) {
              await this.constructor.update({_id: this._id}, {
                $set: {
                  'transaction.reserve': null,
                  'transaction.reserveAmount': 0
                }
              });
            }
            // Remove this reserve
            await (this.model('Reserve')).remove({_id: reserveId});
          }
        }

        resolve(null);
      } catch (e) {
        console.log('**************ERR IN REMOVE RESERVE**********');
        console.log(e);
        console.log(e.stack);
      }
    });
  }
};

// Set number for SMP
InventorySchema.pre('save', function(next) {
  if (typeof this.smp !== 'undefined' && [smpIds.SAVEYA, smpIds.CARDCASH, smpIds.CARDPOOL, smpIds.GIFTCARDZEN].indexOf(this.smp) === -1) {
    const setSmp = parseInt(this.smp);
    // Change to int
    if (isNaN(setSmp)) {
      if (this.smp && [smpIds.SAVEYA, smpIds.CARDCASH, smpIds.CARDPOOL, smpIds.GIFTCARDZEN].indexOf(this.smp) === -1) {
        const smp = smpIds[this.smp.toUpperCase()];
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
  try {
    this.constructor.findById(this._id)
    .then(oldInventory => {
      if (!oldInventory) {
        this.changed = true;
      } else {
        // If anything has changed, set as changed
        const current = this.toObject();
        const old = oldInventory.toObject();
        delete old.changed;
        delete current.changed;
        if (JSON.stringify(current) !== JSON.stringify(old)) {
          this.changed = true;
        }
      }
      next();
    })
    .catch(err => {
      this.changed = true;
      next();
    })
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
    return verifiedBalance
  }
  const claimedBalance = this.balance;
  // Use CB for VB if cqAch is set and VB is not set
  if (this.cqAch) {
    return claimedBalance
  }
  // Use claimed balance if sent to SMP or received by SMP and VB is unavailable
  if (this.activityStatus) {
    const useClaimedIfNoVb = ['sentToSmp', 'receivedSmp'].indexOf(this.activityStatus) > -1;
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

InventorySchema.set('toJSON', {getters: true});
InventorySchema.set('toObject', {getters: true});

module.exports = mongoose.model('Inventory', InventorySchema);
