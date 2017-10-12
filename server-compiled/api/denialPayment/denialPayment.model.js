'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var DenialPaymentSchema = new Schema({
  // Payment amount
  amount: Number,
  /**
   * Created
   */
  created: {
    type: Date,
    default: Date.now
  },
  /**
   * User time when reconciliation was created
   */
  userTime: { type: Date },
  // Customer
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true }
});

module.exports = mongoose.model('DenialPayment', DenialPaymentSchema);
//# sourceMappingURL=denialPayment.model.js.map
