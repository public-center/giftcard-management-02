'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

var _environment = require('../../config/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var CallbackLog = new Schema({
  created: { type: Date, default: Date.now },
  // Callback type
  callbackType: { type: String, required: true },
  // Card number
  number: { type: String, required: true },
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
  finalized: { type: Boolean, required: true, default: false },
  // Whether there was a success or failure
  success: { type: Boolean, required: true, default: true },
  // Fail response from the remote server if we encounter an error
  failResponse: String,
  // Callback URL
  url: { type: String, required: true },
  // Response status code
  statusCode: { type: Number, required: true },
  /**
   * References
   */
  // Card
  card: { type: Schema.Types.ObjectId, ref: 'Card' },
  // Company making the callback request
  company: { type: Schema.Types.ObjectId, ref: 'Company' }
});

// Indexes
var indexes = [
// Expire logs after two weeks
[{ created: 1 }, { expireAfterSeconds: _environment.eightWeeks }], [{ company: 1 }]];
(0, _indexDb2.default)(CallbackLog, indexes);

CallbackLog.set('toJSON', {
  virtuals: true, getters: true
});

module.exports = mongoose.model('CallbackLog', CallbackLog);
//# sourceMappingURL=callbackLog.model.js.map
