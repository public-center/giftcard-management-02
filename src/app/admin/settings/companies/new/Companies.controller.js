const Resource = new WeakMap();
const state = new WeakMap();
/**
 * Basic company
 */
export class NewCompanyController {
  constructor(States, GcResource, $state) {
    'ngInject';
    // States for dropdown
    this.states = States.states;
    Resource.set(this, GcResource);
    state.set(this, $state);
  }

  /**
   * Register a new supplier company
   * @param powerSeller Create company for power seller
   */
  register(powerSeller = false) {
    const params = {
      name: this.name,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      zip: this.zip,
      contact: Object.assign(this.contact, {role: 'supplier'}),
      powerSeller
    };
    Resource.get(this).resource('SupplierCompany:create', params)
    .then(() => {
      state.get(this).go('main.admin.settings.companies.list');
    });
  }
}
