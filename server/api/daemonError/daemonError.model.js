'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const DaemonErrorSchema = new Schema({
  // Reference ID
  referenceId: {type: Schema.Types.ObjectId},
  // Model type
  referenceModel: '',
  // Details
  details: String,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DaemonError', DaemonErrorSchema);
