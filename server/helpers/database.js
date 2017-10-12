/**
 * Determine if mongoose document
 * @param val
 * @return {boolean}
 */
export function isMongooseDocument(val) {
  return val.constructor.name === 'model';
}

/**
 * Determine if mongoose object ID (as opposed to document or string)
 * @param val
 * @return {boolean}
 */
export function isMongooseObjectId(val) {
  return val.constructor.name === 'ObjectID';
}
