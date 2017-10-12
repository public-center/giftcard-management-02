import moment from 'moment';
const Resource = new WeakMap();

/**
 * Reconciliation service
 */
export class ReconciliationNewService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);

    this.displayData = {
      // Inventory
      inventory: {
        electronic: [],
        physical: [],
        denials: []
      },
      // Intake totals
      intakeTotal: {
        electronic: 0,
        physical: 0,
        denials: 0
      },
      lastReconciled: null,
      // Creation of packing slips
      packing: {
        electronic: [],
        physical: []
      },
      packingDate: new Date(),
      // User
      user: null,
      batch: null,
      meta: {}
    };
  }

  /**
   * Get the last time this store was reconciled
   */
  getLastReconciliationComplete(params) {
    return Resource.get(this).resource('Store:getLastReconciliationCompleteDate', params)
      .then(date => {
        // If this store has been reconciled, set that as the start date
        if (date.reconcileCompleteTime) {
          this.displayData.dateRange.startDate = moment.utc(date.reconcileCompleteTime).format()
        }
      });
  }

  /**
   * Retrieve cards since last reconciliation
   */
  getInventories(params) {
    return Resource.get(this).resource('Store:getCardsInReconciliation', params)
      .then(inventories => {
        this.handleReconciliationQueryResult(inventories);
      });
  }

  /**
   * Handle processing reconciliation query results
   * @param inventories
   * @param noAddTotals Don't add total rows for table display
   */
  handleReconciliationQueryResult(inventories, noAddTotals) {
    // Reset inventories
    this.displayData.inventory.electronic = [];
    this.displayData.inventory.physical = [];
    // Split the inventories into electronic and physical
    inventories.map(inventory => {
      switch (inventory.retailer.sellRates.sellTo.toLowerCase()) {
        case 'saveya':
          inventory.smp = 1;
          break;
        case 'cardcash':
          inventory.smp = 2;
          break;
        case 'cardpool':
          inventory.smp = 3;
          break;
        case 'giftcardrescue':
          inventory.smp = 4;
          break;
        // Can't be determined
        default:
          inventory.smp = 0;
      }
      if (inventory.type === 'electronic') {
        this.displayData.inventory.electronic.push(this.getSellAmount(inventory));
      } else {
        this.displayData.inventory.physical.push(this.getSellAmount(inventory));
      }
    });
    // Push totals onto table
    if (!noAddTotals) {
      this.pushTotals('physical');
      this.pushTotals('electronic');
    }
    // Get intake totals
    this.getIntakeTotal('balance');
    this.getIntakeTotal('buyAmount');
    this.getIntakeTotal('sellAmount');
  }

  /**
   * Get the sell amount for this inventory
   * @param inventory
   */
  getSellAmount(inventory) {
    inventory.sellAmount = inventory.balance * inventory.card.sellRate;
    return inventory;
  }

  /**
   * Push totals column onto table array
   */
  pushTotals(type) {
    // Don't total empty table
    if (!this.displayData.inventory[type].length) {
      return;
    }
    this.displayData.inventory[type].push({
      cqTransactionId: 'TOTAL',
      card: {
        balance: this.getInventoryTotal(this.displayData.inventory[type], 'balance')
      },
      buyAmount: this.getInventoryTotal(this.displayData.inventory[type], 'buyAmount'),
      sellAmount: this.getInventoryTotal(this.displayData.inventory[type], 'sellAmount')
    });
  }

  /**
   * Get the total for a normal prop on this inventory
   * @param inventories
   * @param prop Property to total
   */
  getInventoryTotal(inventories, prop) {
    if (!inventories.length) {
      return 0;
    }
    return inventories.reduce((current, thisInventory) => {
      if (thisInventory[prop] && thisInventory.cqTransactionId !== 'TOTAL') {
        return thisInventory[prop] + current;
      }
      return current;
    }, 0);
  }

  /**
   * Get denials since last reconciliation
   */
  getDenials(params) {
    return Resource.get(this).resource('Store:getDenials', params)
    .then(denials => {
      this.displayData.inventory.denials = denials.data;
    });
  }

  /**
   * Retrieve total for all cards in reconciliation
   */
  getIntakeTotal(prop) {
    const electronicTotal = this.getInventoryTotal(this.displayData.inventory.electronic, prop);
    const physicalTotal = this.getInventoryTotal(this.displayData.inventory.physical, prop);
    this.displayData.intakeTotal[prop] = electronicTotal + physicalTotal;
  }

  /**
   * Mark current reconciliation items as reconciled
   * @param params
   */
  markAsReconciled(params) {
    return Resource.get(this).resource('Store:markAsReconciled', params);
  }

  /**
   * Retrieve reconciliation for today
   * @param params
   */
  getReconciliationToday(params) {
    // Reset lists
    this.displayData.packing.electronic = [];
    this.displayData.packing.physical = [];
    // Get today's reconciliations
    return Resource.get(this).resource('Store:getReconciliationToday', params)
      .then(reconciliations => {
        // Meta
        this.displayData.meta = reconciliations.meta;
        this.displayData.batch = reconciliations.batch;
        const inventories = reconciliations.reconciliations.map(reconciliation => reconciliation.inventory);
        this.handleReconciliationQueryResult(inventories, true);
        // Keep user
        this.displayData.user = reconciliations.user;
        // Separate reconciliations
        reconciliations.reconciliations.forEach(reconciliation => {
          if (reconciliation.inventory.type === 'electronic') {
            this.displayData.packing.electronic.push(reconciliation);
          } else {
            this.displayData.packing.physical.push(reconciliation);
          }
        });
      });
  }

  /**
   * Set packing date
   */
  setPackingDate(date) {
    this.displayData.packingDate = date;
  }
}
