'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllBatches = getAllBatches;

var _batch = require('./batch.model');

var _batch2 = _interopRequireDefault(_batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get all batches (admin)
 */
function getAllBatches(req, res) {
  _batch2.default.find().then(function (batches) {
    return res.json(batches);
  });
}
//# sourceMappingURL=batch.controller.js.map
