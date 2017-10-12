const Resource = new WeakMap();
const authService = new WeakMap();
/**
 * Main employee service
 */
export class Employee {
  constructor(GcResource, AuthService, $state) {
    'ngInject';
    Resource.set(this, GcResource);
    authService.set(this, AuthService);
    this.displayData = {
      minRateToDisplay: 'All',
      company: null,
      // Hide buy rates if managers only are allowed to see them
      disableSetBuyRates: false,
      // Hide sell rates
      hideSellRates: false,
      // Hide sell button for auto-sell
      hideSellButton: true,
      // Manager can override BI results
      overrideBalance: false,
      // Manager credentials
      managerCredentials: {
        email: '',
        password: ''
      },
      // User is manager
      isManager: false,
      // User is admin
      isAdmin: false
    };
  }

  /**
   * Retrieve retailers for the store this employee is associated with
   */
  getRetailers(params) {
    Resource.get(this).resource('Employee:getRetailers', params)
    .then(res => {
      this.displayData.retailers = res;
    });
  }

  /**
   * Determine if the current user is a manager
   * @returns {boolean}
   */
  isManager() {
    try {
      const isManager = authService.get(this).user.role === 'manager';
      this.displayData.isManager = isManager;
      return isManager;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieve company
   * @param companyId
   */
  getCompany(companyId) {
    return Resource.get(this).resource('SupplierCompany:getCompany', {companyId})
    .then(company => {
      const isManager = this.isManager();
      this.displayData.company = company;
      const settings = company.settings;
      // If managers only allowed, hide buy rates
      if (settings) {
        // Hide buy rates
        this.displayData.disableSetBuyRates = !isManager && settings.managersSetBuyRates;
        // Hide sell rates
        this.displayData.hideSellRates = !isManager && !settings.employeesCanSeeSellRates;
      }
      if (isManager) {
        this.displayData.hideSellButton = false;
        this.displayData.isManager = true;
      }
    });
  }

  /**
   * Attempt manager override
   */
  managerOverride(companyId) {
    return Resource.get(this).resource('SupplierCompany:managerOverride',
      Object.assign({companyId}, this.displayData.managerCredentials));
  }

  /**
   * Check if there are cards in inventory which need to be reconciled
   */
  checkNeedReconcile() {
    return Resource.get(this).resource('Employee:checkInventoryNeedReconciled', {
      companyId: authService.get(this).user.company._id,
      storeId: authService.get(this).user.store._id
    });
  }

  /**
   * Reconcile cards still in inventory
   */
  reconcile(params) {
    return Resource.get(this).resource('Store:reconcile', params);
  }

  /**
   * Download rates as CSV
   * @param params
   */
  downloadRates(params) {
    return Resource.get(this).resource('Employee:downloadRetailers', params);
  }
}
