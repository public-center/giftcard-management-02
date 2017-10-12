const role = new Map().set('defined', false).set('role', null);
const User = new Map();
const CorpStore = new Map();
const Resource = new WeakMap();
const State = new WeakMap();
const Auth = new WeakMap();

import {setUser} from 'reducers/reducers/auth';

/**
 * Basic auth service to keep track of user roles
 */
export class AuthService {
  constructor(GcResource, $state, $auth, $ngRedux) {
    'ngInject';
    Resource.set(this, GcResource);
    State.set(this, $state);
    Auth.set(this, $auth);

    // Don't bother unsubscribing, because this class is a singleton
    $ngRedux.connect(() => ({}), {setUser})(this);
  }

  // User role
  set role(thisRole) {
    role.set('role', thisRole).set('defined', true);
  }
  get role() {
    return role.get('role');
  }

  // Authenticated user
  set user(user) {
    User.set(this, user);
    // Call toJSON to convert the Angular Resource into a regular object
   this.setUser(user.toJSON ? user.toJSON() : user);
  }
  get user() {
    return User.get(this);
  }

  set store(store) {
    if (User.get(this)) {
      User.get(this).store = store;
    }
  }
  get store() {
    if (User.get(this)) {
       return User.get(this).store;
    }
    return null;
  }

  /**
   * Selected store when operating as a corporate user
   * @param store
   */
  set corpSelectedStore(store) {
    CorpStore.set(this, store);
  }

  get corpSelectedStore() {
    return CorpStore.get(this);
  }

  // If role has been defined
  get defined() {
    return role.get('defined');
  }
  set defined(defined) {
    role.set('defined', defined);
  }

  // Update a user company
  set company(company) {
    let user = User.get(this);
    user.company = company;
    User.set(this, user);
  }

  /**
   * Check the role for the current user
   */
  checkRole() {
    // Retrieve permissions from backend
    return Resource.get(this).resource('Permissions:check')
      .then((res) => {
        this.user = res;
        // Set role
        this.role = res.role;
        return this.user;
      })
      .catch(() => {
        State.get(this).go('landing');
      });
  }

  /**
   * Check whether we're running in development environment
   * @return {*}
   */
  checkDevelopment() {
    return Resource.get(this).resource('Permissions:isDevelopment')
  }

  /**
   * Perform the logout actions
   */
  handleLogout() {
    // Logout from backend
    Auth.get(this).logout();
    // Remove role
    AuthService.role = null;
    AuthService.defined = false;
    // Return to landing
    State.get(this).go('landing');
  }

  /**
   * Log the user out
   */
  logout() {
    Resource.get(this).resource('Auth:logout')
      .then(() => {
        this.handleLogout();
      })
      .catch(() => {
        this.handleLogout();
      });
  }
}
