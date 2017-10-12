const Service = new WeakMap();
const state = new WeakMap();
const storeDetails = new WeakMap();
/**
 * New employee controller
 */
export class CorpNewEmployeeController {
  constructor(States, $state, CorpNewEmployeeService, CorpStoreDetails, $scope) {
    'ngInject';
    // States for dropdown
    this.states = States.states;
    state.set(this, $state);
    Service.set(this, CorpNewEmployeeService);
    storeDetails.set(this, CorpStoreDetails);
    const {companyId, storeId} = $state.params;
    // Retrieve store details
    CorpStoreDetails.getStoreDetails(companyId, storeId)
    .then(() => {
      // Set header text
      $scope.$emit('header-text', `${CorpStoreDetails.displayData.details.name}: New employee`);
      // Default employee type to employee
      this.role = 'employee';
    });
  }

  /**
   * Register a new supplier company
   */
  register() {
    const stateParams = state.get(this).params;
    const {companyId, storeId} = stateParams;
    const input = ['firstName', 'lastName', 'email', 'password', 'role'];
    let params = {};
    // Create params
    input.forEach((item) => {
      params[item] = this[item]
    });
    params.companyId = companyId;
    params.storeId = storeId;
    // Register the store
    Service.get(this).newEmployee(params)
    .then(() => {
      if (storeDetails.get(this).displayData.isManager) {
        state.get(this).go('main.employee.store.details', {companyId, storeId});
      } else {
        state.get(this).go('main.corporate.store.details', {companyId, storeId});
      }

      // Repopulate table
      storeDetails.get(this).getStoreDetails(companyId, storeId);
    });
  }
}
