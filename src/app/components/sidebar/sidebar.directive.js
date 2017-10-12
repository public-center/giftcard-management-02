const state = new Map();
const auth = new Map();
const corpSettings = new Map();
const sym = Symbol();
export class sidebar {
  constructor($state, AuthService, CorpService) {
    'ngInject';
    this.templateUrl = 'app/components/sidebar/sidebar.html';
    this.restrict = 'E';
    this.scope = {};
    state.set(sym, $state);
    auth.set(sym, AuthService);
    corpSettings.set(sym, CorpService);
  }

  link($scope) {
    // Set role
    $scope.role = auth.get(sym).role;
    $scope.user = auth.get(sym).user;
    // Set corp settings
    $scope.corpSettings = corpSettings.get(sym).displayData;
    $scope.hideBuyRates = true;
    // Alternative GCMGR (Vista)
    $scope.useAlternateGCMGR = false;

    // Check for using gcmgr for transactions
    $scope.$watchCollection(() => corpSettings.get(sym).displayData, newVal => {
      if (newVal) {
        if (newVal.company && newVal.company.settings) {
          $scope.useAlternateGCMGR = newVal.company.settings.useAlternateGCMGR;
        }
      }
    });

    if ($scope.role !== 'admin') {
      corpSettings.get(sym).getCompany(auth.get(sym).user.company._id.toString()).then(() => {
        if (['manager', 'employee'].indexOf(auth.get(sym).user.role) !== -1) {
          $scope.hideBuyRates = corpSettings.get(sym).displayData.company.settings.useAlternateGCMGR;
        } else {
          $scope.hideBuyRates = false;
        }
      });
    }

    // MetisMenu
    angular.element('#side-menu').metisMenu();
    $scope.$watch(() => state.get(sym).current.name, function (newVal) {
      if (angular.isUndefined(newVal)) {
        return;
      }
      $scope.currentState = newVal;
    });
    // Expose role
    $scope.user = auth.get(sym).user;
    // Set user name
    $scope.$watchCollection(function () {
      return auth.get(sym).user;
    }, function (newVal) {
      if (angular.isUndefined(newVal)) {
        return;
      }
      // write name if we have one
      if (newVal.firstName && newVal.lastName) {
        $scope.userName = `${newVal.firstName} ${newVal.lastName}`;
      }
      // Write company name if we have done
      if (newVal.company && 'name' in newVal.company) {
        $scope.companyName = newVal.company.name;
      }
    });
  }
}
