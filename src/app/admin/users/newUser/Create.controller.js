const Resource = new WeakMap();
const scope = new WeakMap();
const state = new WeakMap();
const UsersService = new WeakMap();
/**
 * Create new admin controller
 */
export class CreateAdminController {
  constructor(GcResource, $scope, $state, AdminUsersService) {
    'ngInject';
    Resource.set(this, GcResource);
    scope.set(this, $scope);
    state.set(this, $state);
    UsersService.set(this, AdminUsersService);
    this.role = $state.current.data.role;
  }

  /**
   * Register a new user
   */
  register() {
    Resource.get(this).resource('Auth:register', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        role: this.role
      })
      .then(() => {
        return UsersService.get(this).getUsers();
      })
      .then(() => {
        state.get(this).go('main.admin.users.list');
      });
  }
}
