const Resource = new WeakMap();
/**
 * Corporate store service
 */
export class CorpStoreDetails {
  constructor(GcResource, AuthService) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      isManager: AuthService.user.role === 'manager',
      user: AuthService.user,
      details: {users: []},
      detailsSafe: {users: []}
    };
  }

  /**
   * Retrieve store details
   */
  getStoreDetails(companyId, storeId) {
    return Resource.get(this).resource('Store:getStoreDetails', {companyId, storeId})
    .then((store) => {
      this.displayData.details = store;
      return store;
    });
  }

  /**
   * Update a store's details
   */
  update(params) {
    return Resource.get(this).resource('Store:updateStoreDetails', params);
  }

  /**
   * Delete an employee
   */
  deleteEmployee(companyId, storeId, employeeId) {
    return Resource.get(this).resource('Store:deleteEmployee', {companyId, storeId, employeeId});
  }
}
