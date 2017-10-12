const Resource = new WeakMap();
const Auth = new WeakMap();
const State = new WeakMap();

export class topNav {
  constructor(GcResource, $auth, $state, AuthService) {
    'ngInject';
    this.templateUrl = 'app/components/topNav/top-nav.html';
    this.scope = {};
    this.bindToController = {
      searchText: '@'
    };
    Resource.set(this, GcResource);
    Auth.set(this, $auth);
    State.set(this, $state);
    this.controller = function () {
      /**
       * Log the user out
       */
      this.logout = () => {
        AuthService.logout();
      }
    };
    this.controllerAs = 'topNavCtrl';
  }
}
