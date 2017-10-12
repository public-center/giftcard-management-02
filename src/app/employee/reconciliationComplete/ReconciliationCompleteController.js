const Service = new WeakMap();
const scope = new WeakMap();
const Window = new WeakMap();
import moment from 'moment';
/**
 * Reconciliation controller
 */
export class ReconciliationCompleteController {
  constructor(ReconciliationNewService, $scope, AuthService, $window, CorpService) {
    'ngInject';
    Service.set(this, ReconciliationNewService);
    Window.set(this, $window);
    scope.set(this, $scope);
    // Get user
    this.user = AuthService.user;
    // Selected date
    this.selectedDate = null;
    // Reference
    this.displayData = ReconciliationNewService.displayData;
    // Set date
    ReconciliationNewService.setPackingDate(moment().format('MM-DD-YYYY'));
    if (this.user.store) {
      // Retrieve today's reconciliation
      this.getReconciliationToday();
    }
    $scope.$on('corpStoreSelected', (event, id) => {
      this.user.store = {
        _id: id
      };
      // Retrieve today's reconciliation
      this.getReconciliationToday();
    });
    // Watch for date changes
    this.watchCalendar();

    this.displayData.hideBuyAmount = true;
    CorpService.getCompany(AuthService.user.company._id.toString()).then(() => {
      if (['manager', 'employee'].indexOf(AuthService.user.role) !== -1) {
        this.displayData.hideBuyAmount = CorpService.displayData.company.settings.useAlternateGCMGR;
      } else {
        this.displayData.hideBuyAmount = false;
      }
    });
  }

  /**
   * Watch calendar
   */
  watchCalendar() {
    scope.get(this).$watch(() => this.displayData.packingDate, (newVal, oldVal) => {
      if (oldVal === newVal) {
        return;
      }
      const date = moment(newVal).format();
      this.getReconciliationToday({
        currentDate: date
      });
      this.selectedDate = date;
    });
  }

  /**
   * Get today's reconciliation report
   */
  getReconciliationToday(date) {
    Service.get(this).getReconciliationToday(this.getParams(date));
  }

  /**
   * Retrieve store and inventory
   * @param additionalParams
   * @returns {{storeId: *, companyId: boolean}}
   */
  getParams(additionalParams) {
    const storeAndInventory = {
      storeId: this.user.store._id,
      companyId: this.user.company._id,
      currentDate: this.selectedDate ? this.selectedDate : new Date().toISOString()
    };
    if (additionalParams) {
      Object.assign(storeAndInventory, additionalParams);
    }
    return storeAndInventory;
  }

  /**
   * Print packing slip
   */
  printPackingSlip() {
    Window.get(this).print();
  }

  /**
   * Set the calendar to today
   */
  jumpToToday() {
    this.displayData.packingDate = new Date();
  }
}
