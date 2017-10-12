const Resource = new WeakMap();
/**
 * Update store service
 */
export class CorpUpdateStoreService {
  constructor(GcResource, CorpService) {
    'ngInject';
    Resource.set(this, GcResource);

    this.displayData = {
      details: {},
      alternativeGcmgr: CorpService.displayData.alternativeGcmgr
    };
    this.corpData = CorpService.displayData;
  }

  /**
   * Register a new store
   */
  register(params) {
    return Resource.get(this).resource('Store:newStore', params);
  }

  /**
   * Get store
   * @return {*}
   */
  getStore() {
    return Resource.get(this).resource('SupplierCompany:getStore');
  }
}
