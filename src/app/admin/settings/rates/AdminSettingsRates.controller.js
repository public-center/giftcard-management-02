const Service = new WeakMap();
const scope = new WeakMap();
const upload = new WeakMap();
const timeout = new WeakMap();
/**
 * Admin settings for settings SMP rates
 *
 */
export class AdminSettingsRatesController {
  constructor(AdminSettingsRatesService, $scope, Upload, $timeout) {
    'ngInject';
    Service.set(this, AdminSettingsRatesService);
    scope.set(this, $scope);
    upload.set(this, Upload);
    timeout.set(this, $timeout);
    this.displayData = AdminSettingsRatesService.displayData;
    // Retrieve all supplier companies
    AdminSettingsRatesService.getAll();
  }

  /**
   * Upload cardcash rates confirm
   */
  uploadCcRatesConfirm() {
    scope.get(this).$broadcast('show-modal', 'cardcash-rates-upload');
  }

  /**
   * Upload cardcash rates confirm
   */
  uploadCardPoolRatesConfirm() {
    scope.get(this).$broadcast('show-modal', 'cardpool-rates-upload');
  }

  /**
   * Upload cardpool rates doc
   */
  uploadCardPoolDoc(type) {
    Service.get(this).uploadCpDoc({file: this[type], upload: upload.get(this), type})
      .then(() => {
        scope.get(this).$broadcast('hide-modal', 'cardpool-rates-upload');
        scope.get(this).$broadcast('show-modal', 'upload-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'upload-failure');
      });
  }

  /**
   * Upload Cardcash rates document
   */
  uploadCcRatesDoc() {
    Service.get(this).uploadCcRatesDoc({file: this.ccRates, upload: upload.get(this)})
    .then(() => {
      scope.get(this).$broadcast('hide-modal', 'cardcash-rates-upload');
      scope.get(this).$broadcast('show-modal', 'upload-success');
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'upload-failure');
    });
  }

  /**
   * Set property for a retailer
   * @param value New value
   * @param propPath Path to property to change
   * @param id Record ID
   */
  setProp(value, propPath, id) {
    if (value === '') {
      return;
    }
    if (this.delay) {
      timeout.get(this).cancel(this.delay);
    }
    this.delay = timeout.get(this)(() => {
      this.delay = null;
      Service.get(this).setProp(value, propPath, id);
    }, 250);
  }
}
