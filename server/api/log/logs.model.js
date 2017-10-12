'use strict';

import createIndexes from '../../config/indexDb';
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

// Two weeks in seconds
const twoWeeks = 1209600;

const Logs = new Schema({
  // When original record is created
  created: {
    type: Date,
    default: Date.now
  },
  // Path requested
  path: String,
  // Request method
  method: String,
  // Request body
  body: Object,
  // Request params
  params: Object,
  // Request query
  query: Object,
  // Response status code
  statusCode: Number,
  // Response status message
  statusMessage: String,
  // Is error log
  isError: {type: Boolean, default: false}
});

// Indexes
const indexes = [
  // Unique card index
  [{created: 1}, {expireAfterSeconds: twoWeeks}]
];
createIndexes(Logs, indexes);

Logs.methods = {
  /**
   * Create an error log
   * @param req
   * @param res
   *
   * @todo Make me a real boy
   */
  createErrorLog(req, res) {

  }
};

module.exports = mongoose.model('Log', Logs);
