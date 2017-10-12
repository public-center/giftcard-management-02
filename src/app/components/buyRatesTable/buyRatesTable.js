/**
 * Card inventory table
 */
export class buyRatesTable {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/buyRatesTable/buyRatesTable.html';
    this.restrict = 'E';
    this.scope = {
      employeeCtrl: '=',
      hideSellRates: '='
    };
  }
}
