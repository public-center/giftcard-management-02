'use strict';

const mongoose = require('mongoose');
import createIndexes from '../../config/indexDb';
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  // Card number
  number: {
    type: String,
    required: true
  },
  // Pin
  pin: String,
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // User time when created (this is currently wrong. The timezone which is sent to the backend
  // is converted to UTC on saving to mongo, which renders this useless)
  userTime: {
    type: Date
  },
  balanceStatus: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(unchecked|deferred|received|bad|manual)$/.test(v);
      },
      message: 'Balance status must be "unchecked," "deferred," "bad", "received", or manual'
    }
  },
  // Whether a card is valid or not. Assumed to be valid until BI returns invalid
  valid: {
    type: Boolean,
    default: true
  },
  // LQ ID
  uid: String,
  // Customer name coming in from LQ
  lqCustomerName: String,
  // Retailer buy rate at the time of sale. This is not the actual buy rate, which can be overwritten on
  // intake.
  buyRate: {type: Number},
  // Buy amount
  buyAmount: Number,
  // Sell rate at time of card intake after company margins
  sellRate: {type: Number},
  // Balance
  balance: {type: Number},
  // Verified balance (now it's possible to get a verified balance on a card without an inventory), set to 0 for invalid cards
  verifiedBalance: {type: Number},
  // Updates
  updates: [{type: Schema.Types.ObjectId, ref: 'CardUpdate'}],
  // User adding the card
  user: [{type: Schema.Types.ObjectId, ref: 'User'}],
  // Customer selling the card
  customer: {type: Schema.Types.ObjectId, ref: 'Customer'},
  // Retailer
  retailer: {type: Schema.Types.ObjectId, ref: 'Retailer', required: true},
  // Inventory
  inventory: {type: Schema.Types.ObjectId, ref: 'Inventory'},
  // Store
  store: {type: Schema.Types.ObjectId, ref: 'Store'},
  // Company
  company: {type: Schema.Types.ObjectId, ref: 'Company'},
  // Whether this is a merchandise card or not. Defaults to false.
  merchandise: {type: Boolean, default: false},
});

// Indexes
const indexes = [
  // Unique inventory index
  [{inventory: 1}],
  // @todo
  [{number: 1, pin: 1, retailer: 1}, {name: 'inventory', unique: true}]
];
// @todo did not work
createIndexes(CardSchema, indexes);

CardSchema.methods.getLast4Digits = function () {
  return '****' + this.number.substring(this.number.length - 4);
};

CardSchema.statics = {
  /**
   * Get card with inventory
   * @param cardId
   * @return {Promise.<*|{path, model}>}
   */
  async getCardWithInventory(cardId) {
    return this.findById(cardId).populate('inventory');
  }
};

module.exports = mongoose.model('Card', CardSchema);
