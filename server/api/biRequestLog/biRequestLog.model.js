'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

import createIndexes from '../../config/indexDb';

const BiRequestLogSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // Card pin
  pin: String,
  // Card number
  number: String,
  // Retailer ID
  retailerId: {type: Schema.Types.ObjectId, ref: 'Retailer'},
  // Card ID
  card: {type: Schema.Types.ObjectId, ref: 'Card'},
  /**
   * BI response
   */
  verificationType: {type: String, default: null},
  responseDateTime: {type: String, default: null},
  requestId: {type: String, default: null},
  responseCode: {type: String, default: null},
  balance: {type: Number, default: null},
  responseMessage: {type: String, default: null},
  recheckDateTime: {type: String, default: null},
  recheck: {type: String, default: null},
  // Finalized
  finalized: {type: Boolean, default: false},
  // Updated after finalized
  fixed: {type: Boolean, default: false},
  // Prefix for vista
  prefix: String,

  // TEMP
  note: String,
  // User that initiated the callback
  user: {type: Schema.Types.ObjectId, ref: 'User'},
});

// @todo Enable me after cleaning up the DB
// // Indexes
const indexes = [
  [{number: 1, pin: 1, retailerId: 1, balance: 1}],
];
createIndexes(BiRequestLogSchema, indexes);

BiRequestLogSchema.methods.getLast4Digits = function () {
  return '****' + this.number.substring(this.number.length - 4);
};

module.exports = mongoose.model('BiRequestLog', BiRequestLogSchema);
