'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const ReconciliationSchema = new Schema({
  // Inventory
  inventory: {type: Schema.Types.ObjectId, ref: 'Inventory', required: true},
  // Reconciliation complete
  reconciliationComplete: {type: Boolean, default: false},
  /**
   * Created
   */
  created: {
    type: Date,
    default: Date.now
  },
  /**
   * User time when reconciliation was created
   */
  userTime: {type: Date},
  /**
   * User time when reconciliation was complete
   */
  reconciliationCompleteUserTime: {type: Date}
});

module.exports = mongoose.model('Reconciliation', ReconciliationSchema);
