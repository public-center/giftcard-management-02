/**
 * Revised activity table
 */
export class activityRevisedAdmin {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/activityRevisedAdmin/table.html';
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
      customerDenial: '@',
      alternative: '='
    };
  }

  link(scope) {
    // View type
    scope.corporate = scope.$eval(scope.corporate);
    scope.admin = scope.$eval(scope.admin);
    scope.revised = scope.$eval(scope.revised);
    scope.customerDenial = scope.$eval(scope.customerDenial);
  }
}
