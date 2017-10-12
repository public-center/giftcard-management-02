const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
const Auth = new WeakMap();
const triggerDownload = new WeakMap();
/**
 * Main employee controller
 */
export class EmployeeController {
  constructor(Employee, $state, $scope, NgTableParams, AuthService, TriggerDownloadService) {
    'ngInject';
    Service.set(this, Employee);
    state.set(this, $state);
    scope.set(this, $scope);
    Auth.set(this, AuthService);
    triggerDownload.set(this, TriggerDownloadService);
    // Expose stores
    this.displayData = Employee.displayData;
    this.displayData.hideBuyRates = true;
    // Get company settings
    this.getCompany().then(() => {
      if (['manager', 'employee'].indexOf(AuthService.user.role) !== -1) {
        this.displayData.hideBuyRates = this.displayData.company.settings.useAlternateGCMGR;
      } else {
        this.displayData.hideBuyRates = false;
      }

      if ($state.current.name === 'main.employee.buyRates' && this.displayData.hideBuyRates) {
        $state.go('main.employee.customer');
      }
    });

    this.user = AuthService.user;

    this.minVal = 'All';

    /**
     * Watch for users
     */
    $scope.$watchCollection(() => Employee.displayData.retailers, newVal => {
      if (angular.isUndefined(newVal)) {
        return;
      }
      this.tableParams = new NgTableParams({
        page: 1,
        count: 20
      }, {
        filterDelay: 0,
        data: newVal,
        counts: []
      });
    });

    // Display only values above the minimum selected
    this.watchMinRateSelect();
  }

  /**
   * Rebuild the table with only those rates which hit the minimum value
   */
  watchMinRateSelect() {
    const user = Auth.get(this).user;
    scope.get(this).$watch(() => this.displayData.minRateToDisplay, newVal => {
      this.minVal = newVal;
      // Retrieve stores on load
      if (user.store) {
        Service.get(this).getRetailers({storeId: user.store._id, minVal: newVal});
      }
    });
  }

  /**
   * Get company ID
   */
  getCompanyId() {
    try {
      return Auth.get(this).user.company._id
    } catch(e) {
      return null;
    }
  }

  /**
   * Retrieve company settings
   */
  getCompany() {
    return Service.get(this).getCompany(this.getCompanyId());
  }

  /**
   * Show manager override screen
   */
  showManagerOverride() {
    // Clear form
    this.displayData.managerCredentials = {
      email: '',
      password: ''
    };
    scope.get(this).$broadcast('show-modal', 'manager-override');
  }

  /**
   * Check manager override
   */
  managerOverride() {
    Service.get(this).managerOverride(this.getCompanyId())
    .then(res => {
      scope.get(this).$broadcast('hide-modal', 'manager-override');
      this.displayData.disableSetBuyRates = false;
      this.displayData.hideSellButton = false;
      this.displayData.overrideBalance = true;
      // General is manager settings
      this.displayData.isManager = true;
      // Check if admin
      this.displayData.isAdmin = !!res.admin;
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'manager-override-fail');
    });
  }

  /**
   * Retrieve store and inventory
   * @param additionalParams
   * @returns {{storeId: *, companyId: boolean}}
   */
  getStoreAndCompany(additionalParams) {
    const storeAndInventory = {storeId: this.user.store._id, companyId: this.user.company._id, userTime: new Date()};
    if (additionalParams) {
      Object.assign(storeAndInventory, additionalParams);
    }
    return storeAndInventory;
  }

  /**
   * Reconcile cards still in inventory
   */
  reconcileInventories() {
    Service.get(this).reconcile(this.getStoreAndCompany())
      .then(() => {
        window.location.reload(false);
      });
  }

  /**
   * Download rates as CSV
   */
  downloadRates() {
    const params = {storeId: Auth.get(this).user.store._id, minVal: this.minVal};
    Service.get(this).downloadRates(params)
    .then(res => {
      triggerDownload.get(this).triggerDownload(res.url);
    });
  }
}
