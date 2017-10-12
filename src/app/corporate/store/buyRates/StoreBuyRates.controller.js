const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
const timeout = new WeakMap();
const params = new WeakMap();
const triggerDownload = new WeakMap();
/**
 * Main employee controller
 */
export class StoreBuyRatesController {
  constructor(StoreBuyRatesService, $state, $scope, NgTableParams, $timeout, AuthService, TriggerDownloadService) {
    'ngInject';
    Service.set(this, StoreBuyRatesService);
    state.set(this, $state);
    scope.set(this, $scope);
    timeout.set(this, $timeout);
    params.set(this, NgTableParams);
    triggerDownload.set(this, TriggerDownloadService);
    let {storeId, companyId} = $state.params;
    // Stored on authservice
    if (!storeId && AuthService.store) {
      storeId = AuthService.store._id;
    }
    // Update timer
    this.timer = {};
    // Expose stores
    this.displayData = StoreBuyRatesService.displayData;
    // Selected store
    this.storeSelected = null;
    this.storeId = null;
    this.companyId = companyId;
    // Broadcast
    $scope.$on('corpStoreSelected', (event, thisStoreId) => {
      this.storeId = thisStoreId;
      this.displayRates(thisStoreId, companyId);
    });
    if (storeId) {
      this.storeId = storeId;
      this.displayRates(storeId, companyId);
    }

    /**
     * Watch for users
     */
    scope.get(this).$watchCollection(() => Service.get(this).displayData.retailers, newVal => {
      if (angular.isUndefined(newVal) || !newVal.length) {
        return;
      }
      this.tableParams = new (params.get(this))({
        page: 1,
        count: 20
      }, {
        filterDelay: 0,
        data: newVal,
        counts: []
      });
    });
  }

  displayRates(storeId, companyId) {
    this.storeSelected = storeId !== 'all';
    if (this.storeSelected) {
      // Retrieve stores on load
      Service.get(this).getRetailers({storeId});
      // Get buy rates for this store
      Service.get(this).getStoreWithBuyRates({storeId, companyId});
    } else {
      this.tableParams = new (params.get(this))({
        page: 1,
        count: 20
      }, {
        filterDelay: 0,
        data: [],
        counts: []
      });
    }
  }

  /**
   * Update buy rates
   * @param id
   */
  updateBuyRate(id) {
    const {storeId, companyId} = state.get(this).params;
    if (this.timer[id]) {
      timeout.get(this).cancel(this.timer);
    }
    this.timer[id] = timeout.get(this)(() => {
      Service.get(this).updateBuyRate(id, storeId, companyId)
    }, 1000)
  }

  /**
   * Download rates as CSV
   */
  downloadRates() {
    const params = {storeId: this.storeId, minVal: 'All'};
    Service.get(this).downloadRates(params)
      .then(res => {
        triggerDownload.get(this).triggerDownload(res.url);
      });
  }
}
