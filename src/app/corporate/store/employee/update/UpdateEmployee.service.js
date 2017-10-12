const Resource = new WeakMap();
/**
 * Update employee service
 */
export class CorpUpdateEmployeeService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {};
  }

  /**
   * Retrieve employee details
   * @param employeeId
   */
  getEmployeeDetails(employeeId) {
    return Resource.get(this).resource('Employee:employeeDetails', {employeeId})
      .then((employee) => {
        this.displayData.employee = employee;
        return employee;
      });
  }

  /**
   * Update employee
   * @param params
   */
  update(params) {
    return Resource.get(this).resource('Employee:update', params);
  }

  updateRole(params){
    return Resource.get(this).resource('Employee:updateRole', params);
  }
}
