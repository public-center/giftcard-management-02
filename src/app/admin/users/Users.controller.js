const Resource = new WeakMap();
const state = new WeakMap();
const usersService = new WeakMap();
const scope = new WeakMap();

/**
 * Main users controller
 */
export class AdminUsersController {
  constructor(GcResource, $state, AdminUsersService, $scope) {
    'ngInject';
    Resource.set(this, GcResource);
    state.set(this, $state);
    usersService.set(this, AdminUsersService);
    scope.set(this, $scope);
    // Retrieve user on load
    usersService.get(this).getUsers();
  }
}
