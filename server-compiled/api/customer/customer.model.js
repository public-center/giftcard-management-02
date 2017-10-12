'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
  // First name
  firstName: {
    type: String,
    required: true
  },
  // last name
  lastName: {
    type: String,
    required: true
  },
  middleName: String,
  fullName: {
    type: String
  },
  // State ID, such as driver's license
  stateId: {
    type: String,
    required: true
  },
  address1: {
    type: String,
    required: true
  },
  address2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  // System ID, used internally at stores
  systemId: String,
  created: {
    type: Date,
    default: Date.now
  },
  // Rejection total
  rejectionTotal: {
    type: Number, default: 0
  },
  // Whether customer is active
  enabled: { type: Boolean, default: true, get: function get(enabled) {
      return !!enabled;
    } },
  // Company on which this customer was created
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  // Store relationship
  store: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
  // Edits
  edits: [{ type: Schema.Types.ObjectId, ref: 'CustomerEdit' }],
  // Rejected inventories
  rejections: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
  // Credited inventories
  credits: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
  // Email address
  email: String
});

// Indexes
var indexes = [[{ fullName: 1 }], [{ stateId: 1 }], [{ phone: 1 }], [{ systemId: 1 }], [{ company: 1 }], [{ address1: 1 }], [{ city: 1 }], [{ state: 1 }]];
(0, _indexDb2.default)(CustomerSchema, indexes);

/**
 * Validations
 */

// Validate empty name
CustomerSchema.path('firstName').validate(function (name) {
  return name.length;
}, 'First name cannot be blank');

CustomerSchema.path('lastName').validate(function (name) {
  return name.length;
}, 'Last name cannot be blank');

// Validate duplicate names
CustomerSchema.path('email').validate(function (email, respond) {
  var _this = this;

  this.constructor.findOne({
    email: email,
    company: this.company,
    store: this.store
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
}, 'Email is already taken');

/**
 * Create full name on save
 */
CustomerSchema.pre('save', function (next) {
  this.fullName = '' + this.firstName + (this.middleName ? ' ' + this.middleName + ' ' : ' ') + this.lastName;
  next();
});

CustomerSchema.set('toJSON', {
  virtuals: true, getters: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
//# sourceMappingURL=customer.model.js.map
