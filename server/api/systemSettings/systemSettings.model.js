'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const SystemSettingsSchema = new Schema({
  // last time rates were retrieved from saveya
  saveYaRateRetrievalTime: Date,
  // Master passwords
  production: String,
  // staging
  staging: String,
  // Developement
  development: String
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
