'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

var _runDefers = require('../deferredBalanceInquiries/runDefers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;


var CompanySchema = new Schema({
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
  // Company URL
  url: String,
  created: {
    type: Date,
    default: Date.now
  },
  apis: {
    bi: { type: Boolean, default: false },
    lq: { type: Boolean, default: false },
    dgc: { type: Boolean, default: false }
  },
  // Disabled retailers
  disabledRetailers: [],
  // Company users
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Stores
  stores: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
  // Company settings
  settings: { type: Schema.Types.ObjectId, ref: 'CompanySettings' },
  // Tango ID
  cardBuyId: String,
  // Card buy
  cardBuyCustomerId: String,
  // CC id
  cardBuyCcId: String,
  // Reserve total
  reserveTotal: { type: Number, default: 0, get: function get(total) {
      if (!total) {
        return 0;
      }
      return total;
    } },
  // Bookkeeping emails
  bookkeepingEmails: { type: String, get: function get(emails) {
      return emails || '';
    } },
  // Reserves
  reserves: [{ type: Schema.Types.ObjectId, ref: 'Reserve' }]
});

// Indexes
var indexes = [[{ name: 1 }], [{ reserves: 1 }]];
(0, _indexDb2.default)(CompanySchema, indexes);

/**
 * Validations
 */

// Validate empty name
CompanySchema.path('name').validate(function (name) {
  return name.length;
}, 'Company name cannot be blank');

// Validate duplicate names
CompanySchema.path('name').validate(function (name, respond) {
  var _this = this;

  this.constructor.findOne({ name: name }, function (err, company) {
    if (err) {
      throw err;
    }
    if (company) {
      if (_this.id === company.id) {
        return respond(true);
      }
      return respond(false);
    }
    respond(true);
  });
}, 'Company name is already taken');

/**
 * Retrieve settings for a company
 * @param returnPlainObject Return a plain object with company settings rather than a Mongoose model
 */
CompanySchema.methods.getSettings = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var returnPlainObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  var settings, autoBuyRates, _autoBuyRates;

  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          settings = void 0;
          _context.next = 3;
          return this.model('CompanySettings').findOne({ company: this._id });

        case 3:
          settings = _context.sent;

          if (settings) {
            _context.next = 18;
            break;
          }

          settings = new (this.model('CompanySettings'))({
            company: this._id
          });
          _context.next = 8;
          return settings.save();

        case 8:
          settings = _context.sent;

          this.settings = settings._id;
          this.save();
          _context.next = 13;
          return settings.getAutoBuyRates();

        case 13:
          autoBuyRates = _context.sent;

          settings = settings.toObject();
          settings.autoBuyRates = autoBuyRates;
          // Return settings
          _context.next = 24;
          break;

        case 18:
          settings.customerDataRequired = typeof settings.customerDataRequired === 'undefined' ? true : settings.customerDataRequired;
          _context.next = 21;
          return settings.getAutoBuyRates();

        case 21:
          _autoBuyRates = _context.sent;

          settings = settings.toObject();
          settings.autoBuyRates = _autoBuyRates;

        case 24:
          if (!returnPlainObject) {
            _context.next = 28;
            break;
          }

          return _context.abrupt('return', settings);

        case 28:
          _context.next = 30;
          return this.model('CompanySettings').findOne({ company: this._id }).populate({
            path: 'settings',
            populate: {
              path: 'autoBuyRates',
              model: 'AutoBuyRate'
            }
          });

        case 30:
          return _context.abrupt('return', _context.sent);

        case 31:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

/**
 * Get settings as mongoose object
 * @returns {Promise}
 */
CompanySchema.methods.getSettingsObject = function () {
  var _this2 = this;

  return new Promise(function (resolve) {
    var settings = void 0;
    // Get company settings
    _this2.model('CompanySettings').findOne({ company: _this2._id }, function (err, dbSettings) {
      settings = dbSettings;
      // If no settings, create a new one
      if (!dbSettings) {
        new Settings({
          company: _this2._id
        }).save(function (err, dbSettings) {
          settings = dbSettings;
          _this2.settings = dbSettings._id;
          _this2.save();
          return resolve(settings);
        });
        // Return settings
      } else {
        settings.customerDataRequired = typeof settings.customerDataRequired === 'undefined' ? true : settings.customerDataRequired;
      }
      resolve(settings);
    });
  });
};

/**
 * Retrieve company margin
 */
CompanySchema.methods.getMargin = function () {
  var thisMargin = void 0;
  try {
    thisMargin = this.settings.margin;
  } catch (e) {
    thisMargin = _runDefers.defaultMargin;
  }
  return thisMargin;
};

CompanySchema.set('toJSON', { getters: true });
CompanySchema.set('toObject', { getters: true });

module.exports = mongoose.model('Company', CompanySchema);
//# sourceMappingURL=company.model.js.map
