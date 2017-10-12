'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var TangoSchema = new Schema({
  /**
   * Created
   */
  updated: {
    type: Date,
    default: Date.now
  },
  // Tango credit card token
  ccToken: String
});

/**
 * Pre-save hook
 */
TangoSchema.pre('validate', function (next) {
  this.updated = new Date();
  next();
});

module.exports = mongoose.model('Tango', TangoSchema, 'tango');
//# sourceMappingURL=tango.model.js.map
