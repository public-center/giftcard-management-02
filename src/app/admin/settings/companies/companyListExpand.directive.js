export class companyListExpand {
  constructor() {
    'ngInject';

    this.scope = {
      companyListExpand: '@'
    };
  }

  link(scope, element) {
    element.click(() => {
      angular.element('.tab-pane').removeClass('active');
      angular.element('#' + scope.companyListExpand).addClass('active');
    });
  }
}
