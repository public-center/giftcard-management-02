const state = new Map();
const sym = Symbol();
export class cqHeader {
  constructor($state) {
    'ngInject';
    this.templateUrl = 'app/components/header/header.html';
    this.transclude = true;
    this.scope = {
      headerCustom: '='
    };
    state.set(sym, $state);
  }

  link($scope) {
    // Get header text based on state
    const getHeaderText = () => {
      const params = state.get(sym).params;
      switch (state.get(sym).current.name) {
      /**
       * Admin headers
       */
        case 'main.admin.users.modify':
          return 'Modify existing users';
        case 'main.admin.users.create-admin':
          return 'Create a new admin user';
        case 'main.admin.users.create-user':
          return 'Create a new user';
        case 'main.admin.users.modifySingle':
          return 'Update user';
        case 'main.admin.users.list':
          return 'Users';
        case 'main.admin.settings.companies.list':
          return 'Supplier companies';
        case 'main.admin.settings.companies.new':
          return 'Create new company';
      /**
       * Corporate headers
       */
        case 'main.corporate.settings':
          return 'Company settings';
      /**
       * Employee headers
       */
        case 'main.employee.buyRates':
          return 'Buy rates';
        case 'main.employee.customer':
          return 'Search or create customer';
        case 'main.employee.customer.new':
          return 'Create a new customer';
        case 'main.employee.customer.details':
          return 'Customer details';
        case 'main.employee.customer.intake':
          // No customer selected, will intake as default
          if (params && params.customerId && params.customerId === 'default') {
            return 'Card intake (no customer selected)';
          }
          return 'Card intake';
        case 'main.employee.inventory':
          return 'Current inventory';
        case 'main.employee.reconciliation':
          return 'Reconciliation and shipping';
        default:
          return '';
      }
    };
    $scope.$watch(() => state.get(sym).current.name, function (newVal) {
      if (angular.isUndefined(newVal)) {
        return;
      }
      $scope.headerText = getHeaderText();
      // Remove custom header text if we have a hard-coded header text
      if ($scope.headerText) {
        $scope.headerCustom = null;
      }
    });
  }
}
