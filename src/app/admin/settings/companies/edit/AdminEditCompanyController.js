const Resource = new WeakMap();
const state = new WeakMap();
const Service = new WeakMap();
const scope = new WeakMap();
/**
 * Admin edit company controller
 */
export class AdminEditCompanyController {
  constructor(States, GcResource, $state, AdminEditCompanyService, $scope) {
    'ngInject';
    // States for dropdown
    this.states = States.states;
    // Reference
    this.displayData = AdminEditCompanyService.displayData;
    Resource.set(this, GcResource);
    state.set(this, $state);
    Service.set(this, AdminEditCompanyService);
    scope.set(this, $scope);

    this.updateError = '';

    // Retrieve this company
    AdminEditCompanyService.getCompany($state.params.companyId);
  }

  /**
   * Update company settings
   */
  update() {
    Service.get(this).update(state.get(this).params.companyId)
      .then(() => {
        scope.get(this).$broadcast('show-modal', 'update-successful');
      })
      .catch(err => {
        if ('data' in err && err.data === 'invalidBookkeepingEmails') {
          this.updateError = 'Invalid bookkeeping emails. Enter a comma separated list of emails with no spaces. For example: email1@email.com,email2@email.com,...';
        }
        scope.get(this).$broadcast('show-modal', 'update-fail');
      });
  }

  /**
   * Close update response modals
   */
  closeModal() {
    scope.get(this).$broadcast('hide-modal', 'update-successful');
    scope.get(this).$broadcast('hide-modal', 'update-fail');
  }
}
