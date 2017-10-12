const Service = new WeakMap();
const state = new WeakMap();
const storeDetails = new WeakMap();
/**
 * Update employee
 */
export class CorpUpdateEmployeeController {
  constructor(States, $state, CorpUpdateEmployeeService, $scope, CorpStoreDetails) {
    'ngInject';
    this.checkbox = '';
    // States for dropdown
    this.states = States.states;
    this.storeId = $state.params.storeId;
    this.companyId = $state.params.companyId;
    state.set(this, $state);
    Service.set(this, CorpUpdateEmployeeService);
    storeDetails.set(this, CorpStoreDetails);
    this.displayData = CorpUpdateEmployeeService.displayData;
    // Retrieve employee details on load
    this.getEmployeeDetails()
    .then(() => {
      // Set header text
      $scope.$emit('header-text', `Update ${this.displayData.employee.fullName}`);
    });
    this.checkUserAuth();
  }

  changeRole(role) {
    this.checkbox = role;
  }

  /**
   * Retrieve employee details
   */
  getEmployeeDetails() {
    const {employeeId} = state.get(this).params;
    return Service.get(this).getEmployeeDetails(employeeId);
  }

  /**
   * Check user auth
   */
  checkUserAuth(){
    this.getEmployeeDetails()
      .then(details => {
        this.checkbox = details.role;
      });
  }

  /**
   * Update role
   */
  updateRole(){
    const {_id, company} = this.displayData.employee;
    const params = {
      employeeId: _id,
      companyId: company,
      role: this.checkbox
    };
    Service.get(this).updateRole(params);
  }

  /**
   * Update employee
   */
  update() {
    const {firstName, lastName, _id, email, password, company, store} = this.displayData.employee;
    const params = {
      firstName,
      lastName,
      email,
      employeeId: _id
    };
    if (password) {
      params.password = password;
    }
    // Update the store
    Service.get(this).update(params)
    .then(() => {
      // manager
      if (storeDetails.get(this).displayData.isManager) {
        state.get(this).go('main.employee.store.details', {companyId: company, storeId: store});
      // Corporate admin
      } else {
        state.get(this).go('main.corporate.store.details', {companyId: company, storeId: store});
      }
    });
    this.updateRole();
  }
}
