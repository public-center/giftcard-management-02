'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var BiRequestLogSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // Card pin
  pin: String,
  // Card number
  number: String,
  // Retailer ID
  retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer' },
  // Card ID
  card: { type: Schema.Types.ObjectId, ref: 'Card' },
  /**
   * BI response
   */
  verificationType: { type: String, default: null },
  responseDateTime: { type: String, default: null },
  requestId: { type: String, default: null },
  responseCode: { type: String, default: null },
  balance: { type: Number, default: null },
  responseMessage: { type: String, default: null },
  recheckDateTime: { type: String, default: null },
  recheck: { type: String, default: null },
  // Finalized
  finalized: { type: Boolean, default: false },
  // Updated after finalized
  fixed: { type: Boolean, default: false },
  // Prefix for vista
  prefix: String,

  // TEMP
  note: String,
  // User that initiated the callback
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

// @todo Enable me after cleaning up the DB
// // Indexes
var indexes = [[{ number: 1, pin: 1, retailerId: 1, balance: 1 }]];
(0, _indexDb2.default)(BiRequestLogSchema, indexes);

BiRequestLogSchema.methods.getLast4Digits = function () {
  return '****' + this.number.substring(this.number.length - 4);
};

module.exports = mongoose.model('BiRequestLog', BiRequestLogSchema);
//# sourceMappingURL=biRequestLog.model.js.map
