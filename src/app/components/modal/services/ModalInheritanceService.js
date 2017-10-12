const timeout = new WeakMap();
const rootScope = new WeakMap();
const Window = new WeakMap();

export class ModalInheritanceService {
  constructor($timeout, $rootScope, $window) {
    'ngInject';
    timeout.set(this, $timeout);
    rootScope.set(this, $rootScope);
    Window.set(this, $window);
  }

  inheritModal (scope, element, attrs) {
    /**
     * Show one of the modals
     * @param selector
     */
    if (!angular.isFunction(scope.showModal)) {
      scope.showModal = (selector, front) => {
        // Display modal
        var modal = angular.element('#' + selector);
        modal.modal('show');
        // Move the modal in front of any others
        if (front) {
          var initialZIndex = modal.css('z-index');
          modal.css('z-index', 9999);
          // Restore initial z-index
          modal.on('hidden.bs.modal', () => {
            modal.css('z-index', initialZIndex);
          });
        }
      };
    }

    /**
     * Hide the modal
     * @param selector
     */
    if (!angular.isFunction(scope.hideModal)) {
      scope.hideModal = (selector) => {
        angular.element('#' + selector).modal('hide');
      };
    }

    /**
     * Adjust modal width if defined
     */
    if (scope.modalWidth) {
      scope.$evalAsync(() => {
        angular.element(element).find('.modal-dialog').width(scope.modalWidth);
      });
    }
    /**
     * Adjust modal height
     */
    if (scope.modalHeight) {
      setTimeout(() => {
        if (scope.modalHeight === 'max') {
          angular.element(element).find('.modal-body:first').css('min-height', Window.get(this).innerHeight + 'px');
        } else {
          angular.element(element).find('.modal-body:first').css('min-height', scope.modalHeight);
        }
      });
    }
    /**
     * Keep the .modal-open class on the document if multiple modals will be displayed
     * @param modalId
     */
    var keepModalOpen = (modalId) => {
      angular.element('#' + modalId).on('hidden.bs.modal', () => {
        // Add class on digest cycle
        scope.$apply(() => {
          angular.element('body').addClass('modal-open');
        });
      });
    };
    /**
     * Directly select only this modal to close, otherwise there's interference with multiple modals
     */
    scope.closeModal = () => {
      rootScope.get(this).$broadcast('hide-modal', scope.modalId);
    };
    // Hide modal
    scope.$on('hide-modal', (event, modalId) => {
      scope.hideModal(modalId);
    });
    // Listen for broadcast to display or hide modal windows
    scope.$on('show-modal', (event, modalId, front) => {
      scope.showModal(modalId, front === true);
      if (front) {
        keepModalOpen(modalId);
      }
    });
    // Add modal-open class to body (for when multiple modals are open and one is closed, in which case Bootstrap removes it)
    scope.$on('keep-modal-open', (event, modalId) => {
      keepModalOpen(modalId);
    });

    /**
     * Conditionally disable submit
     */
    if (!attrs.disabled) {
      scope.disabled = () => {
        return false;
      };
    }
  }
}
