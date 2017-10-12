'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var SystemSettingsSchema = new Schema({
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
//# sourceMappingURL=systemSettings.model.js.map
