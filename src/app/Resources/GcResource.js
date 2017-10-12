import constants from '../constants';
const Resource = new WeakMap();

/**
 * Handle API calls for GiftCard Manager
 */
export class GcResource {
  constructor($resource) {
    'ngInject';
    Resource.set(this, $resource);
  }

  /**
   * Handle resources
   * @param resourceIdentifier
   * @param params
   */
  resource(resourceIdentifier, params) {
    // Get constants
    const [type, constant] = constants.check(resourceIdentifier);
    // Get the required resource method class
    const ResourceMethods = require(`./${type}`).default;
    const methods = new ResourceMethods(Resource.get(this));
    // Make the appropriate call
    return methods[constant](params);
  }
}
