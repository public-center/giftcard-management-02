import moment from 'moment';
const Resource = new WeakMap();
const Auth = new WeakMap();
/**
 * Card inventory service
 */
export class CardInventoryNewService {
  constructor(GcResource, SocketService, AuthService) {
    'ngInject';
    Resource.set(this, GcResource);
    const start = moment.utc();
    const end = moment.utc();
    Auth.set(this, AuthService);
    this.displayData = {
      // Currently selected date range
      dateRange: {
        startDate: start.subtract(1, 'days').format(),
        endDate: end.add(1, 'days').format()
      },
      // cards
      cards: {
        electronic: [],
        physical: [],
        denials: []
      },
      // Cards in inventory
      inventory: [],
      cardSearch: '',
      lastReconciled: null,
      // Inventory information to display on click in model
      inventoryDetails: '',
      // Customers
      customers: [],
      // Cards which have been queued to sell
      isSelling: {}
    };

    // Update inventory when we hear from the backend
    SocketService.syncInventory({
      updateInventory: this.updateInventory.bind(this)
    });
    // User role
    this.role = AuthService.user.role;
  }

  /**
   * Retrieve cards since last reconciliation
   */
  getCards(params) {
    return Resource.get(this).resource('Store:getCardsInInventory', params).then(cards => {
      // Reset cards
      this.displayData.cards.electronic = [];
      this.displayData.cards.physical = [];
      // Split the cards into electronic and physical
      cards.map(card => {
        if (card.type === 'electronic') {
          this.displayData.cards.electronic.push(card);
        } else {
          this.displayData.cards.physical.push(card);
        }
      });
    });
  }

  /**
   * Get denials since last reconciliation
   */
  getDenials(params) {
    return Resource.get(this).resource('Store:getDenials', params)
    .then(denials => {
      this.displayData.denials = denials.data;
    });
  }

  /**
   * Jump to today
   */
  jumpToToday() {
    const now = moment.utc().format();
    this.displayData.dateRange.startDate = now;
    this.displayData.dateRange.endDate = now;
  }

  /**
   * Update individual cards
   * @param inventory
   * @param socketInventory
   * @returns {*}
   */
  updateIndividualCards(inventory, socketInventory) {
    if (inventory._id === socketInventory._id) {
      const originalInventory = inventory;
      inventory = Object.assign({}, inventory, socketInventory);
      inventory.retailer = originalInventory.retailer;
      inventory.customer = originalInventory.customer;
    }
    return inventory;
  }

  /**
   * Find any cards placed into the wrong card type
   * @param type
   */
  findMisplacedCards(type) {
    let misplaced = [];
    // UNKNOWN, ELECTRONIC, PHYSICAL
    this.displayData.cards[type] = this.displayData.cards[type].filter(inventory => {
      if (inventory && inventory.type && inventory.type.toLowerCase() !== type) {
        misplaced.push(inventory);
      } else {
        return inventory;
      }
    });
    return misplaced;
  }

  /**
   * Update inventory when we hear from the backend
   * @param socketInventory
   */
  updateInventory(socketInventory) {
    // Update electronic
    this.displayData.cards.electronic = this.displayData.cards.electronic.map(inventory => {
      return this.updateIndividualCards(inventory, socketInventory);
    });
    // Update physical
    this.displayData.cards.physical = this.displayData.cards.physical.map(inventory => {
      return this.updateIndividualCards(inventory, socketInventory);
    });
    // If a card is now misplaced, move it to the right location
    const toElectronic = this.findMisplacedCards('physical');
    this.displayData.cards.electronic = this.displayData.cards.electronic.concat(toElectronic);
    const toPhysical = this.findMisplacedCards('electronic');
    this.displayData.cards.physical = this.displayData.cards.physical.concat(toPhysical);
  }

  /**
   * Reconcile cards which are ready
   */
  reconcile(params) {
    return Resource.get(this).resource('Store:reconcile', params);
  }

  /**
   * Old reconciliation complete, need to combine into reconcile function
   * @param params
   */
  reconciliationComplete(params) {
    return Resource.get(this).resource('Store:markAsReconciled', params);
  }

  /**
   * Retrieve customers for this company
   */
  getCustomersThisCompany(params) {
    // Don't get more than once
    if (this.displayData.customers.length) {
      return new Promise(resolve => resolve());
    }
    return Resource.get(this).resource('Employee:getAllCustomersThisCompany', params)
    .then(res => {
      this.displayData.customers = res.filter(customer => customer.firstName !== '__default__');
    });
  }

  /**
   * Proceed with a sale which is not auto-sell
   */
  sellCard(params) {
    // Don't sell twice
    if (this.displayData.isSelling[params.inventoryId]) {
      return new Promise(resolve => resolve());
    }
    // Add to selling
    this.displayData.isSelling = {
      [params.inventoryId]: true
    };
    return Resource.get(this).resource('SupplierCompany:sellCard', params);
  }
}
