'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
import createIndexes from '../../config/indexDb';
import {defaultMargin} from '../deferredBalanceInquiries/runDefers';

const CompanySchema = new Schema({
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
    bi: {type: Boolean, default: false},
    lq: {type: Boolean, default: false},
    dgc: {type: Boolean, default: false}
  },
  // Disabled retailers
  disabledRetailers: [],
  // Company users
  users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  // Stores
  stores: [{type: Schema.Types.ObjectId, ref: 'Store'}],
  // Company settings
  settings: {type: Schema.Types.ObjectId, ref: 'CompanySettings'},
  // Tango ID
  cardBuyId: String,
  // Card buy
  cardBuyCustomerId: String,
  // CC id
  cardBuyCcId: String,
  // Reserve total
  reserveTotal: {type: Number, default: 0, get: function (total) {
    if (!total) {
      return 0;
    }
    return total;
  }},
  // Bookkeeping emails
  bookkeepingEmails: {type: String, get: function (emails) { return emails || ''; }},
  // Reserves
  reserves: [{type: Schema.Types.ObjectId, ref: 'Reserve'}]
});

// Indexes
const indexes = [
  [{name: 1}],
  [{reserves: 1}],
];
createIndexes(CompanySchema, indexes);

/**
 * Validations
 */

// Validate empty name
CompanySchema
  .path('name')
  .validate(function (name) {
    return name.length;
  }, 'Company name cannot be blank');

// Validate duplicate names
CompanySchema
  .path('name')
  .validate(function(name, respond) {
    this.constructor.findOne({name}, (err, company) => {
      if (err) {
        throw err;
      }
      if (company) {
        if (this.id === company.id) {
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
CompanySchema.methods.getSettings = async function (returnPlainObject = true) {
  let settings;
  settings = await (this.model('CompanySettings')).findOne({company: this._id});
  // If no settings, create a new one
  if (!settings) {
    settings = new (this.model('CompanySettings'))({
      company: this._id
    });
    settings = await settings.save();
    this.settings = settings._id;
    this.save();
    const autoBuyRates = await settings.getAutoBuyRates();
    settings = settings.toObject();
    settings.autoBuyRates = autoBuyRates;
  // Return settings
  } else {
    settings.customerDataRequired = typeof settings.customerDataRequired === 'undefined' ? true : settings.customerDataRequired;
    const autoBuyRates = await settings.getAutoBuyRates();
    settings = settings.toObject();
    settings.autoBuyRates = autoBuyRates;
  }
  // Return plain object with auto buy rates filled in
  if (returnPlainObject) {
    return settings;
  // Return Mongoose model for settings manipulation
  } else {
    return await (this.model('CompanySettings')).findOne({company: this._id}).populate({
      path: 'settings',
      populate: {
        path: 'autoBuyRates',
        model: 'AutoBuyRate'
      }
    });
  }
};

/**
 * Get settings as mongoose object
 * @returns {Promise}
 */
CompanySchema.methods.getSettingsObject = function () {
  return new Promise(resolve => {
    let settings;
    // Get company settings
    (this.model('CompanySettings')).findOne({company: this._id}, (err, dbSettings) => {
      settings = dbSettings;
      // If no settings, create a new one
      if (!dbSettings) {
        new Settings({
          company: this._id
        })
        .save((err, dbSettings) => {
          settings = dbSettings;
          this.settings = dbSettings._id;
          this.save();
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
  let thisMargin;
  try {
    thisMargin = this.settings.margin;
  } catch (e) {
    thisMargin = defaultMargin;
  }
  return thisMargin;
};

CompanySchema.set('toJSON', {getters: true});
CompanySchema.set('toObject', {getters: true});

module.exports = mongoose.model('Company', CompanySchema);
