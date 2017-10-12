'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var ReserveSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  // The amount of this transaction that goes into reserve
  amount: { type: Number, required: true },
  /**
   * References
   */
  inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true }
});

module.exports = _mongoose2.default.model('Reserve', ReserveSchema);
//# sourceMappingURL=reserve.model.js.map
