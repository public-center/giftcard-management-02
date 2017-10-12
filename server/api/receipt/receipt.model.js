'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
import uuid from 'node-uuid';

/**
 * Receipt
 */
export const receiptSchema = {
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
  // Receipt ID
  receiptId: {
    type: String,
    default: uuid()
  },
  // Denial amount BEFORE the current receipt generated
  rejectionTotal: {type: Number, default: 0},
  // Receipt total
  total: {type: Number, default: 0},
  // Modified denial subtraction amount (does not subtract full buy amount from customer denials total)
  modifiedDenialAmount: Number,
  // Amount applied towards denials
  appliedTowardsDenials: {type: Number, required: true},
  // Grand total
  grandTotal: {type: Number, required: true},
  // Company/store
  company: {type: Schema.Types.ObjectId, ref: 'Company'},
  store: {type: Schema.Types.ObjectId, ref: 'Store'},
  // Inventories involved in this receipt
  inventories: [{type: Schema.Types.ObjectId, ref: 'Inventory'}],
  // Customer
  customer: {type: Schema.Types.ObjectId, ref: 'Customer'},
  // User creating record (cashier)
  user: {type: Schema.Types.ObjectId, ref: 'User'}
};

// Schema
const ReceiptSchema = new Schema(receiptSchema);

module.exports = mongoose.model('Receipt', ReceiptSchema);
