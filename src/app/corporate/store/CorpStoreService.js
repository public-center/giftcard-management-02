const Resource = new WeakMap();
/**
 * Corporate store service
 */
export class CorpStoreService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      totals: null
    };
  }

  /**
   * Retrieve stores under this company
   */
  getStores(companyId) {
    // Reset
    this.displayData.stores = [];
    // Retrieve stores and store
    return Resource.get(this).resource('Store:getStores', {companyId})
    .then((stores) => {
      // Remove extra stuff
      this.displayData.stores = stores.filter((store) => {
        return store._id;
      });
    });
  }

  /**
   * Delete a store
   */
  deleteStore(storeId, companyId) {
    return Resource.get(this).resource('Store:deleteStore', {storeId, companyId})
      .then(() => {
        // Refresh the store list
        return this.getStores(companyId);
      });
  }

  /**
   * Retrieve store totals for a company
   * @param params
   */
  getStoreTotals(params) {
    return Resource.get(this).resource('Store:getStoreTotals', params)
    .then(res => {
      this.displayData.totals = res.data;
    })
  }
}
