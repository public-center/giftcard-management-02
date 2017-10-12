"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createIndexes;
/**
 * Create indexes for a schema
 * @param schema Mongoose schema
 * @param indexes Array of indexes to create
 */
function createIndexes(schema, indexes) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = indexes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var index = _step.value;

      schema.index(index[0], index.length > 1 ? index[1] : null);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}
//# sourceMappingURL=indexDb.js.map
