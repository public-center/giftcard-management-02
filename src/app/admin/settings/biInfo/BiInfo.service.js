const Resource = new WeakMap();
const triggerDownload = new WeakMap();
/**
 * Basic supplier company service
 */
export class BiInfoService {
  constructor(GcResource, TriggerDownloadService) {
    'ngInject';
    Resource.set(this, GcResource);
    triggerDownload.set(this, TriggerDownloadService);
    // Rates
    this.displayData = {
      retailers: [],
      retailersSafe: [],
      perPage: 20
    };
  }

  /**
   * Retrieve all supplier companies
   */
  getAll() {
    return Resource.get(this).resource('Admin:getBiInfo')
    .then((res) => {
      this.displayData.retailersSafe = res.retailers;
    });
  }

  /**
   * Set a property for a record
   * @param value New value
   * @param propPath Path to property to set
   * @param _id Record ID
   */
  setProp(value, propPath, _id) {
    return Resource.get(this).resource('Admin:updateBiInfo', {value, propPath, _id});
  }

  /**
   * Trigger download of CSV
   */
  downloadCsv() {
    return Resource.get(this).resource('Admin:downloadBiInfo')
    .then(res => {
      triggerDownload.get(this).triggerDownload(res.url);
    });
  }
}
