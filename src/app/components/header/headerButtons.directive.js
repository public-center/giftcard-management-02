const state = new Map();
const compile = new Map();
const sym = Symbol();
const corpService = new Map();
const authService = new Map();
/**
 * Header buttons based on state
 */
export class headerButtons {
  constructor($state, $compile, CorpService, AuthService) {
    'ngInject';
    state.set(sym, $state);
    compile.set(sym, $compile);
    corpService.set(sym, CorpService);
    authService.set(sym, AuthService);
    this.templateUrl = 'app/components/header/headerButtons.html';
  }

  link($scope) {
    $scope.showNewCustomerButton = false;

    if (authService.get(sym).user.role !== 'admin') {
      corpService.get(sym).getCompany(authService.get(sym).user.company._id.toString())
      .then(() => {
        $scope.showNewCustomerButton = !corpService.get(sym).displayData.company.settings.useAlternateGCMGR;
      });
    }

    $scope.mainAdminUsers = () => {
      return $scope.parentState === 'main.admin.users';
    };

    $scope.mainAdminSettings = () => {
      return $scope.parentState === 'main.admin.settings';
    };

    $scope.mainCorporateStoreDetails = () => {
      return $scope.state === 'main.corporate.store.details';
    };

    $scope.mainCorporateStore = () => {
      return /main.corporate.store.(?!buyRates|details)/.test($scope.state);
    };

    $scope.mainEmployeeCustomerNonDefault = () => {
      return $scope.parentState === 'main.employee.customer' && $scope.stateParams.customerId !== 'default';
    };

    $scope.mainCorporateCustomerNonDefault = () => {
      return $scope.parentState === 'main.corporate.customer' && $scope.stateParams.customerId !== 'default';
    };

    $scope.mainCorporate = () => {
      return /main.corporate.(?!store|customer)/.test($scope.state);
    };

    $scope.mainEmployeeBuyRates = () => {
      return $scope.parentState === 'main.employee.buyRates';
    };

    $scope.mainCorporateBuyRates = () => {
      return $scope.parentState === 'main.corporate.buyRates';
    };

    // Change buttons on state change
    $scope.$watch(() => state.get(sym).current.name, function (newVal) {
      if (angular.isUndefined(newVal) || !newVal) {
        return;
      }
      $scope.state = state.get(sym).current.name;
      $scope.stateParams = state.get(sym).params;
      $scope.parentState = newVal.split('.').slice(0, 3).join('.');
    });
  }
}
