/**
 * Record not found
 */
export const notFound = {
  code: 404,
  res: {err: 'Record not found'},
  resFn: type => `${type} not found`
};

/**
 * Invalid ObjectId
 */
export const invalidObjectId = {
  code: 400,
  res: {err: 'Invalid ID'}
};

/**
 * Document was not found
 */
export class DocumentNotFoundException {
  constructor(message, code) {
    this.message = message;
    this.code = code;
  }
}

/**
 * Violates sell limits
 */
export class SellLimitViolationException {
  constructor(message, code) {
    this.message = message;
    this.code = code;
  }
}
