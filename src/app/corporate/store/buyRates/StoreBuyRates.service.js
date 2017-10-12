const Resource = new WeakMap();
/**
 * Main employee service
 */
export class StoreBuyRatesService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      retailers: {},
      buyRates: {}
    };
  }

  /**
   * Retrieve retailers
   */
  getRetailers(params) {
    Resource.get(this).resource('Employee:getRetailers', params)
    .then(res => {
      // Store retailers
      this.displayData.retailers = res;
    });
  }

  /**
   * Retrieve a store with attached buy rates
   */
  getStoreWithBuyRates(params) {
    Resource.get(this).resource('Store:getStoreWithBuyRates', params)
    .then(res => {
      // Populate buy rates
      res.buyRateRelations.forEach(buyRate => {
        this.displayData.buyRates[buyRate.retailerId] = buyRate.buyRate * 100;
      });
    });
  }

  /**
   * Update buy rate for a store
   * @param retailerId
   * @param storeId
   * @param companyId
   */
  updateBuyRate(retailerId, storeId, companyId) {
    Resource.get(this).resource('Store:updateBuyRate', {
      buyRate: this.displayData.buyRates[retailerId],
      retailerId,
      storeId,
      companyId
    });
  }

  /**
   * Download rates as CSV
   * @param params
   */
  downloadRates(params) {
    return Resource.get(this).resource('Employee:downloadRetailers', params);
  }
}
