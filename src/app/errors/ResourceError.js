import BaseError from './BaseError';
/**
 * Resource related errors
 */
export default class ResourceError extends BaseError {
  constructor(message) {
    super(message);
  }
}
