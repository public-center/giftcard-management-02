const Resource = new WeakMap();
const scope = new WeakMap();

export class ForgotPasswordController {
  constructor($scope, GcResource) {
    'ngInject';

    Resource.set(this, GcResource);
    scope.set(this, $scope);
  }

  requestPasswordReset() {
    Resource.get(this).resource('Auth:forgot', {email: this.email})
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'forgot-password-success');
    })
    .catch(err => {
      scope.get(this).$broadcast('show-modal', 'forgot-password-fail');
      this.error = err.data.error;
    })
  }
}
