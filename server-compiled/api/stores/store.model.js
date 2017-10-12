'use strict';

var _validation = require('../../helpers/validation');

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;


var StoreSchema = new Schema({
  // Company name
  name: {
    type: String,
    required: true
  },
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  created: {
    type: Date,
    default: Date.now
  },
  // The last time a store was reconciled
  reconciledTime: Date,
  // The last time a store closed a reconciliation for shipment
  reconcileCompleteTime: Date,
  // Credit value percentage
  creditValuePercentage: { type: Number, default: 1.1 },
  // Maximum spending in total transaction
  maxSpending: { type: Number, default: 30, get: function get(spend) {
      return typeof spend !== 'number' ? 30 : spend;
    } },
  // Payout percentage
  payoutAmountPercentage: { type: Number, default: 0.5 },
  // Reserve total
  reserveTotal: { type: Number, default: 0, get: function get(total) {
      if (!total) {
        return 0;
      }
      return total;
    } },
  /**
   * References
   */
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  // Company users
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Buy rate relations
  buyRateRelations: [{ type: Schema.Types.ObjectId, ref: 'BuyRate' }],
  // Reserves
  reserves: [{ type: Schema.Types.ObjectId, ref: 'Reserve' }],
  // Verified balance received callback URL
  callbackUrl: String
});

// Indexes
var indexes = [[{ name: 1 }], [{ companyId: 1 }]];
(0, _indexDb2.default)(StoreSchema, indexes);

/**
 * Validations
 */

// Validate empty name
StoreSchema.path('name').validate(function (name) {
  return name.length;
}, 'Store name cannot be blank');

// Validate duplicate names
StoreSchema.path('name').validate(function (name, respond) {
  var _this = this;

  this.constructor.findOne({
    name: name,
    companyId: this.companyId
  }, function (err, store) {
    if (err) {
      throw err;
    }
    if (store) {
      if (_this.id === store.id) {
        return respond(true);
      }
      return respond(false);
    }
    respond(true);
  });
}, 'Store name is already taken');

/**
 * Make sure that margin and service fee are decimals
 */
StoreSchema.pre('validate', function (next) {
  _validation.ensureDecimals.call(this, next, ['payoutAmountPercentage', 'creditValuePercentage'], { creditValuePercentage: 2 });
});

// Return virtuals
StoreSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Store', StoreSchema);
//# sourceMappingURL=store.model.js.map
