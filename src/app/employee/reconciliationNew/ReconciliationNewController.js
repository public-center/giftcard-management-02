const Service = new WeakMap();
const scope = new WeakMap();
const Auth = new WeakMap();
const State = new WeakMap();
const Window = new WeakMap();
const employee = new WeakMap();
const rootScope = new WeakMap();

import moment from 'moment';
/**
 * Reconciliation controller
 */
export class ReconciliationNewController {
  constructor(ReconciliationNewService, $scope, AuthService, $state, $window, Employee, $rootScope) {
    'ngInject';
    Service.set(this, ReconciliationNewService);
    scope.set(this, $scope);
    Auth.set(this, AuthService);
    State.set(this, $state);
    Window.set(this, $window);
    employee.set(this, Employee);
    rootScope.set(this, $rootScope);
    // Get user
    this.user = Auth.get(this).user;
    // Corporate user selected store
    $scope.$on('corpStoreSelected', (event, id) => {
      this.user.store = {
        _id: id
      };
    });
    // Expose displayData
    this.displayData = ReconciliationNewService.displayData;
    // Get the last time this store completed reconciliation
    this.getLastReconciliationComplete();
    // Check if there are currently cards in inventory that need to be reconciled
    this.checkNeedReconcile();
  }

  /**
   * Get the last time this store was reconciled
   */
  getLastReconciliationComplete() {
    return Service.get(this).getLastReconciliationComplete(this.getStoreAndCompany())
      .then(() => {
        Promise.all([
          // Retrieve inventories since last reconciliation
          this.getInventories(),
          // Get denials since last reconciliation
          this.getDenials()
        ]);
      });
  }

  /**
   * Retrieve store and inventory
   * @param additionalParams
   * @returns {{storeId: *, companyId: boolean}}
   */
  getStoreAndCompany(additionalParams) {
    const storeAndInventory = {storeId: this.user.store._id, companyId: this.user.company._id, userTime: moment().format()};
    if (additionalParams) {
      Object.assign(storeAndInventory, additionalParams);
    }
    return storeAndInventory;
  }

  /**
   * Retrieve inventories added since reconciliation last completed
   */
  getInventories() {
    Service.get(this).getInventories(this.getStoreAndCompany());
  }

  /**
   * Get denials since ast reconciliation
   */
  getDenials() {
    Service.get(this).getDenials(this.getStoreAndCompany());
  }

  /**
   * Get intake total
   * @param type Electronic or physical
   * @param inputPath Path to value on inventory that needs to be totaled
   */
  getIntakeTotal(type, ...inputPath) {
    return Service.get(this).getIntakeTotal(type, inputPath);
  }

  /**
   * Complete reconciliation
   */
  completeReconciliation() {
    // Mark all items as reconciled
    Service.get(this).markAsReconciled(this.getStoreAndCompany())
    .then(() => {
      const url = Auth.get(this).user.role === 'corporate-admin' ? 'main.corporate.reconciliationComplete' : 'main.employee.reconciliationComplete';
      // Open reconciliation report
      State.get(this).go(url);
    });
  }

  /**
   * Check to see if there are cards in inventory which need to be reconciled
   */
  checkNeedReconcile() {
    employee.get(this).checkNeedReconcile()
      .then(res => {
        if (res.needReconciliation) {
          rootScope.get(this).$broadcast('show-modal', 'inventories-need-reconciliation');
        }
      })
  }
}
