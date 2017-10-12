/**
 * Select a row on smart table
 */
export class selectRow {
  constructor($rootScope) {
    'ngInject';
    this.restrict = 'A';
    this.require = '^stTable';
    this.scope = {
      row: '=selectRow',
      callback: '&',
      ctrl: '='
    };
    this.rootScope = $rootScope;
  }

  link(scope, element) {
    let clickCount = 0;
    // Select all rows
    scope.$on('selectAll', () => {
      return element.addClass('selected');
    });
    // Deselect all rows except for the double clicked one
    scope.$on('deselectAll', (event, id) => {
      if (scope.row._id !== id) {
        return element.removeClass('selected');
      } else {
        return element.addClass('selected');
      }
    });
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
