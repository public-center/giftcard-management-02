const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
import moment from 'moment';
/**
 * Corporate reserves controller
 */
export class CorpReservesController{
  constructor(AuthService, CorpService, $scope) {
    'ngInject';
    Service.set(this, CorpService);
    // Expose stores
    this.displayData = CorpService.displayData;
    // Reserve total
    this.reserveTotal = 0;
    $scope.$watchCollection(() => CorpService.displayData, newVal => {
      if (newVal) {
        if (newVal.company && newVal.company.reserveTotal) {
          this.reserveTotal = newVal.company.reserveTotal;
        }
      }
    });
    // Name
    this.companyName = AuthService.user.company.name;
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
