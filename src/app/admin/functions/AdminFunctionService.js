const Resource = new WeakMap();
/**
 * Admin function service
 */
export class AdminFunctionService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      retailers: []
    };
  }

  /**
   * Recreate rejection history
   */
  rejectionHistory() {
    return Resource.get(this).resource('Admin:rejectionHistory');
  }

  /**
   * Fill in system time
   */
  systemTime() {
    return Resource.get(this).resource('Admin:systemTime');
  }

  /**
   * Fix problems with all /lq/new orders being assigned to the same customer, regardless of company
   */
  fixLqApiCustomerCompany() {
    return Resource.get(this).resource('Admin:fixLqApiCustomerCompany');
  }
}
