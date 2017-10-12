/**
 * Denial template
 */
export class denial {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/emailTemplates/denial/denial.html';
    this.scope = {
      ctrl: '=',
      rejectionTotal: '@'
    };
  }
}
