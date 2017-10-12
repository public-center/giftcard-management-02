'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.receiptSchema = undefined;

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;


/**
 * Receipt
 */
var receiptSchema = exports.receiptSchema = {
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
    default: (0, _nodeUuid2.default)()
  },
  // Denial amount BEFORE the current receipt generated
  rejectionTotal: { type: Number, default: 0 },
  // Receipt total
  total: { type: Number, default: 0 },
  // Modified denial subtraction amount (does not subtract full buy amount from customer denials total)
  modifiedDenialAmount: Number,
  // Amount applied towards denials
  appliedTowardsDenials: { type: Number, required: true },
  // Grand total
  grandTotal: { type: Number, required: true },
  // Company/store
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Inventories involved in this receipt
  inventories: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
  // Customer
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  // User creating record (cashier)
  user: { type: Schema.Types.ObjectId, ref: 'User' }
};

// Schema
var ReceiptSchema = new Schema(receiptSchema);

module.exports = mongoose.model('Receipt', ReceiptSchema);
//# sourceMappingURL=receipt.model.js.map
