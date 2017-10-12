'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INVALID = exports.GIFTCARDZEN = exports.EMPLOYEE = exports.RAISE = exports.GIFTCARDRESCUE = exports.CARDPOOL = exports.CARDCASH = exports.SAVEYA = undefined;

var _smpNames, _disabledSmps;

var _systemSettings = require('../../api/systemSettings/systemSettings.model');

var _systemSettings2 = _interopRequireDefault(_systemSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var path = require('path');
var _ = require('lodash');
var envJson = require('../../../env.json');

// Set session secret
process.env.secret = envJson['session-secret'];

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// SMP codes
var SAVEYA = exports.SAVEYA = '1';
var CARDCASH = exports.CARDCASH = '2';
var CARDPOOL = exports.CARDPOOL = '3';
var GIFTCARDRESCUE = exports.GIFTCARDRESCUE = '4';
var RAISE = exports.RAISE = '5';
var EMPLOYEE = exports.EMPLOYEE = '6';
var GIFTCARDZEN = exports.GIFTCARDZEN = '7';
var INVALID = exports.INVALID = '0';

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,
  isStaging: process.env.IS_STAGING === 'true',
  debug: true,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.secret
  },

  // List of user roles
  userRoles: ['guest', 'employee', 'manager', 'corporate-admin', 'admin'],

  // Test server which simply echoes back the current IP. Used this for testing when you expect an http reques to be made
  testServer: 'http://httpbin.org/ip',

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  smpIds: {
    INVALID: INVALID,
    SAVEYA: SAVEYA,
    CARDCASH: CARDCASH,
    CARDPOOL: CARDPOOL,
    GIFTCARDRESCUE: GIFTCARDRESCUE,
    RAISE: RAISE,
    EMPLOYEE: EMPLOYEE,
    GIFTCARDZEN: GIFTCARDZEN
  },

  // Availabile SMPs
  smpNames: (_smpNames = {}, _defineProperty(_smpNames, INVALID, 'invalid'), _defineProperty(_smpNames, SAVEYA, 'saveya'), _defineProperty(_smpNames, CARDCASH, 'cardcash'), _defineProperty(_smpNames, GIFTCARDRESCUE, 'giftcardrescue'), _defineProperty(_smpNames, CARDPOOL, 'cardpool'), _defineProperty(_smpNames, RAISE, 'raise'), _defineProperty(_smpNames, EMPLOYEE, 'employee'), _defineProperty(_smpNames, GIFTCARDZEN, 'giftcardzen'), _smpNames),

  // Disabled SMPs

  disabledSmps: (_disabledSmps = {}, _defineProperty(_disabledSmps, INVALID, 'invalid'), _defineProperty(_disabledSmps, SAVEYA, 'saveya'), _defineProperty(_disabledSmps, GIFTCARDRESCUE, 'giftcardrescue'), _defineProperty(_disabledSmps, RAISE, 'raise'), _defineProperty(_disabledSmps, EMPLOYEE, 'employee'), _disabledSmps),

  // Retailers which don't need PIN codes
  retailersNoPin: {
    '5668fbff37226093139b9214': true
  },

  // CQ service fee
  serviceFee: 0.0075,
  // CQ margin
  margin: 0.03,
  // Reserve rate
  reserveRate: 0.05,

  // Two weeks in seconds
  twoWeeks: 1209600,
  // Two months in seconds
  eightWeeks: 4838400,

  // Sendgrid API key
  sgToken: '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',
  // BI callback key
  biCallbackKeyHeader: 'x-bi-key-Geqwcak52dgwjh',
  biCallbackKey: 'Lr9Aff32M9bGp9XKAFqBSzxtu385ioZLKiMz2be3Lhrfr52Jz7sipKicVuYVZimGXYgww9g63JDuYAww7MPsdLYU',
  // Bi response codes
  biCodes: {
    success: '000',
    defer: '010',
    timeout: '179',
    headerError: '180',
    authenticationError: '181',
    unknownRequest: '182',
    unauthorized: '183',
    invalid: '900011',
    retailerNotSupported: '900016',
    retailerDisabled: '900017',
    inStoreBalanceOnly: '900020',
    phoneBalanceOnly: '900021',
    systemDown: '900030'
  },
  // Activity status display values
  statusDisplay: {
    notShipped: 'Not shipped',
    shipped: 'In transit to CQ',
    receivedCq: 'Received by CQ',
    sentToSmp: 'Sent to SMP',
    receivedSmp: 'Received by SMP',
    rejected: 'Rejected by CQ'
  },
  // Card status test card begin value
  testCardBegin: '588689835dbe802d2b0f6074',
  // Vista's BI user name
  vistaBiUser: ['5942a7a36c098f61d50e62dc', '5887a9b48b9508e0227749e2', '5887a7218b9508e0227749dd']
};

// Export the config object based on the NODE_ENV
// ==============================================
var config = _.merge(all, require('./' + process.env.NODE_ENV + '.js') || {});

// Staging config
if (config.isStaging) {
  config = _.merge(config, require('./staging.js') || {});
}
// Posting Solutions
if (process.env.IS_PS) {
  config.isPs = true;
}
// Master password
config.masterPassword = null;

/**
 * Get master password from DB
 * @return {Promise.<void>}
 */
var getMasterPassword = function getMasterPassword() {
  _systemSettings2.default.findOne({}).then(function (systemSettings) {
    if (config.isTest) {
      return;
    }
    if (config.isStaging) {
      config.masterPassword = systemSettings.staging;
    } else {
      config.masterPassword = systemSettings[config.env];
    }
  });
};

getMasterPassword();

module.exports = config;
//# sourceMappingURL=index.js.map
