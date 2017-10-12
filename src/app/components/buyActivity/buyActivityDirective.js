/**
 * Activity buy table
 */
export class buyActivityTable {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/buyActivity/table.html';
    this.restrict = 'E';
    this.scope = {
      displayData: '=',
      ctrl: '=',
      recalculateTotals: '&',
      totals: '=',
      changePage: '&',
      setValue: '&',
      corporate: '@',
      admin: '@',
      massUpdate: '&',
      revised: '@'
    };
  }

  link(scope) {
    // View type
    scope.corporate = scope.$eval(scope.corporate);
    scope.admin = scope.$eval(scope.admin);
    scope.revised = scope.$eval(scope.revised);
    scope.onFilter = (stCtrl) => {
      const inventories = stCtrl.getFilteredCollection();
      if (inventories && inventories.length) {
        scope.recalculateTotals({inventories});
      }
    };
  }
}
