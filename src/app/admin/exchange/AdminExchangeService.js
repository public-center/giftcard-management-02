const Resource = new WeakMap();
const triggerDownload = new WeakMap();
import moment from 'moment';
/**
 * New admin activity
 */
export class AdminExchangeService {
  constructor(GcResource, TriggerDownloadService) {
    'ngInject';
    Resource.set(this, GcResource);
    triggerDownload.set(this, TriggerDownloadService);
    // Rates
    this.rates = [];
    // Changed rates
    this.rateChanges = {
      cardcash: {},
      saveya: {},
      cardpool: {},
      giftcardrescue: {}
    };

    this.safeData = {
      retailers: [], // First data load
      initialLoad: true, // Table state
      tableState: false,
      // Customers
      customers: [],
      // Batches
      batches: [],
      // Users
      users: []
    };

    // Display data
    this.displayData = {
      dateRange: {},
      selectedInventories: {},
      statuses: {},
      updateBatchStatus: '',
      // Totals (unused)
      meta: {},
      totals: {
        pageTotal: {},
        grandTotal: {}
      },
      empty: [],
      // Per page
      perPage: "20",
      page: 1,
      totalPages: 1,
      currentPage: 1,
      // Total number of inventories in search range
      totalItems: 0,
      // Mass updates
      mass: {},
      // Selected rows
      selectedRows: {},
      // Retailer
      retailers: [],
      // Customers
      customers: [],
      // Batches
      batches: [],
      // Users
      users: [],
      // Search params for dropdowns
      params: {
        batches: [],
        companies: [],
        stores: [],
        retailers: []
      },
      smps: [
        {id: '2', name: 'cardcash'},
        {id: '3', name: 'cardpool'},
        {id: '5', name: 'raise'},
        {id: '7', name: 'giftcardzen'}
      ],
      // Total selected rows
      totalSelectedRows: 0,
      // Deduction error
      deductionError: ""
    };
  }

  /**
   * Format begin or end date range
   * @param dateRange Date range object
   * @param beginEnd Whether begin or end date
   */
  formatDateSelection(dateRange, beginEnd) {
    if (!/\d{2}-\d{2}-\d{4}/.test(dateRange[beginEnd])) {
      return moment(dateRange[beginEnd]).format('MM-DD-YYYY');
    }
    return dateRange[beginEnd];
  }

  /**
   * Get current date params
   */
  getDateParams(excludePerPage = false) {
    const dateRange = Object.assign({}, this.displayData.dateRange);
    // Format begin and end date
    if (dateRange.dateBegin) {
      dateRange.dateBegin = this.formatDateSelection(dateRange, 'dateBegin');
    }
    if (dateRange.dateEnd) {
      dateRange.dateEnd = this.formatDateSelection(dateRange, 'dateEnd');
    }
    // String for the pagination component
    if (!excludePerPage) {
      dateRange.perPage = parseInt(this.displayData.perPage);
      dateRange.page = this.displayData.page;
    }
    return dateRange;
  }

  /**
   * Retrieve all supplier companies
   */
  getAll(query) {
    const dateRange = this.getDateParams(dateRange);
    return Resource.get(this).resource('Admin:getAllActivityRevised', {
      dateRange,
      query
    })
    .then(res => {
      let inventories = res.inventories;
      const meta = res.meta;
      this.activity = inventories;
      this.displayData.activity = inventories;
      this.displayData.totals.grandTotal = meta.totals;
      this.displayData.totals.pageTotal = meta.pageTotals;
      this.displayData.totalPages = meta.pages;
      this.displayData.totalItems = meta.total;
      console.log('**************INVENTORIES**********');
      console.log(inventories);
      console.log('**************META**********');
      console.log(meta);
    })
    .then(() => {
      if (!this.safeData.retailers.length) {
        // Get list of retailers
        this.getRetailerList();
      }
      // List of customers
      if (!this.safeData.customers.length) {
        this.getCustomerList();
      }
      // List of batches
      if (!this.safeData.batches.length) {
        this.getBatchList();
      }
      // List of users
      if (!this.safeData.users.length) {
        this.getUsersList();
      }
    })
    .then(() => {
      if (this.displayData.activity.length) {
        this.getParamsInRange();
      } else {
        this.displayData.batches = [];
      }
    });
  }

  /**
   * Modify an existing card
   */
  modifyCard(params) {
    return Resource.get(this).resource('Admin:modifyCard', params);
  }

