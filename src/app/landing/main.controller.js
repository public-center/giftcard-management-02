const http = new WeakMap();

export class LandingController {
  constructor ($http, $log, AuthService, $state, $auth) {
    'ngInject';
    http.set(this, $http);
    this.log = $log;
    // If we have a token, check to see where we should redirect
    if ($auth.getToken()) {
      AuthService.checkRole()
        .then(() => {
          if (angular.isDefined(AuthService.role)) {
            switch (AuthService.role) {
              case 'admin':
                $state.go('main.admin.activity');
                break;
              case 'corporate-admin':
                $state.go('main.corporate.store.list', {companyId: AuthService.user.company._id});
                break;
              case 'employee':
              case 'manager':
                $state.go('main.employee.buyRates');
                break;
            }
          }
        });
    }
  }
}
