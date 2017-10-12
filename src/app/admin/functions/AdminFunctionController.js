const Service = new WeakMap();
const scope = new WeakMap();

/**
 * Admin function controller
 *
 * EXAMPLE OF HOW TO TIE INTO THE REDUX STORE FROM AN NG CONTROLLER
 */
export class AdminFunctionController {
  constructor(AdminFunctionService, $scope) {
    'ngInject';

    Service.set(this, AdminFunctionService);
    scope.set(this, $scope);
  }

  /**
   * Recreate rejection history
   */
  rejectionHistoryConfirm() {
    scope.get(this).$broadcast('show-modal', 'rejection-history');
  }

  /**
   * Fill in complete rejection history
   */
  rejectionHistory() {
    Service.get(this).rejectionHistory()
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'rejection-history-success');
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'rejection-history-fail');
    })
    .finally(() => {
      scope.get(this).$broadcast('hide-modal', 'rejection-history');
    });
  }

  /**
   * Fill in system time
   */
  systemTime() {
    Service.get(this).systemTime();
  }

  /**
   * Fix the problem with all /lq/new orders being assigned to the same customer
   */
  fixLqApiCustomerCompany() {
    Service.get(this).fixLqApiCustomerCompany();
  }
}
