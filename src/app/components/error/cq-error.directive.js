const timeout = new WeakMap();
/**
 * Simple error notification directive
 */
export class cqError {
  constructor($timeout) {
    'ngInject';
    this.scope = {
      cqError: '@'
    };
    // Timeout
    timeout.set(this, $timeout);
  }

  /**
   * Add and remove error display on backend error
   * @param scope
   * @param element
   */
  link(scope, element) {
    scope.$on('backend-error', (event, params) => {
      // Notify this error
      if (params.id === scope.cqError) {
        // Display error
        angular.element(element).addClass('has-error').append(angular.element(`<small class="error">${params.message}</small>`));
        // Remove error after 3 seconds
        timeout.get(this)(() => {
          angular.element(element).removeClass('has-error').find('.error').remove();
        }, 3000);
      }
    });
  }
}
