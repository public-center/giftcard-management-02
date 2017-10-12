import AdminFunctions from './AdminFunctions';

export class adminFunctionsReactDirective {
  constructor(reactDirective, $ngRedux) {
    'ngInject';
    return reactDirective(AdminFunctions, undefined, {}, {store: $ngRedux})
  }
}
