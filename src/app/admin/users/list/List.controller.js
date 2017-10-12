const usersService = new WeakMap();
const state = new WeakMap();
/**
 * Controller for users
 */
export class AdminUsersListController {
  constructor(AdminUsersService, $state, NgTableParams, $scope) {
    'ngInject';
    usersService.set(this, AdminUsersService);
    state.set(this, $state);
    // Get standing data
    this.displayData = {
      users: AdminUsersService.displayData.users
    };

    /**
     * Watch for users
     */
    $scope.$watchCollection(() => AdminUsersService.displayData.users, newVal => {
      if (angular.isUndefined(newVal) || !newVal.length) {
        return;
      }
      this.tableParams = new NgTableParams({
        page: 1,
        count: 20
      }, {
        filterDelay: 0,
        data: newVal,
        counts: []
      });
    });
  }

  /**
   * Modify a single user
   * @param user
   */
  modifySingle(user) {
    state.get(this).go('main.admin.users.modifySingle', {id: user._id});
  }
}
