const Resource = new WeakMap();
const state = new WeakMap();
const UsersService = new WeakMap();
const scope = new WeakMap();
/**
 * Modify a single user
 */
export class AdminUsersSingleController {
  constructor(GcResource, $state, AdminUsersService, $scope) {
    'ngInject';
    Resource.set(this, GcResource);
    state.set(this, $state);
    UsersService.set(this, AdminUsersService);
    scope.set(this, $scope);
    // Retrieve the user in question
    this.getSingle($state.params.id);
  }

  /**
   * Retrieve a single user
   * @param id User ID
   */
  getSingle(id) {
    Resource.get(this).resource('Admin:getSingle', {id})
    .then((res) => {
      // Store on users service
      UsersService.get(this).displayData.selectedUser = res;
      // Display
      this.selectedUser = angular.copy(res);
    });
  }

  /**
   * Update a user
   */
  update() {
    Resource.get(this).resource('Admin:updateUser', this.selectedUser)
      .then(() => {
        return UsersService.get(this).getUsers();
      })
      .then(() => {
        state.get(this).go('main.admin.users.modify');
      });
  }

  /**
   * Return to users list
   */
  cancel() {
    state.get(this).go('main.admin.users.modify');
  }

  /**
   * Confirm user delete
   */
  deleteUser() {
    Resource.get(this).resource('Admin:deleteUser', this.selectedUser)
      .then(() => {
        return UsersService.get(this).getUsers()
      })
      .then(() => {
        state.get(this).go('main.admin.users.modify');
      });
  }
}
