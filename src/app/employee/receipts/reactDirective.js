import {EmployeeReceipts} from './EmployeeReceipts';

export class employeeReceiptsReactDirective {
  constructor(reactDirective, $ngRedux) {
    'ngInject';
    return reactDirective(EmployeeReceipts, undefined, {}, {store: $ngRedux})
  }
}
