/**
 * Cash payments modal
 */
export class cashPayments {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/cashPayments/cash-payments.html';
    this.scope = {
      ctrl: '=',
      rejectionTotal: '@'
    };
  }
}
