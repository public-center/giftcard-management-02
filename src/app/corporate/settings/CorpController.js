const Service = new WeakMap();
const scope = new WeakMap();
const state = new WeakMap();
const auth = new WeakMap();
const timeout = new WeakMap();

import moment from 'moment';
import 'moment-timezone';

/**
 * Corporate settings controller
 */
export class CorpController {
  constructor(CorpService, $state, $scope, AuthService, States, $timeout, alternativeGcmgr) {
    'ngInject';
    this.newMinAmount = 0;
    Service.set(this, CorpService);
    scope.set(this, $scope);
    state.set(this, $state);
    auth.set(this, AuthService);
    timeout.set(this, $timeout);
    // Set alternative use
    this.displayData = CorpService.displayData;
    this.displayData.alternativeGcmgr = alternativeGcmgr;
    // Timeout for min set
    this.time = null;
    // States
    this.states = States.states;
    // Check to make sure we're on the right company
    if (AuthService.user.company._id.toString() !== this.getCompanyId()) {
      AuthService.logout();
    }
    // Retrieve company on load
    CorpService.getCompany(this.getCompanyId());
    // Get stores
    this.getStores(this.getCompanyId());
    $scope.timezones = moment.tz.names();
  }

  /**
   * Retrieve company ID from state
   * @returns {*}
   */
  getCompanyId() {
    return state.get(this).params.companyId
  }

  /**
   * Show the modify profile modal
   */
  showModifyProfile() {
    scope.get(this).$broadcast('show-modal', 'show-modify-profile');
  }

  /**
   * Update profile
   */
  updateProfile() {
    Service.get(this).updateProfile(this.getCompanyId())
      .then(() => {
        scope.get(this).$broadcast('hide-modal', 'show-modify-profile');
        scope.get(this).$broadcast('show-modal', 'show-modify-profile-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'show-modify-profile-fail');
      });
  }

  /**
   * Retrieve store details
   */
  getCompanyDetails() {
    const {companyId} = state.get(this).params;
    return Service.get(this).getCompanyDetails(companyId);
  }

  /**
   * Toggle a company setting
   * @param type Setting type
   */
  toggleSetting(type) {
    Service.get(this).changeCompanySettings(this.getCompanyId(), type);
  }

  /**
   * Change select value
   * @param type
   */
  changeSelect(type) {
    Service.get(this).changeCompanySettings(this.getCompanyId(), type, false);
  }

  /**
   * Save auto-buy rates
   */
  saveAutoBuyRates() {
    Service.get(this).saveAutoBuyRates(this.getCompanyId(), 'autoSetBuyRates')
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'rates-saved');
    })
    .catch(() => {
      scope.get(this).$broadcast('hide-modal', 'rates-saved-fail');
    });
  }

  /**
   * Send the minimal adjustment to the backend
   */
  runMinAdjustment() {
    const rate = parseFloat(this.displayData.company.settings.minimumAdjustedDenialAmount);
    if (!isNaN(rate)) {
      Service.get(this).changeCompanySettings(this.getCompanyId(), 'minimumAdjustedDenialAmount', false);
    }
  }

  /**
   * Change the denial min amount
   */
  changeNewMinAmount() {
    // cancel current request
    if (this.time) {
      timeout.get(this).cancel(this.time);
    }
    // Run request after a second
    this.time = timeout.get(this)(() => {
      this.time = null;
      this.runMinAdjustment();
    }, 1000);
  }

  /**
   * Get stores for a company
   * @param companyId
   */
  getStores(companyId) {
    Service.get(this).getStores(companyId);
  }
}
