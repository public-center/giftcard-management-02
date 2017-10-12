'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const LiquidationErrorModel = new Schema({
  // Inventory ID
  inventory: {type: Schema.Types.ObjectId, ref: 'Inventory', required: true},
  // Liquidation error
  errorText: String,
  // When the error occurred OneOf(saving, rate, sell, confirm)
  type: {type: String, required: true},
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LiquidationError', LiquidationErrorModel);
