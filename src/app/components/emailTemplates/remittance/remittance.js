/**
 * Remittance template
 */
export class remittance {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/emailTemplates/remittance/remittance.html';
    this.scope = {
      ctrl: '='
    };
  }
}
