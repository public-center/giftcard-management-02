'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var ErrorLogSchema = new Schema({
  // Convention: {{ $functionName }}, EX: lqNewCard
  method: {
    type: String,
    required: true
  },

  // This is the name of controller where an error occurs.
  controller: {
    type: String,
    required: true
  },

  // Git revision under which the error occurred
  revision: {
    type: String,
    required: true
  },

  stack: {
    type: Schema.Types.Mixed
  },

  error: {
    type: Schema.Types.Mixed
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },

  created: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
//# sourceMappingURL=errorLog.model.js.map
