const auth = new WeakMap();
const state = new WeakMap();
const Resource = new WeakMap();
const Service = new WeakMap();
/**
 * Auth controller
 */
export class AuthAdminController {
  constructor ($auth, $state, GcResource, AuthService, isDevelopment) {
    'ngInject';
    // Hold reference to necessary dependencies
    auth.set(this, $auth);
    state.set(this, $state);
    Resource.set(this, GcResource);
    Service.set(this, AuthService);
    // Check and see if we're running in development mode
    this.isDevelopment = isDevelopment;
    // Logout
    if ($state.current.name === 'logout') {
      AuthService.logout();
    }
  }

  /**
   * Redirect to the proper view
   * @param role
   * @param company
   */
  redirectToView(role, company) {
    switch (role) {
      case 'admin':
        state.get(this).go('main.admin.activity');
        break;
      case 'corporate-admin':
        state.get(this).go('main.corporate.store.list', {companyId: company});
        break;
      case 'employee':
        state.get(this).go('main.employee.buyRates');
        break;
      case 'manager':
        state.get(this).go('main.employee.buyRates');
        break;
    }
  }

  /**
   * Handle response from login request
   * @param res
   */
  handleLoginResponse(res) {
    // Store user
    Service.get(this).user = res.user;
    // Store token
    auth.get(this).setToken(res.token);
    // Redirect to appropriate state
    const {role, company} = res.user;
    this.redirectToView(role, company);
  }

  /**
   * Log an existing user in
   */
  login() {
    Resource.get(this).resource('Auth:login', {email: this.email, password: this.password})
    .then(res => {
      this.handleLoginResponse(res);
    })
    .catch(() => {
      this.unauthorized = true;
    });
  }

  /**
   * Force login in dev mode
   */
  async forceLogin(type = 'admin') {
    if (!this.isDevelopment) {
      return
    }
    const res = await Resource.get(this).resource('Auth:forceLogin', {type, forced: true});
    this.handleLoginResponse(res);
  }
}
