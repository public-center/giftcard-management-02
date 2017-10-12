'use strict';

const path = require('path');
const _ = require('lodash');
const envJson = require('../../../env.json');
import SystemSettings from '../../api/systemSettings/systemSettings.model';
// Set session secret
process.env.secret = envJson['session-secret'];

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// SMP codes
export const SAVEYA = '1';
export const CARDCASH = '2';
export const CARDPOOL = '3';
export const GIFTCARDRESCUE = '4';
export const RAISE = '5';
export const EMPLOYEE = '6';
export const GIFTCARDZEN = '7';
export const INVALID = '0';

// All configurations will extend these options
// ============================================
const all = {
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
    INVALID,
    SAVEYA,
    CARDCASH,
    CARDPOOL,
    GIFTCARDRESCUE,
    RAISE,
    EMPLOYEE,
    GIFTCARDZEN
  },

  // Availabile SMPs
  smpNames: {
    [INVALID]: 'invalid',
    [SAVEYA]: 'saveya',
    [CARDCASH]: 'cardcash',
    [GIFTCARDRESCUE]: 'giftcardrescue',
    [CARDPOOL]: 'cardpool',
    [RAISE]: 'raise',
    [EMPLOYEE]: 'employee',
    [GIFTCARDZEN]: 'giftcardzen',
  },

  // Disabled SMPs

  disabledSmps: {
    [INVALID]: 'invalid',
    [SAVEYA]: 'saveya',
    [GIFTCARDRESCUE]: 'giftcardrescue',
    [RAISE]: 'raise',
    [EMPLOYEE]: 'employee',
  },

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
    success              : '000',
    defer                : '010',
    timeout              : '179',
    headerError          : '180',
    authenticationError  : '181',
    unknownRequest       : '182',
    unauthorized         : '183',
    invalid              : '900011',
    retailerNotSupported : '900016',
    retailerDisabled     : '900017',
    inStoreBalanceOnly   : '900020',
    phoneBalanceOnly     : '900021',
    systemDown           : '900030'
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
  vistaBiUser: ['5942a7a36c098f61d50e62dc', '5887a9b48b9508e0227749e2', '5887a7218b9508e0227749dd'],
};

// Export the config object based on the NODE_ENV
// ==============================================
let config = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});

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
const getMasterPassword = function() {
  SystemSettings.findOne({})
  .then(systemSettings => {
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
