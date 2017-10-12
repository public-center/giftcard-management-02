/**
 * Card inventory table
 */
export class inventoryTable {
  constructor() {
    'ngInject';
    this.templateUrl = 'app/components/InventoryTable/table.html';
    this.restrict = 'E';
    this.scope = {
      cardType: '@',
      ctrl: '=',
      employeeCtrl: '=',
      isManager: '=',
      alternative: '='
    };
  }
}
