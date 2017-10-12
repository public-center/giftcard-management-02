'use strict';

const mongoose = require('mongoose');
import createIndexes from '../../config/indexDb';
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const BatchSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // Batch number
  batchId: {type: Number, required: true},
  // Company
  company: {type: Schema.Types.ObjectId, ref: 'Store'},
  // Store ID
  store: {type: Schema.Types.ObjectId, ref: 'Store'},
  // Inventories
  inventories: [{type: Schema.Types.ObjectId, ref: 'Inventory'}]
});

// Indexes
const indexes = [
  // Unique card index
  [{batchId: 1}, {unique: true}],
];
// @todo Did not work
createIndexes(BatchSchema, indexes);

BatchSchema
  .pre('validate', function(next) {
    this.constructor.findOne({})
      .sort({
        batchId: -1
      })
      .limit(1)
      .then(batch => {
        if (!batch) {
          this.batchId = 1;
        } else {
          this.batchId = batch.batchId + 1;
        }
        next();
      });
  });

module.exports = mongoose.model('Batch', BatchSchema);
