const Service = new WeakMap();
const state = new WeakMap();
const CorpService = new WeakMap();
const scope = new WeakMap();
/**
 * Update store
 */
export class CorpUpdateStoreController {
  constructor(States, $state, CorpStoreDetails, CorpStoreService, $scope, CorpUpdateStoreService, alternativeGcmgr) {
    'ngInject';
    // States for dropdown
    this.states = States.states;
    state.set(this, $state);
    Service.set(this, CorpStoreDetails);
    CorpService.set(this, CorpStoreService);
    scope.set(this, $scope);
    this.displayData = CorpStoreDetails.displayData;
    // Retrieve store details on load
    this.getStoreDetails();

    this.displayData = CorpUpdateStoreService.displayData;
    this.corpData = CorpUpdateStoreService.corpData;
    // Alternative use
    this.alternativeGcmgr = alternativeGcmgr;
  }

  /**
   * Retrieve store details
   */
  getStoreDetails() {
    const {companyId, storeId} = state.get(this).params;
    return Service.get(this).getStoreDetails(companyId, storeId)
      .then(store => {
        this.displayData.details = store;
        scope.get(this).$emit('header-text', `Update ${store.name}`);
      });
  }

  /**
   * Register a new supplier company
   */
  update() {
    const {name, address1, address2, city, state: stateVal, zip, phone, creditValuePercentage, maxSpending, payoutAmountPercentage} = this.displayData.details;
    const {companyId, storeId} = state.get(this).params;
    const params = {
      name,
      address1,
      address2,
      city,
      state: stateVal,
      zip,
      phone,
      companyId,
      storeId
    };
    // Alternate usage
    if (this.alternativeGcmgr) {
      params.creditValuePercentage  = creditValuePercentage;
      params.maxSpending            = maxSpending;
      params.payoutAmountPercentage = payoutAmountPercentage;
    }
    // Update the store
    Service.get(this).update(params)
    .then(() => {
      // Redirect
      state.get(this).go('main.corporate.store.details', {companyId: params.companyId, storeId: params.storeId});
    });
  }
}
