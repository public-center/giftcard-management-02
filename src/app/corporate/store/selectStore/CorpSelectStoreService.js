const Resource = new WeakMap();
/**
 * Corporate select store service (for interacting with a specific store as a corporate level user)
 */
export class CorpSelectStoreService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {};
  }

  /**
   * Get the currently selected store
   * @param params storeId and companyId
   */
  getStore(params) {
    return Resource.get(this).resource('SupplierCompany:getStore', params);
  }
}
