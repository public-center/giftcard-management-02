const Resource = new WeakMap();
const auth = new WeakMap();
const employeeActivityService = new WeakMap();
const triggerDownload = new WeakMap();
const timeout = new WeakMap();
import moment from 'moment';
/**
 * Corporate buy activity
 */
export class CorpActivityService {
  constructor(GcResource, AuthService, EmployeeActivityService, TriggerDownloadService, $timeout) {
    'ngInject';
    Resource.set(this, GcResource);
    auth.set(this, AuthService);
    employeeActivityService.set(this, EmployeeActivityService);
    triggerDownload.set(this, TriggerDownloadService);
    timeout.set(this, $timeout);
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
      ],
      company: auth.get(this).user.company
    };

    // Timeout for typing
    this.time = null;
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
   * Retrieve all supplier company activity or denials
   * @param query Params
   * @param isDenials Denials view
   * @param customer Customer specific denials view
   * @param isTransactions Retrieve transactions
   */
  getAll(query, isDenials = false, customer = null, isTransactions = false) {
    const dateRange = this.getDateParams();
    return Resource.get(this).resource(`SupplierCompany:getAllActivityRevised`, {
      dateRange,
      query,
      companyId: auth.get(this).user.company._id,
      isDenials,
      customer,
      isTransactions
    })
    .then(res => {
      let inventories = res.inventories;
      let payments = Array.isArray(res.payments) ? res.payments : null;
      // Combine inventories and denials
      payments = payments.map(payment => {
        payment.isPayment = true;
        return payment;
      });
      // Combine payment and denials, include running total
      if (customer && isDenials) {
        inventories = employeeActivityService.get(this).handleDenialView(inventories, payments);
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
   * @param transaction Value is for transaction
   */
  setInventoryValue(inventory, type, transaction = false) {
    const inventoryId = 'gcmgrData' in inventory ? inventory.gcmgrData._id : inventory._id;
    let status;
    status = transaction ? inventory.transaction[type] : inventory[type];
    const params = {
      inventoryId,
      type,
      companyId: auth.get(this).user.company._id,
      status,
      transaction
    };
    // cancel current request
    if (this.time) {
      timeout.get(this).cancel(this.time);
    }
    // Run request after a second
    this.time = timeout.get(this)(() => {
      this.time = null;
      return Resource.get(this).resource('SupplierCompany:setInventoryValue', params);
    }, 750);
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

  /**
   * Trigger download of currently displayed records
   * @param query Current query
   * @param isDenials Denials page
   */
  downloadCsvSheet(query, isDenials) {
    const dateRange = this.getDateParams(dateRange);
    return Resource.get(this).resource('SupplierCompany:getAllActivityRevised', {
      dateRange,
      query,
      companyId: auth.get(this).user.company._id,
      csv: true,
      isDenials
    })
    .then(res => {
      triggerDownload.get(this).triggerDownload(res.url);
    });
  }
}
