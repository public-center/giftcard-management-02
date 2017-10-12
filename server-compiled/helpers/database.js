'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMongooseDocument = isMongooseDocument;
exports.isMongooseObjectId = isMongooseObjectId;
/**
 * Determine if mongoose document
 * @param val
 * @return {boolean}
 */
function isMongooseDocument(val) {
  return val.constructor.name === 'model';
}

/**
 * Determine if mongoose object ID (as opposed to document or string)
 * @param val
 * @return {boolean}
 */
function isMongooseObjectId(val) {
  return val.constructor.name === 'ObjectID';
}
//# sourceMappingURL=database.js.map
