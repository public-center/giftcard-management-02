/**
 * Layout controller for handling dynamic header text
 */
export class MainController {
  constructor($scope) {
    'ngInject';
    this.header = '';
    $scope.$on('header-text', (event, data) => {
      this.header = data;
    });
  }
}
