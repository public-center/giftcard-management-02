'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

// Two weeks in seconds
var twoWeeks = 1209600;

var Logs = new Schema({
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
  isError: { type: Boolean, default: false }
});

// Indexes
var indexes = [
// Unique card index
[{ created: 1 }, { expireAfterSeconds: twoWeeks }]];
(0, _indexDb2.default)(Logs, indexes);

Logs.methods = {
  /**
   * Create an error log
   * @param req
   * @param res
   *
   * @todo Make me a real boy
   */
  createErrorLog: function createErrorLog(req, res) {}
};

module.exports = mongoose.model('Log', Logs);
//# sourceMappingURL=logs.model.js.map
