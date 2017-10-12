'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
  // Card number
  number: {
    type: String,
    required: true
  },
  // Pin
  pin: String,
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // User time when created (this is currently wrong. The timezone which is sent to the backend
  // is converted to UTC on saving to mongo, which renders this useless)
  userTime: {
    type: Date
  },
  balanceStatus: {
    type: String,
    validate: {
      validator: function validator(v) {
        return (/^(unchecked|deferred|received|bad|manual)$/.test(v)
        );
      },
      message: 'Balance status must be "unchecked," "deferred," "bad", "received", or manual'
    }
  },
  // Whether a card is valid or not. Assumed to be valid until BI returns invalid
  valid: {
    type: Boolean,
    default: true
  },
  // LQ ID
  uid: String,
  // Customer name coming in from LQ
  lqCustomerName: String,
  // Retailer buy rate at the time of sale. This is not the actual buy rate, which can be overwritten on
  // intake.
  buyRate: { type: Number },
  // Buy amount
  buyAmount: Number,
  // Sell rate at time of card intake after company margins
  sellRate: { type: Number },
  // Balance
  balance: { type: Number },
  // Verified balance (now it's possible to get a verified balance on a card without an inventory), set to 0 for invalid cards
  verifiedBalance: { type: Number },
  // Updates
  updates: [{ type: Schema.Types.ObjectId, ref: 'CardUpdate' }],
  // User adding the card
  user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Customer selling the card
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  // Retailer
  retailer: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
  // Inventory
  inventory: { type: Schema.Types.ObjectId, ref: 'Inventory' },
  // Store
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Company
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  // Whether this is a merchandise card or not. Defaults to false.
  merchandise: { type: Boolean, default: false }
});

// Indexes
var indexes = [
// Unique inventory index
[{ inventory: 1 }],
// @todo
[{ number: 1, pin: 1, retailer: 1 }, { name: 'inventory', unique: true }]];
// @todo did not work
(0, _indexDb2.default)(CardSchema, indexes);

CardSchema.methods.getLast4Digits = function () {
  return '****' + this.number.substring(this.number.length - 4);
};

CardSchema.statics = {
  /**
   * Get card with inventory
   * @param cardId
   * @return {Promise.<*|{path, model}>}
   */
  getCardWithInventory: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cardId) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', this.findById(cardId).populate('inventory'));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function getCardWithInventory(_x) {
      return _ref.apply(this, arguments);
    }

    return getCardWithInventory;
  }()
};

module.exports = mongoose.model('Card', CardSchema);
//# sourceMappingURL=card.model.js.map
