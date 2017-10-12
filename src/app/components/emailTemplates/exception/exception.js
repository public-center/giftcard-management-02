/**
 * Exception template
 */
export class exception {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/emailTemplates/exception/exception.html';
    this.scope = {
      ctrl: '=',
      rejectionTotal: '@'
    };
  }
}
