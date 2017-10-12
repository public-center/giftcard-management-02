'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

/**
 * Keep reference to deferred balance inquiries
 */
var DeferredBalanceInquirySchema = new Schema({
  // Card
  card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  // The number of checks that have been performed already for this request
  queryCount: { type: Number, required: true, default: 1 },
  // Request ID
  requestId: String,
  // Last run time
  lastRunTime: {
    type: Date,
    default: Date.now
  },
  // If valid
  valid: {
    type: Boolean,
    default: true
  },
  // BI completed
  completed: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeferredBalanceInquiry', DeferredBalanceInquirySchema);
//# sourceMappingURL=deferredBalanceInquiries.model.js.map
