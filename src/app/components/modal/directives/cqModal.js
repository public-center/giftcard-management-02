const sym = Symbol('cqModal');
const timeout = new Map();
const Service = new Map();
/**
 * cq-modal directive
 */
export class cqModal {
  constructor($timeout, ModalInheritanceService) {
    'ngInject';
    timeout.set(sym, $timeout);
    Service.set(sym, ModalInheritanceService);
    this.templateUrl = 'app/components/modal/views/modal.html';
    this.transclude = true;
    this.scope = {
      submitButton: '&',
      buttonText: '@',
      buttonClass: '@',
      modalTitle: '@',
      modalTitleSmall: '@',
      modalId: '@',
      modalClass: '@',
      modalWidth: '@',
      modalHeight: '@',
      // Submit disabled function
      disabled: '&',
      method: '@',
      hideCancel: '@',
      // Hide submit
      hideSubmit: '@',
      // Cancel button text
      cancelText: '@',
      // Tab index of enter
      enterTab: '@',
      // Close callback
      closeModalCallback: '&',
      // Static modal
      static: '@'
    };
  }

  link(scope, element, attrs) {
    // Apply show and hide methods to the scope
    Service.get(sym).inheritModal.call(this, scope, element, attrs);
    scope.static = scope.$eval(scope.static) || false;
    // Disable submit button on load
    timeout.get(sym)(function () {
      if ('modalForm' in scope && typeof scope.modalForm !== 'undefined' && 'valid' in scope.modalForm &&
          !scope.modalForm.$valid) {
        angular.element(element).find('button[type="submit"]').attr('disabled', true);
      }
    });
    // When form becomes valid, allow the user to submit
    scope.$watchCollection('modalForm', function (newVal) {
      // Don't run on $destroy
      if (!newVal) {
        return;
      }
      // Disable submit while form is invalid
      if (scope.modalForm.$valid) {
        angular.element(element).find('button[type="submit"]').attr('disabled', false);
      } else {
        angular.element(element).find('button[type="submit"]').attr('disabled', true);
      }
    });
  }
}
