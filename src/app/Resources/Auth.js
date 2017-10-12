import ResourceBase from './ResourceBase';

export default class Auth extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    'ngInject';
    super($resource);
  }

  /**
   * Register a new user
   */
  register(params) {
    return this.post(`api/users`, {}, params);
  }

  /**
   * Login
   */
  login(params) {
    return this.post(`api/auth/local`, {}, params);
  }

  /**
   * Force login
   * @param params Login type
   */
  forceLogin(params) {
    return this.post(`api/auth/local`, {}, params);
  }

  /**
   * Log the user out
   * @returns {*}
   */
  logout() {
    return this.get('api/auth/logout');
  }

  /**
   * Request a password reset
   */
  forgot(params) {
    return this.post('api/auth/forgot-password', {}, params);
  }

  /**
   * Reset password
   */
  reset(params) {
    return this.post('api/auth/reset-password', {}, params);
  }
}
