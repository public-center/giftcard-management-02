'use strict';

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var BatchSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // Batch number
  batchId: { type: Number, required: true },
  // Company
  company: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Store ID
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  // Inventories
  inventories: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }]
});

// Indexes
var indexes = [
// Unique card index
[{ batchId: 1 }, { unique: true }]];
// @todo Did not work
(0, _indexDb2.default)(BatchSchema, indexes);

BatchSchema.pre('validate', function (next) {
  var _this = this;

  this.constructor.findOne({}).sort({
    batchId: -1
  }).limit(1).then(function (batch) {
    if (!batch) {
      _this.batchId = 1;
    } else {
      _this.batchId = batch.batchId + 1;
    }
    next();
  });
});

module.exports = mongoose.model('Batch', BatchSchema);
//# sourceMappingURL=batch.model.js.map
