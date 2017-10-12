'use strict';

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _validation = require('../../helpers/validation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var CompanySettingsSchema = new Schema({
  // Managers only allowed to set buy rates
  managersSetBuyRates: { type: Boolean, default: false },
  // Auto-set buy rates based on sell-rates
  autoSetBuyRates: { type: Boolean, default: false },
  // Employees can see buy rates
  employeesCanSeeSellRates: { type: Boolean, default: false },
  // Auto-sell cards which are put in inventory
  autoSell: { type: Boolean, default: true },
  // Company margin
  margin: { type: Number, default: 0.03, min: 0, max: 1 },
  // Minimum adjusted denial amount allowed to take on a sale
  // So, if a customer owes 500 and this is set to 10%, the adjusted buy amount cannot be set less than $50
  minimumAdjustedDenialAmount: { type: Number, default: 0.1, min: 0, max: 1 },

  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  // Company
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  // Auto buy rates
  autoBuyRates: { type: Schema.Types.ObjectId, ref: 'AutoBuyRate' },
  // Card type
  cardType: { type: String, enum: ['electronic', 'physical', 'both'], default: 'both', get: convertToLowerCase, set: convertToLowerCase },
  // BI only
  biOnly: { type: Boolean, default: false },
  // Must include information on customer when creating (address, phone, etc)
  customerDataRequired: { type: Boolean, default: true },
  // Use alternate GCMGR
  useAlternateGCMGR: { type: Boolean, default: false },
  // Service fee
  serviceFee: { type: Number, get: defaultServiceFee, set: setServiceFee },
  // Callback url for once a VB has been retrieved for a card
  callbackUrl: String,
  // Timezone
  timezone: { type: String, get: getTimezone }
});

// Updated time
CompanySettingsSchema.pre('save', function (next) {
  this.updated = new Date();
  next();
});

/**
 * Make sure that margin and service fee are decimals
 */
CompanySettingsSchema.pre('validate', function (next) {
  _validation.ensureDecimals.call(this, next, ['margin', 'serviceFee'], { margin: 0.1 });
});

CompanySettingsSchema.methods = {
  /**
   * Get auto-buy settings, or create a new one
   */
  getAutoBuyRates: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var dbBuyRates;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.model('AutoBuyRate').findOne({ settings: this._id });

            case 2:
              dbBuyRates = _context.sent;

              if (dbBuyRates) {
                _context.next = 10;
                break;
              }

              _context.next = 6;
              return this.model('AutoBuyRate').create({ settings: this._id });

            case 6:
              dbBuyRates = _context.sent;

              this.autoBuyRates = dbBuyRates._id;
              this.save();
              return _context.abrupt('return', dbBuyRates);

            case 10:
              return _context.abrupt('return', dbBuyRates);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function getAutoBuyRates() {
      return _ref.apply(this, arguments);
    }

    return getAutoBuyRates;
  }()
};

/**
 * Default to 0.0075 for service fee, unless set
 * @param serviceFee
 * @return {*}
 */
function defaultServiceFee(serviceFee) {
  if (!serviceFee) {
    return _environment2.default.serviceFee;
  }
  return serviceFee;
}
function setServiceFee(serviceFee) {
  return serviceFee;
}

// Make sure whatever is returned is lowercase
function convertToLowerCase(whatever) {
  if (whatever) {
    return whatever.toLowerCase();
  }
}

function getTimezone(timezone) {
  if (timezone) {
    return timezone;
  }

  return 'America/Los_Angeles';
}

CompanySettingsSchema.set('toJSON', { getters: true });
CompanySettingsSchema.set('toObject', { getters: true });

module.exports = mongoose.model('CompanySettings', CompanySettingsSchema);
//# sourceMappingURL=companySettings.model.js.map
