const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
import moment from 'moment';
/**
 * Sub company controller
 */
export class CorpStoresController{
  constructor(CorpStoreService, $state, $scope, NgTableParams, AuthService, CorpService) {
    'ngInject';
    Service.set(this, CorpStoreService);
    state.set(this, $state);
    scope.set(this, $scope);
    // Expose stores
    this.displayData = CorpStoreService.displayData;
    this.corpDisplayData = CorpService.displayData;
    // Revert store totals
    this.displayData.totals = null;
    // Retrieve stores on load
    this.getStores();
    // Init report date
    const today = moment().format('MM-DD-YYYY');
    this.reportDate = today;
    this.reportDateEnd = today;

    /**
     * Watch for users
     */
    $scope.$watchCollection(() => CorpStoreService.displayData.stores, newVal => {
      if (angular.isUndefined(newVal) || !newVal.length) {
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
    $scope.$emit('header-text', AuthService.user.company.name + ' stores');
  }

  /**
   * Retrieve stores under this company
   */
  getStores() {
    Service.get(this).getStores(state.get(this).params.companyId);
  }

  /**
   * Confirm before deleting store
   */
  deleteStoreConfirm(storeId, companyId) {
    scope.get(this).$broadcast('show-modal', 'delete-store-confirm');
    this.storeId = storeId;
    this.companyId = companyId;
  }

  /**
   * Delete store
   */
  deleteStore() {
    Service.get(this).deleteStore(this.storeId, this.companyId)
    .then(() => {
      scope.get(this).$broadcast('hide-modal', 'delete-store-confirm');
      this.storeId = null;
      this.companyId = null;
    });
  }

  /**
   * Retrieve totals for stores
   */
  getStoreTotals() {
    const reportDate = this.reportDate;
    const reportDateEnd = this.reportDateEnd;
    const begin = this.reportDate ? moment(reportDate, 'MM-DD-YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const end = this.reportDateEnd ? moment(reportDateEnd, 'MM-DD-YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    Service.get(this).getStoreTotals({
      companyId: state.get(this).params.companyId,
      begin,
      end
    });
  }
}
