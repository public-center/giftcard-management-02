const Service = new WeakMap();
const state = new WeakMap();
const corpStoreService = new WeakMap();
/**
 * Basic company
 */
export class CorpNewStoreController {
  constructor(States, $state, CorpNewStoreService, CorpStoreService, CorpService) {
    'ngInject';
    // States for dropdown
    this.states = States.states;
    state.set(this, $state);
    Service.set(this, CorpNewStoreService);
    corpStoreService.set(this, CorpStoreService);

    this.displayData = CorpService.displayData;
  }

  /**
   * Register a new supplier company
   */
  register() {
    const params = {
      name: this.name,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      zip: this.zip,
      contact: Object.assign(this.contact, {role: 'employee'}),
      companyId: state.get(this).params.companyId
    };
    // Vista
    if (this.maxSpending) {
      params.maxSpending = parseFloat(this.maxSpending);
    }
    // Register the store
    Service.get(this).register(params)
    .then(() => {
      // Update stores
      corpStoreService.get(this).getStores(state.get(this).params.companyId)
      .then(() => {
        // Go to list stores
        state.get(this).go('main.corporate.store.list');
      });
    });
  }
}
