'use strict';

import mongoose from 'mongoose';
import {Promise} from 'bluebird';
const Schema = mongoose.Schema;

const ReserveSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // The amount of this transaction that goes into reserve
  amount: {type: Number, required: true},
  /**
   * References
   */
  inventory: {type: Schema.Types.ObjectId, ref: 'Inventory', required: true},
  company: {type: Schema.Types.ObjectId, ref: 'Company', required: true},
  store: {type: Schema.Types.ObjectId, ref: 'Store', required: true},
});

module.exports = mongoose.model('Reserve', ReserveSchema);
