/**
 * Revised activity table
 */
export class transactionsTable {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/transactionsTable/table.html';
    this.restrict = 'E';
    this.scope = {
      displayData: '=',
      ctrl: '=',
      recalculateTotals: '&',
      totals: '=',
      setValue: '&',
      massUpdate: '&',
      piper: '=',
      customerDenial: '@',
      alternative: '='
    };
  }

  link(scope) {
    // View type
    scope.customerDenial = scope.$eval(scope.customerDenial);
  }
}
