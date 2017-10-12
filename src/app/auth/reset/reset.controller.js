const Resource = new WeakMap();
const location = new WeakMap();
const scope = new WeakMap();

export class ResetPasswordController {
  constructor($location, $scope, GcResource) {
    'ngInject';

    Resource.set(this, GcResource);
    location.set(this, $location);
    scope.set(this, $scope);
  }

  resetPassword() {
    const data = location.get(this).search();
    data.password = this.password;
    data.confirm = this.confirm;

    Resource.get(this).resource('Auth:reset', data)
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'reset-password-success');
    })
    .catch(err => {
      scope.get(this).$broadcast('show-modal', 'reset-password-fail');
      this.error = err.data.error;
    });
  }

  /**
   * Submit function disabled
   * @return {boolean}
   */
  submitDisabled() {
    return this.password !== this.confirm;
  }
}
