const state = new WeakMap();
/**
 * Store receipts
 */
export class EmployeeReceiptsController {
  constructor($state) {
    'ngInject';
    state.set(this, $state);
    this.goToReceipt = this.goToReceipt.bind(this);
  }

  /**
   * Go to a receipt
   * @param receiptId
   * @param userRole
   */
  goToReceipt(receiptId, userRole = 'employee') {
    if (userRole === 'corporate-admin') {
      state.get(this).go('main.corporate.customer.receipt', {receiptId});
    } else {
      state.get(this).go('main.employee.customer.receipt', {receiptId});
    }
  }
}
