const Resource = new WeakMap();
const auth = new WeakMap();
import moment from 'moment';
/**
 * Employee denials service
 */
export class EmployeeActivityService {
  constructor(GcResource, AuthService) {
    'ngInject';
    Resource.set(this, GcResource);
    auth.set(this, AuthService);

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
      tableState: false
    };

    // Display data
    this.displayData = {
      dateRange: {},
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
      // Search params for dropdowns
      params: {
        batches: [],
        companies: [],
        stores: [],
        retailers: []
      },
      smps: [
        {id: '1', name: 'saveya'},
        {id: '2', name: 'cardcash'},
        {id: '3', name: 'giftcardrescue'},
        {id: '4', name: 'cardpool'}
      ]
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
   * Sort denials and payment based on date of action
   * @param inventories Inventories and denials
   * @param desc Desc or asc
   */
  sortDenialsAndPayments(inventories, desc = true) {
    return inventories.sort((curr, next) => {
      const currDate = curr.dateRejected;
      const nextDate = next.dateRejected;
      if (currDate === nextDate) {
        return 0;
      }
      // Sort desc or asc
      if (desc) {
        return currDate < nextDate ? 1 : -1;
      }
      return currDate > nextDate ? 1 : -1;
    });
  }

  /**
   * Calculate running total for denials and payments
   * @param inventories Inventory/payment concat'ed array
   */
  calculateDenialRunningTotal(inventories) {
    let current = 0;
    return inventories.map(inventory => {
      if (inventory.isPayment) {
        current = current - inventory.amount;
      } else if (inventory.credited) {
        current = current - inventory.creditAmount;
      } else {
        current = current + inventory.rejectAmount;
      }
      inventory.rejectionRunningTotal = current;
      return inventory;
    });
  }

  /**
   * Create field to sort on for rejections
   * @param inventories
   * @return {*|Array}
   */
  createSortField(inventories) {
    return inventories.map(inventory => {
      inventory.dateRejected = inventory.isPayment ? inventory.created : inventory.rejectedDate;
      return inventory;
    });
  }

  /**
   * Manipulate inventories and payment to display nicely to show running total
   * @param inventories
   * @param payments
   * @return {*}
   */
  handleDenialView(inventories, payments) {
    // Combine inventories and denials
    payments = payments.map(payment => {
      payment.isPayment = true;
      return payment;
    });
    inventories = inventories.concat(payments);
    inventories = this.createSortField(inventories);
    // Sort asc for calculating totals, to start at the beginning
    inventories = this.sortDenialsAndPayments(inventories, false);
    inventories = this.calculateDenialRunningTotal(inventories);
    return this.sortDenialsAndPayments(inventories);
  }

  /**
   * Retrieve all supplier company activity or denials
   * @param query Query
   * @param isDenials Retrieve denials only
   * @param customer Customer ID if only getting denials one customer
   */
  getAll(query, isDenials = true, customer = null) {
    const dateRange = this.getDateParams();
    return Resource.get(this).resource(`SupplierCompany:getAllActivityRevised`, {
      dateRange,
      query,
      companyId: auth.get(this).user.company._id,
      isDenials,
      customer
    })
    .then(res => {
      let inventories = res.inventories;
      const payments = Array.isArray(res.payments) ? res.payments : null;
      // Combine payment and denials, include running total
      if (customer && isDenials) {
        inventories = this.handleDenialView(inventories, payments);
      }
      const meta = res.meta;
      this.activity = inventories;
      this.displayData.activity = inventories;
      this.displayData.totals.grandTotal = meta.totals;
      this.displayData.totals.pageTotal = meta.pageTotals;
      this.displayData.totalPages = meta.pages;
      this.displayData.totalItems = meta.total;
    })
    .then(() => {
      if (!this.safeData.retailers.length) {
        // Get list of retailers
        this.getRetailerList();
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
    return Resource.get(this).resource('SupplierCompany:setInventoryValue', {
      inventoryId: inventory.gcmgrData._id,
      status: inventory[type],
      type,
      companyId: auth.get(this).user.company._id
    });
  }

  /**
   * Mass update inventories
   * @param ids
   */
  massUpdate(ids) {
    return Resource.get(this).resource('SupplierCompany:massUpdateInventories', {
      ids,
      values: this.displayData.mass,
      companyId: auth.get(this).user.company._id
    });
  }

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
   * Retrieve params in range for dropdowns
   */
  getParamsInRange() {
    const dateRange = this.getDateParams(true);
    const companyId = auth.get(this).user.company._id;
    return Resource.get(this).resource('SupplierCompany:getParamsInRange', {
      dateRange, companyId
    })
    .then(params => {
      this.displayData.params.batches = params.batches;
      this.displayData.params.companies = params.companies;
      this.displayData.params.stores = params.stores;
    });
  }
}