  /**
   * Delete an inventory
   */
  deleteInventory(params) {
    return Resource.get(this).resource('Admin:deleteCard', params);
  }

  /**
   * Change the SMP, number, or PIN for a card
   * @param params
   */
  changeCardDetails(params) {
    return Resource.get(this).resource('Admin:changeCardDetails', params);
  }

  /**
   * Change inventory value
   * @param inventory
   * @param type Status type
   */
  setInventoryValue(inventory, type) {
    return Resource.get(this).resource('Admin:setInventoryValue', {
      inventoryId: inventory._id,
      status: inventory[type],
      type
    });
  }

  /**
   * Mass update inventories
   * @param inventories
   */
  massUpdate(ids) {
    return Resource.get(this).resource('Admin:massUpdateInventories', {
      ids,
      values: this.displayData.mass
    });
  }

  /**
   * Modify card balance
   */
  modifyBalance(params) {
    return Resource.get(this).resource('Admin:modifyCardBalance', params);
  }

  /**
   * @todo Make these four functions below into one
   */
  /**
   * Get retailer list
   */
  getRetailerList() {
    return Resource.get(this).resource('Admin:getAllRetailers')
    .then(retailers => {
      this.safeData.retailers = retailers.map(retailer => {
        return {
          name: retailer.name,
          _id: retailer._id
        };
      });
    });
  }

  /**
   * Get all customers
   */
  getCustomerList() {
    return Resource.get(this).resource('Admin:getAllCustomers')
      .then(customers => {
        this.safeData.customers = customers.map(customer => {
          return {
            name: customer.fullName,
            _id: customer._id
          };
        });
      });
  }

  /**
   * Get list of batches
   */
  getBatchList() {
    return Resource.get(this).resource('Admin:getAllBatches')
      .then(batches => {
        this.safeData.batches = batches.map(batch => {
          return {
            name: batch.batchId.toString(),
            _id: batch._id
          };
        });
      });
  }

  /**
   * Get list of users
   */
  getUsersList() {
    return Resource.get(this).resource('Admin:getAllUsers')
      .then(users => {
        this.safeData.users = users.map(user => {
          return {
            name: user.fullName,
            _id: user._id
          };
        });
      });
  }

  /**
   * Retrieve params in range for dropdowns
   */
  getParamsInRange() {
    return Resource.get(this).resource('Admin:getParamsInRange', this.getDateParams(true))
      .then(params => {
        this.displayData.params.batches = params.batches;
        this.displayData.params.companies = params.companies;
        this.displayData.params.stores = params.stores;
      });
  }

  /**
   * Get selected rows
   */
  getSelectedInventories() {
    return _.map(this.displayData.selectedRows, (selected, id) => {
      if (selected) {
        return id;
      }
    }).filter(row => row);
  }

  /**
   * Reject selected cards
   */
  rejectCards() {
    return Resource.get(this).resource('Admin:rejectCards', {inventories: this.getSelectedInventories()})
  }

  /**
   * Resell selected cards
   */
  resellCards() {
    return Resource.get(this).resource('Admin:resellCards', {inventories: this.getSelectedInventories()})
  }

  /**
   * Add deduction to selected cards
   */
  addDeduction() {
    const selectedInventory = Object.keys(this.displayData.selectedRows)[0];
    return Resource.get(this).resource('Admin:addDeduction', {ach: this.displayData.deductionValue, inventory: selectedInventory});
  }

  /**
   * Get stores for a company
   * @param companyId
   */
  getStores(companyId) {
    return Resource.get(this).resource('Store:getStores', {companyId});
  }

  /**
   * Download a CSV sheet for sales to a specific SMP
   * @param query Params
   * @param smp SMP
   */
  downloadCsvSheet(query, smp) {
    const dateRange = this.getDateParams(dateRange);
    return Resource.get(this).resource('Admin:getAllActivityRevised', {
      dateRange,
      query,
      smp,
      csv: true
    })
    .then(res => {
      triggerDownload.get(this).triggerDownload(res.url);
    });
  }

  /**
   * Recalculate transaction values
   * @param inventories
   */
  recalculateTransactionValues(inventories) {
    return Resource.get(this).resource('Admin:recalculateTransactionValues', {inventories});
  }

  /**
   * Sends cqPaymentInitiated callback for each inventory
   * @param inventories
   * @param type Callback type
   * @param force Send even if previously sent
   */
  sendCallback(inventories, type, force) {
    return Resource.get(this).resource('Admin:sendCallback', {inventories, type, force});
  }
}
