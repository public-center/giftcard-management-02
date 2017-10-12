const rootScope = new Map();
/**
 * Select a row on BI ID
 */
export class biIdSelectRow {
  constructor($rootScope) {
    'ngInject';
    this.restrict = 'A';
    this.scope = {
      row: '=',
      ctrl: '='
    };
    rootScope.set(this, $rootScope);
  }

  link(scope, element) {
    let clickCount = 0;
    element.bind('click', function ($event) {
      // Multiple row selection
      if ($event.ctrlKey || $event.metaKey) {
        scope.$apply(function () {
          if (typeof scope.ctrl.rowSelect === 'function') {
            scope.ctrl.rowSelect(scope.row);
          }
        });
        return element.toggleClass('selected');
      }
      if (clickCount) {
        // Handle double click for modification
        scope.$apply(function () {
          if (typeof scope.ctrl.rowModify === 'function') {
            scope.ctrl.rowModify(scope.row);
          }
        });
      }
      clickCount++;
      setTimeout(() => {
        clickCount = 0;
      }, 1000);
    });
  }
}
