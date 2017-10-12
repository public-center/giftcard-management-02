/**
 * Reconciliation tables and totals
 */
export class reconciliation {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/reconciliation/reconciliation.html';
    
    this.scope = {
      ctrl: '=',
      complete: '@',
      highlightOff: '@'
    };
  }
}
