const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new WeakMap();
const state = new WeakMap();
const Window = new WeakMap();
const authService = new WeakMap();
/**
 * Receipt controller
 */
export class ReceiptListController {
  constructor(ReceiptService, $scope, $timeout, $state, $window, AuthService) {
    'ngInject';
    Service.set(this, ReceiptService);
    scope.set(this, $scope);
    state.set(this, $state);
    timeout.set(this, $timeout);
    Window.set(this, $window);
    authService.set(this, AuthService);
    this.displayData = ReceiptService.displayData;
    // Get this receipt
    this.getReceipt();
  }


  getReceipt() {
    Service.get(this).getReceipt(state.get(this).params.receiptId)
      .then(() => {

      });
  }

  /**
   * Get cards on load
   */
  getCards() {
    Service.get(this).getCardsForReceipt(state.get(this).params.customerId)
      // Card totals
      .then(() => {
        // Calculate totals
        Service.get(this).displayTotals(this.displayData.receiptTotals, this.displayData.cards);
      });
  }

  /**
   * Retrieve the customer on load
   */
  getCustomer() {
    Service.get(this).getCustomer(state.get(this).params.customerId);
  }

  /**
   * Print receipt
   */
  printReceipt() {
    Window.get(this).print();
  }

  /**
   * Go to inventory confirmation
   */
  goToInventoryConfirm() {
    scope.get(this).$broadcast('show-modal', 'go-to-inventory');
  }

  /**
   * Go to inventory
   */
  goToInventory() {
    const url = authService.get(this).user.role === 'corporate-admin' ? 'main.corporate.inventory' : 'main.employee.inventory';
    scope.get(this).$broadcast('hide-modal', 'go-to-inventory');
    state.get(this).go(url);
  }
}
