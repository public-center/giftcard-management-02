const Service = new WeakMap();
const scope = new WeakMap();
const upload = new WeakMap();
const timeout = new WeakMap();
/**
 * Info on BI
 */
export class BiInfoController {
  constructor(BiInfoService, $scope, Upload, $timeout) {
    'ngInject';
    Service.set(this, BiInfoService);
    scope.set(this, $scope);
    upload.set(this, Upload);
    timeout.set(this, $timeout);
    this.displayData = BiInfoService.displayData;
    // Retrieve all supplier companies
    BiInfoService.getAll();
  }

  /**
   * Set property for a retailer
   * @param value New value
   * @param propPath Path to property to change
   * @param id Record ID
   */
  setProp(value, propPath, id) {
    if (this.delay) {
      timeout.get(this).cancel(this.delay);
    }
    this.delay = timeout.get(this)(() => {
      this.delay = null;
      Service.get(this).setProp(value, propPath, id);
    }, 250);
  }

  /**
   * Download CSV sheet
   */
  downloadCsv() {
    Service.get(this).downloadCsv();
  }
}
