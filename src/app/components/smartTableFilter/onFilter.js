/**
 * Get filtered results from smart table
 * @returns {Function}
 */
export class onFilter {
  constructor() {
    'ngInject';
    this.require = '^stTable';
    this.scope = {
      onFilter: '='
    };
  }

  /**
   * Add and remove error display on backend error
   * @param scope
   * @param element
   */
  link(scope, element, attr, ctrl) {
    scope.$watch(() => ctrl.tableState().search, () => {
      if (typeof scope.onFilter === 'function') {
        scope.onFilter(ctrl);
      }
    }, true);
  }
}
