'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

import createIndexes from '../../config/indexDb';
import {eightWeeks} from '../../config/environment';

const CallbackLog = new Schema({
  created: {type: Date, default: Date.now},
  // Callback type
  callbackType: {type: String, required: true},
  // Card number
  number: {type: String, required: true},
  // Card pin
  pin: String,
  // Claimed balance
  claimedBalance: Number,
  // Verified balance
  verifiedBalance: Number,
  // Amount CQ paid before fees and margin
  cqPaid: Number,
  // Amount CQ paid after fees and margin
  netPayout: Number,
  // Card prefix
  prefix: String,
  // CQ ACH number
  cqAch: String,
  // Whether a card has been finalized
  finalized: {type: Boolean, required: true, default: false},
  // Whether there was a success or failure
  success: {type: Boolean, required: true, default: true},
  // Fail response from the remote server if we encounter an error
  failResponse: String,
  // Callback URL
  url: {type: String, required: true},
  // Response status code
  statusCode: {type: Number, required: true},
  /**
   * References
   */
  // Card
  card: {type: Schema.Types.ObjectId, ref: 'Card'},
  // Company making the callback request
  company: {type: Schema.Types.ObjectId, ref: 'Company'},
});

// Indexes
const indexes = [
  // Expire logs after two weeks
  [{created: 1}, {expireAfterSeconds: eightWeeks}],
  [{company: 1}]
];
createIndexes(CallbackLog, indexes);

CallbackLog.set('toJSON', {
  virtuals: true, getters: true
});

module.exports = mongoose.model('CallbackLog', CallbackLog);
