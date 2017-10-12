import BaseError from './BaseError';
/**
 * Constant related errors
 */
export default class ConstantError extends BaseError {
  constructor(message) {
    super(message);
  }
}
