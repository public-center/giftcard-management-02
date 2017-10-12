'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const InventoryCache = new Schema({
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // LQ rate after margin applied
  rateAfterMargin: Number,
  // Service fee
  serviceFee: Number,
  // Margin for company
  companyMargin: Number,
  // Margin displayed in activity
  displayMargin: Number,
  // Rate displayed for company
  companyDisplaySellRate: Number,
  // Activity status displayed for company activity view
  companyActivityStatus: String,
  // Buy amount after rejection
  adjustedBuyAmountAfterRejection: Number,
  // Amount owed on a rejection
  amountOwed: Number,
  // Amount CQ paid
  cqPaid: Number,
  // Net amount
  netAmount: Number,
  // Corporate displayed rate for this inventory (after margin)
  corpRateThisInventory: Number,
  // Inventory
  inventory: {type: Schema.Types.ObjectId, ref: 'Inventory'},
});

module.exports = mongoose.model('InventoryCache', InventoryCache);
