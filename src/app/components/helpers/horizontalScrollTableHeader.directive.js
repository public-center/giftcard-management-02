const sym = Symbol();
const timeout = new Map();

export class horizontalScrollTableHeader {
  constructor($timeout) {
    'ngInject';
    timeout.set(sym, $timeout);
    this.restrict = 'A';
  }

  link(scope, element) {
    timeout.get(sym)(function () {
      const $element = angular.element(element);
      const $tableContainer = $element.find('.table-container');
      const $headers = $element.find('.fixed-header').find('div');
      const originalOffsets = $headers.map(function (i, header) {
        return parseInt(angular.element(header).css('left'), 10);
      });

      function adjustHeader(e) {
        const scrollLeft = $tableContainer.scrollLeft();

        $headers.map(function (i, header) {
          angular.element(header).css('left', originalOffsets[i] - scrollLeft);
        });
      }

      element.on('$destroy', function () {
        $tableContainer.off('scroll', adjustHeader);
      });

      $tableContainer.on('scroll', adjustHeader);
    });
  }
}
