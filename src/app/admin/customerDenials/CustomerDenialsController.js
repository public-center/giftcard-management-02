const Service = new WeakMap();
const scope = new WeakMap();
const upload = new WeakMap();
const timeout = new WeakMap();
/**
 * Denials by customer controller
 */
export class CustomerDenialsController {
  constructor(CustomerDenialsService, $scope, Upload, $timeout) {
    'ngInject';
    Service.set(this, CustomerDenialsService);
    scope.set(this, $scope);
    upload.set(this, Upload);
    timeout.set(this, $timeout);
    this.displayData = CustomerDenialsService.displayData;
    $scope.displayData = {
      safe: [],
      display: [],
      perPage: 20
    };
    // Get all customers with denials
    CustomerDenialsService.getAll()
    .then(() => {
      this.exposeData();
    });
  }

  exposeData() {
    scope.get(this).displayData.safe = Service.get(this).displayData.customersSafe;
    scope.get(this).displayData.display = [].concat(scope.get(this).displayData.safe);
    scope.get(this).displayData.perPage = Service.get(this).displayData.perPage;
  }

  /**
   * Update rejection total
   * @param record
   */
  updateTotal(record) {
    if (record.newTotal) {
      Service.get(this).updateTotal(record)
      .then(() => {
        this.exposeData();
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'update-total-fail');
      });
    }
  }
}
