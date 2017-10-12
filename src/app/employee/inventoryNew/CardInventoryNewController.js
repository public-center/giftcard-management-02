const Service = new WeakMap();
const scope = new WeakMap();
const Auth = new WeakMap();
const State = new WeakMap();
const ngTableParams = new WeakMap();
const employee = new WeakMap();
import moment from 'moment';
/**
 * Card inventory controller
 */
export class CardInventoryNewController {
  constructor(CardInventoryNewService, $scope, AuthService, $state, NgTableParams, Employee, CorpService, alternativeGcmgr) {
    'ngInject';
    Service.set(this, CardInventoryNewService);
    scope.set(this, $scope);
    Auth.set(this, AuthService);
    State.set(this, $state);
    ngTableParams.set(this, NgTableParams);
    employee.set(this, Employee);
    // Get user
    this.user = Auth.get(this).user;
    // Expose displayData
    this.displayData = CardInventoryNewService.displayData;
    // Alternative GCMGR
    this.alternativeGcmgr = alternativeGcmgr;
    $scope.$on('corpStoreSelected', (event, id) => {
      this.user.store = {
        _id: id
      };
      this.getLastReconciliation();
    });
    if (this.user.store && this.user.company) {
      // Get the last time this store was reconciled
      this.getLastReconciliation();

      this.displayData.hideBuyRates = true;
      if (['manager', 'employee'].indexOf(this.user.role) !== -1) {
        this.displayData.hideBuyRates = alternativeGcmgr;
        this.alternativeGcmgr = alternativeGcmgr;
      } else {
        this.displayData.hideBuyRates = false;
      }
    }
  }

  /**
   * Get the last time this store was reconciled
   */
  getLastReconciliation() {
    // Retrieve cards since last reconciliation
    this.getCards();
    // Get denials since last reconciliation
    this.getDenials();
  }

  /**
   * Retrieve gift cards
   */
  getCards() {
    Service.get(this).getCards(this.getStoreAndCompany());
  }

  /**
   * Get denials since ast reconciliation
   */
  getDenials() {
    Service.get(this).getDenials(this.getStoreAndCompany());
  }

  /**
   * Retrieve store and inventory
   * @param additionalParams
   * @returns {{storeId: *, companyId: boolean}}
   */
  getStoreAndCompany(additionalParams) {
    const storeAndInventory = {storeId: this.user.store._id, companyId: this.user.company._id, userTime: moment().format()};
    if (additionalParams) {
      Object.assign(storeAndInventory, additionalParams);
    }
    return storeAndInventory;
  }

  /**
   * Change calendar to today
   */
  jumpToToday() {
    Service.get(this).jumpToToday();
  }

  /**
   * Confirm add to reconciliation
   */
  confirmAddToReconciliation() {
    // Make sure all cards have customers
    const cards = this.displayData.cards.electronic.concat(this.displayData.cards.physical);
    let canAdd = true;
    cards.forEach(card => {
      if (!card.customer || card.customer.firstName === '__default__') {
        canAdd = false;
      }
    });
    // Don't proceed if cards without customers exist
    if (!canAdd) {
      scope.get(this).$broadcast('show-modal', 'assign-customer-before-reconcile');
      return;
    }
    scope.get(this).$broadcast('show-modal', 'add-to-reconciliation');
  }

  /**
   * Reconcile all cards since the last time they were reconciled
   */
  addToReconciliation() {
    const storeAndCompany = this.getStoreAndCompany();
    Service.get(this).reconcile(storeAndCompany)
    .then(() => Service.get(this).reconciliationComplete(storeAndCompany))
    .then(() => {
      // Close modal
      scope.get(this).$broadcast('hide-modal', 'add-to-reconciliation');
      // Go to reconciliation
      const url = Auth.get(this).user.role === 'corporate-admin' ? 'main.corporate.reconciliationComplete' : 'main.employee.reconciliationComplete';
      State.get(this).go(url, {storeId: storeAndCompany.storeId});
    });
  }

  /**
   * Display card details
   * @param inventory
   */
  displayInventoryDetails(inventory) {
    // Requiring authorization to proceed with sale
    if (inventory.proceedWithSale === false) {
      scope.get(this).$broadcast('show-modal', 'card-details');
      this.displayData.inventoryDetails = 'This company has auto-sell set to OFF when this card was added to inventory. This card will not be sold until a company administrator approves the sale.';
    }
  }

  /**
   * Sell a card that is not auto-sold
   */
  sellCard($event, inventory) {
    $event.stopPropagation();
    $event.preventDefault();
    Service.get(this).sellCard(this.getStoreAndCompany({inventoryId: inventory._id}));
  }

  // /**
  //  * Retrieve total deductions for the currently displayed cards
  //  */
  // getTotalDeductions() {
  //   // No
  //   if (!this.displayData.cards.denials) {
  //     return 0;
  //   }
  //   return this.displayData.cards.denials.reduce((current, next) => {
  //     return current + (next.balance * next.liquidationRate);
  //   }, 0) * -1;
  // }
}
