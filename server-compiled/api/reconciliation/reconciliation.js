'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var ReconciliationSchema = new Schema({
  // Inventory
  inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
  // Reconciliation complete
  reconciliationComplete: { type: Boolean, default: false },
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
  userTime: { type: Date },
  /**
   * User time when reconciliation was complete
   */
  reconciliationCompleteUserTime: { type: Date }
});

module.exports = mongoose.model('Reconciliation', ReconciliationSchema);
//# sourceMappingURL=reconciliation.js.map
