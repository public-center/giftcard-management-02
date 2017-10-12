/**
 * Revised activity table
 */
export class denials {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/denials/table.html';
    this.restrict = 'E';
    this.scope = {
      displayData: '=',
      ctrl: '=',
      recalculateTotals: '&',
      totals: '=',
      setValue: '&',
      corporate: '@',
      admin: '@',
      massUpdate: '&',
      revised: '@',
      piper: '=',
      isIntake: '=',
      goToCustomer: '&'
    };
  }

  link(scope) {
    // View type
    scope.corporate = scope.$eval(scope.corporate);
    scope.admin = scope.$eval(scope.admin);
    scope.revised = scope.$eval(scope.revised);
  }
}
