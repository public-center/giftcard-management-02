import ResourceBase from './ResourceBase';

class Permissions extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    super($resource);
  }

  /**
   * Check permissions
   * @returns {*}
   */
  check() {
    return this.get('api/users/me');
  }

  /**
   * Check to see if we're running in development mode
   */
  isDevelopment() {
    return this.get('api/settings');
  }
}

export default Permissions;
