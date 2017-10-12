const state = new WeakMap();

/**
 * Simple class to control the body element styling
 */
export class BodyController {
  constructor($state) {
    'ngInject';

    state.set(this, $state);

    if (window.location.protocol === 'http:') {
      //REDIRECT
    }
  }

  /**
   * Get the current state
   */
  getCurrentState() {
    return state.get(this).current.name;
  }

  get bodyClass() {
    switch (this.getCurrentState()) {
      case 'landing':
        return 'landing-page';
      case 'auth.admin':
      case 'auth.forgot':
      case 'auth.reset':
      case 'reconciliationComplete':
        return 'gray-bg';
      default:
        return '';
    }
  }

  get id() {
    if (this.getCurrentState() === 'landing') {
      return 'page-top'
    }
    return '';
  }
}

BodyController.$inject = ['$state'];
