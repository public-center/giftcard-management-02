'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var DaemonErrorSchema = new Schema({
  // Reference ID
  referenceId: { type: Schema.Types.ObjectId },
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
//# sourceMappingURL=daemonError.model.js.map
