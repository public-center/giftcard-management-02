const Resource = new WeakMap();

/**
 * Admin stats service
 */
export class AdminStatsService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      retailers: []
    };
  }

  /**
   * Get stats on cards sold per retailer
   */
  getRetailerStats() {
    return Resource.get(this).resource('Admin:getRetailerStats')
    .then(res => {
      this.displayData.retailers = res.retailers;
    });
  }
}
