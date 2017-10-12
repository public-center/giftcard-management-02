import {sagaMiddleware} from './index.config';
import sagas from 'sagas';
import {STATE_CHANGE} from 'reducers/actions/app';

/**
 * Setup basic RBAC
 */
export function runBlock (Permission, GcResource, AuthService, $ngRedux, $timeout, $rootScope) {
  'ngInject';

  sagaMiddleware.run(sagas);

  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState) => {
    $ngRedux.dispatch({
      type: STATE_CHANGE + '_' + fromState.name
    });
  });

  // Just wait until the state is loaded before displaying changes in devtools
  $ngRedux.subscribe(() => {
    $timeout(() => {$rootScope.$apply(() => {})}, 100);
  });
  /**
   * Retrieve user permissions from the backend
   * @returns {*}
   */
  const getPermissions = () => {
    // Use existing role
    if (AuthService.defined === true) {
      return new Promise((resolve) => {
        resolve(AuthService.role);
      });
    }
    // Retrieve permissions from backend
    return GcResource.resource('Permissions:check')
    .then((res) => {
      // Set role
      return AuthService.role = res.role;
    });
  };
  /**
   * Check permissions for a given role
   * @param type Role type
   * @returns {*}
   */
  const checkPermissions = (type) => {
    if (type === 'anonymous') {
      if (angular.isUndefined(AuthService.role) || !localStorage.satellizer_token) {
        return true;
      }
    }
    return new Promise((resolve, reject) => {
      // No token
      if (!localStorage.satellizer_token) {
        return reject();
      }
      getPermissions()
        .then(() => {
          return AuthService.role === type ? resolve() : reject();
        });
    });
  };
  // Check to see if the user is an admin
  Permission.defineRole('admin', () => {
    return checkPermissions('admin');
  })
  // Check for corporate admin role
  .defineRole('corporate-admin', () => {
    return checkPermissions('corporate-admin');
  })
  // Check for employee role
  .defineRole('employee', () => {
    return checkPermissions('employee');
  })
  // Always allow anonymous
  .defineRole('anonymous', () => {
    return checkPermissions('anonymous');
  });
}
