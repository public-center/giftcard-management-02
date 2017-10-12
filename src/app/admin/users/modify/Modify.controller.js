const usersService = new WeakMap();
/**
 * Modify users controller
 */
export class AdminUsersModifyController {
  constructor(AdminUsersService, $scope, NgTableParams) {
    'ngInject';
    usersService.set(this, AdminUsersService);
    this.displayData = AdminUsersService.displayData;

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
   * Retrieve the number of users
   * @returns {string}
   */
  get numberUsers() {
    return usersService.get(this).displayData.users.length === 1 ? 'Found one user' :
           `Found ${usersService.get(this).displayData.users.length} users`;
  }

  // Update user role
  changeRole(user) {
    usersService.get(this)
      .updateRole(user)
      .then((role) => {
        user.role = role;
      });
  }
}
