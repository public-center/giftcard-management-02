const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
/**
 * List employee controller
 */
export class CorpStoreDetailsController{
  constructor(CorpStoreDetails, $state, $scope) {
    'ngInject';
    Service.set(this, CorpStoreDetails);
    state.set(this, $state);
    scope.set(this, $scope);
    // Expose stores
    this.displayData = CorpStoreDetails.displayData;
    // Retrieve stores on load
    this.getStoreDetails();

    $scope.$on('corpStoreSelected', (event, id) => {
      const $state = state.get(this);
      $state.go($state.current.name, Object.assign(
        {}, $state.params, {companyId: $state.params.companyId, storeId: id}
      ));
    });
  }

  /**
   * Retrieve employees working at this store
   */
  getStoreDetails() {
    const {companyId, storeId} = state.get(this).params;
    this.companyId = companyId;
    this.storeId = storeId;
    Service.get(this).getStoreDetails(companyId, storeId);
  }

  /**
   * Confirm delete this employee
   */
  confirmDeleteEmployee(employeeId) {
    scope.get(this).$broadcast('show-modal', 'confirm-delete-employee');
    this.employeeId = employeeId;
  }

  /**
   * Delete employee
   */
  deleteEmployee() {
    Service.get(this).deleteEmployee(this.companyId, this.storeId, this.employeeId)
    .then(() => {
      this.getStoreDetails();
      scope.get(this).$broadcast('hide-modal', 'confirm-delete-employee');
    })
    .catch(() => {
      scope.get(this).$broadcast('hide-modal', 'confirm-delete-employee');
      scope.get(this).$broadcast('show-modal', 'delete-employee-fail');
    })
  }
}
