const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new Map();
const datePurchased = new WeakMap();
const loading = new WeakMap();
const compile = new WeakMap();
import moment from 'moment';
import _ from 'lodash';
/**
 * New admin activity
 */
export class AdminActivityNewController {
  constructor(AdminActivityNewService, $scope, $timeout, $loading, $compile) {
    'ngInject';
    // Loading
    loading.set(this, $loading);
    Service.set(this, AdminActivityNewService);
    scope.set(this, $scope);
    timeout.set(this, $timeout);
    datePurchased.set(this, null);
    compile.set(this, $compile);
    // Reference displayData
    this.displayData = AdminActivityNewService.displayData;
    this.safeData = AdminActivityNewService.safeData;
    $scope.displayData = {
      safe: [],
      display: [],
      perPage: this.displayData.perPage
    };
    // Set begin calendar to today
    this.setBeginCalendarToToday();
    this.setEndCalendarToTomorrow();
    // Current table state
    this.tableState = null;
    // Timer for typing
    this.timer = null;

    /**
     * Table pipe function
     * @param tableState Table state
     * @param ctrl Table controller
     */
    $scope.piper = (tableState, ctrl) => {
      // Assign variables
      if (!$scope.stCtrl && ctrl) {
        $scope.stCtrl = ctrl;
      }
      if (!tableState && $scope.stCtrl) {
        $scope.stCtrl.pipe();
        return;
      }
      // Pagination
      if (tableState && tableState.pagination) {
        tableState.start = tableState.pagination.start || 0;
        tableState.number = tableState.pagination.number || 10;
        tableState.pagination.numberOfPages = this.displayData.totalPages;
        tableState.pagination.totalItemCount = this.displayData.totalItems;
      }

      // Store state, compare previous and current state
      if (this.safeData.tableState && JSON.stringify(this.safeData.tableState) !== JSON.stringify(tableState)) {
        this.tableState = tableState;
      }

      if (this.safeData.tableState.start !== tableState.start) {
        // Check if the other attributes are the same. If not, then that means
        // the user isn't trying to navigate to a different result page.
        if (_.isEqual(
          _.omit(this.safeData.tableState, ['start', 'pagination.start']),
          _.omit(tableState, ['start', 'pagination.start'])
          )) {
          this.search(tableState);
        }
      }

      if (! _.isEqual(this.safeData.tableState.sort, tableState.sort)) {
        this.search(tableState);
      }

      this.safeData.tableState = angular.copy(tableState);
    };

    // Search retailer, customer, batches
    this.searchRetailers = this.searchGeneric('retailer');
    this.searchCustomers = this.searchGeneric('customer');
    this.searchBatch = this.searchGeneric('batch');
    this.searchUsers = this.searchGeneric('user');
    this.currentDate = new Date();
    this.search();
  }

  /**
   * Trigger a search and uses the current table state as the query params
   */
  search(tableState, selectedRows) {
    this.getActivityData(tableState || this.safeData.tableState, selectedRows);
  }

  /**
   * Expose table data
   */
  exposeTableData() {
    scope.get(this).displayData.safe = Service.get(this).activity;
    scope.get(this).displayData.display = [].concat(scope.get(this).displayData.safe);
    scope.get(this).displayData.perPage = Service.get(this).displayData.perPage;
  }

  /**
   * Set the begin calendar to today by default
   */
  setBeginCalendarToToday() {
    this.displayData.dateRange.dateBegin = moment().subtract(2, 'weeks').format('MM-DD-YYYY');
  }

  /**
   * Set the end calendar to tomorrow
   */
  setEndCalendarToTomorrow() {
    this.displayData.dateRange.dateEnd = moment().add(1, 'days').format('MM-DD-YYYY');
  }

  /**
   * Retrieve all activity data for date range
   */
  getActivityData(query, selectedRows) {
    loading.get(this).start('activity');
    return Service.get(this).getAll(query)
      .then(() => this.exposeTableData())
      .then(() => {
        const companies = {};
        // Clear selected
        this.displayData.selectedRows = selectedRows || {};
        // Set no rows selected
        this.displayData.totalSelectedRows = 0;
        Service.get(this).activity.forEach(inventory => {
          // Status
          if (inventory && inventory.activityStatus) {
            this.displayData.statuses[inventory._id] = inventory.activityStatus;
          }
        });
        // Company totals
        this.displayData.companyTotals = companies;
      })
      .then(() => {
        timeout.get(this)(() => {
          scope.get(this).piper();
        });
      })
      .finally(() => {
        loading.get(this).finish('activity');
      });
  }

  /**
   * Jump to today on calendars
   */
  jumpToToday() {
    this.setBeginCalendarToToday();
    this.setEndCalendarToTomorrow();
  }

  /**
   * Show details of an inventory item
   * @param inventory
   */
  showDetails(inventory) {
    // Single update
    if (!Array.isArray(inventory)) {
      this.displayData.massUpdate = false;
      // Keep reference to current inventory
      this.currentInventory = inventory;
      // Card number and pin
      this.pin = inventory.card.pin;
      this.number = inventory.card.number;
      // CQ Paid
      this.cqPaid = inventory.cqPaid;
      // Smp Paid
      this.sold_for = inventory.sold_for;
      // Balance
      this.updatedBalance = inventory.balance;
      // Retailer
      this.retailerSearch = inventory.retailerName;
      // Customer search
      this.customerSearch = inventory.customer.fullName;
      this.retailerId = inventory.retailer._id;
      // Card SMP
      this.smpSelect = inventory.sold_to;
      // Allow to change SMP if not sold to saveya
      this.displayData.canChangeSmp = inventory.sold_to !== 'saveya';
      this.displayData.updateTitle = 'Modify Inventory';
      this.orderNumber = inventory.orderNumber;
      this.smpAch = inventory.smpAch;
      this.cqAch = inventory.cqAch;
      this.liquidationRate = inventory.liquidationRate;
      this.created = new Date(inventory.created);
      // Inventory is a transaction
      this.isTransaction = inventory.isTransaction;
      if (inventory.isTransaction && Array.isArray(inventory.transaction.callbacks)) {
        this.sentCallbacks = inventory.transaction.callbacks.join(', ');
      }
      // Mass update
    } else {
      this.displayData.massUpdateIds = inventory.map(thisInventory => {
        return thisInventory._id;
      });
      this.displayData.canChangeSmp = true;
      this.displayData.massUpdate = true;
      this.displayData.updateTitle = 'Mass Update Inventories';
    }
    scope.get(this).$broadcast('show-modal', 'inventory-details-new');
  }

  /**
   * Retrieve an inventory ID, or null if not in GCMGR
   */
  getInventory() {
    const ids = [];
    _.forEach(this.displayData.selectedRows, (selected, id) => {
      if (selected) {
        ids.push(id);
      }
    });
    if (ids.length === 1 && this.currentInventory) {
      return {
        _id: this.currentInventory._id
      };
    } else {
      return ids;
    }
  }

  /**
   * Modify an existing card
   */
  modifyCard() {
    Service.get(this).modifyCard({
      inventory: this.getInventory(),
      value: this.modifySelect
    })
    .then(() => {
      scope.get(this).$broadcast('hide-modal', 'inventory-details-new');
      Service.get(this).getAll();
    })
  }

  /**
   * Confirm delete inventory
   */
  deleteInventoryConfirm() {
    scope.get(this).$broadcast('show-modal', 'delete-inventory-confirm');
  }

  /**
   * Delete inventory
   */
  deleteInventory() {
    let inventories = this.getInventory();
    if (!Array.isArray(inventories)) {
      inventories = [inventories];
    }
    Service.get(this).deleteInventory(inventories)
    .then(() => {
      scope.get(this).$broadcast('hide-modal', 'delete-inventory-confirm');
      scope.get(this).$broadcast('hide-modal', 'inventory-details-new');
      // Re-query
      this.search();
    })
    .catch(() => {
      scope.get(this).$broadcast('hide-modal', 'delete-inventory-confirm');
      scope.get(this).$broadcast('hide-modal', 'inventory-details-new');
      scope.get(this).$broadcast('show-modal', 'delete-fail');
    });
  }

  /**
   * Change SMP that a card is sold to
   */
  changeCardDetails(type) {
    const ids = this.getInventory();
    const details = {
      ids: ids,
      [type]: this[type]
    };
    // Retailer
    if (type === 'retailer') {
      details.retailer = this.newRetailer;
    }
    // Customer
    if (type === 'customer') {
      details.customer = this.newCustomer;
    }
    // Batch
    if (type === 'batch') {
      details.batch = this.newBatch;
    }
    // User
    if (type === 'user') {
      details.user = this.newUser;
    }
    if (type === 'store') {
      details.store = this.updateStore.selectedStore;
    }
    Service.get(this).changeCardDetails(details)
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'update-card-success');
      if (!this.displayData.massUpdate) {
        this.search(null, this.displayData.selectedRows);
      }
    });
  }

  /**
   * Just prevent default, blah
   */
  preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Set verified balance for a card
   * @param params
   */
  setValue(params) {
    // cancel current request
    if (this.timer) {
      timeout.get(this).cancel(this.timer);
    }
    // Run request after a second
    this.timer = timeout.get(this)(() => {
      this.timer = null;
      Service.get(this).setInventoryValue(params.row, params.type);
    }, 500);
  }

  /**
   * Reset mass update
   */
  resetMassUpdate() {
    this.displayData.mass = {};
  }

  /**
   * Select a row
   * @param row
   */
  rowSelect(row) {
    this.displayData.selectedRows[row._id] = !this.displayData.selectedRows[row._id];
    // Set any rows selected
    this.displayData.totalSelectedRows = _.filter(this.displayData.selectedRows, row => row).length;
  }

  /**
   * Modify a single row
   * @param row
   */
  rowModify(row) {
    this.displayData.selectedRows = {};
    this.displayData.selectedRows[row._id] = true;
    // Set row selected flag
    this.displayData.totalSelectedRows = 1;
    scope.get(this).$broadcast('deselectAll', row._id);
    // Update store
    this.updateStore = {
      storeOptions: [],
      selectedStore: null
    };
    // Get stores this company
    Service.get(this).getStores(row.company._id)
    .then(stores => {
      this.updateStore.storeOptions = stores;
    });
    scope.get(this).$broadcast('show-modal', 'inventory-details-new');
    this.showDetails(row);
  }

  /**
   * Mass update the selected cards
   */
  massUpdate() {
    // Get selected rows
    const selected = this.getSelectedRows();
    // Find relevant inventories
    const rows = this.displayData.activity.filter(row => selected.indexOf(row._id) > -1);
    this.showDetails(rows);
  }

  /**
   * Select all rows
   */
  selectAll() {
    const dd = scope.get(this).displayData.display;

    for (let i = 0; i < dd.length; i++) {
      this.displayData.selectedRows[dd[i]._id] = true;
      scope.get(this).$broadcast('selectAll');
    }
    this.displayData.totalSelectedRows = dd.length;
  }

  /**
   * Displays total card selected
   * @returns {string}
   */
  totalCardsSelected() {
    let rowCount = 0;

    for (const key in this.displayData.selectedRows) {
      if (this.displayData.selectedRows.hasOwnProperty(key)) {
        if (this.displayData.selectedRows[key] === true) {
          rowCount++;
        }
      }
    }

    return rowCount > 1 ? rowCount.toString() +' Cards' : rowCount.toString() + ' Card';
  }

  /**
   * Deselect all rows
   */
  deselectAll() {
    scope.get(this).$broadcast('deselectAll', null);
    this.displayData.selectedRows = {};
    // Set no rows selected
    this.displayData.totalSelectedRows = 0;
  }

  /**
   * Display total cards in inventory or displayed total cards
   */
  totalCards(displayed){
    const dd = scope.get(this).displayData.display;
    return displayed === true ? dd.length : this.displayData.totalItems;
  }
  /**
   * Modify a card balance
   */
  modifyBalance() {
    if (!this.displayData.massUpdate) {
      Service.get(this).modifyBalance({
        balance: this.updatedBalance,
        cardId: this.getInventory()
      })
        .then(() => {
          this.search(null, this.displayData.selectedRows);
        });
    } else {
      Service.get(this).modifyBalance({
        balance: this.updatedBalance,
        ids: this.displayData.massUpdateIds
      })
    }
  }

  /**
   * Close mass update and retrieve data again
   */
  closeUpdate() {
    this.displayData.selectedRows = {};
    this.displayData.massUpdateIds = [];
    if (this.displayData.massUpdate) {
      this.search();
    }
  }

  /**
   * Search any type using backend data
   */
  searchGeneric(type) {
    const types = type === 'batch' ? 'batches' : type + 's';
    return () => {
      const searchQuery = new RegExp(this[type + 'Search'], 'i');
      this.displayData[types] = this.safeData[types].filter(record => searchQuery.test(record.name));
      if (this.displayData[types].length > 50) {
        this.displayData[types] = this.displayData[types].slice(0, 49);
      }
    };
  }

  /**
   * Change retailer
   */
  changeRetailer() {
    this.currentInventory.retailer = this.newRetailer;
    const newRetailer = this.safeData.retailers.filter(retailer => retailer._id === this.newRetailer);
    this.currentInventory.retailer_name = newRetailer[0].name;
    this.setValue({
      row: this.currentInventory,
      type: 'retailer'
    });
  }

  /**
   * Confirm reject card
   */
  confirmReject() {
    scope.get(this).$broadcast('show-modal', 'reject');
  }

  /**
   * Reject selected cards
   */
  rejectCards() {
    Service.get(this).rejectCards()
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'reject-success');
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'reject-fail');
    })
    .finally(() => {
      scope.get(this).$broadcast('hide-modal', 'reject');
    });
  }

  /**
   * Resell selected cards
   */
  resellSelected() {
    Service.get(this).resellCards()
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'resell-failed');
    });
  }

  /**
   * Add deductions to selected cards
   */
  addDeduction() {
    scope.get(this).$broadcast('show-modal', 'add-deduction');
  }

  /**
   * Do the actual deductions
   */
  doAddDeduction() {
    Service.get(this).addDeduction()
      .then(() => {
        scope.get(this).$broadcast('hide-modal', 'add-deduction');
      })
      .catch(response => {
        this.displayData.deductionError = response.data.error;
        scope.get(this).$broadcast('show-modal', 'add-deduction-fail');
      });
  }

  /**
   * Determine whether the deduction button should be enabled or disabled
   *
   * @return {Boolean}
   */
  enableDeductionButton() {
    if (this.displayData.totalSelectedRows === 1) {
      const id = Object.keys(this.displayData.selectedRows)[0];

      if (id) {
        const act = this.displayData.activity.find(act => {
          return act._id === id;
        });

        return act.rejected;
      }
    }

    return false;
  }

  /**
   * Download CSV sheet for a retailer
   */
  downloadCsvSheet(smp) {
    loading.get(this).start('activity');
    // Get CSV
    return Service.get(this).downloadCsvSheet(this.tableState, smp)
    .finally(() => loading.get(this).finish('activity'));
  }

  /**
   * Get selected rows
   * @return {Array}
   */
  getSelectedRows() {
    const inventories = [];
    const selected = this.displayData.selectedRows;
    _.forEach(selected, (v, k) => {
      if (v) {
        inventories.push(k);
      }
    });
    return inventories;
  }

  /**
   * Recalculate transaction values for each selected inventory
   */
  recalculateTransactionValues() {
    Service.get(this).recalculateTransactionValues(this.getSelectedRows())
    .then(res => {
      scope.get(this).$broadcast('show-modal', 'inventory-details-new');
    })
    .catch(err => {
      if (err.data && err.data.err) {
        this.transactionError = err.data.err;
      }
      scope.get(this).$broadcast('show-modal', 'update-card-fail');
    });
  }

  /**
   * Send a cqPaymentInitiated callback
   */
  sendCallbackFromActivity(type = 'cqPaymentInitiated', force = false) {
    Service.get(this).sendCallback(this.getSelectedRows(), type, force)
    .then(res => {
      scope.get(this).$broadcast('show-modal', 'callback-success');
    })
    .catch(err => {
      scope.get(this).$broadcast('show-modal', 'callback-fail');
    });
  }

  /**
   * Show email form for sending denial/remittance emails
   */
  showEmailForm() {
    // Get inventories to be used in creating the email
    const inventoryIds = this.getSelectedRows();
    this.calculateAch(this.displayData.activity.filter(i => inventoryIds.indexOf(i._id) > -1));
    const directive = this.displayData.emailType;
    // Container for holding the email template html
    const container = angular.element('#email-template-container');
    const emailHtml = compile.get(this)(`<${directive} ctrl="activityCtrl"></${directive}>`)(scope.get(this));
    container.html(emailHtml);
    // Display
    scope.get(this).$broadcast('hide-modal', 'inventory-details-new');
    scope.get(this).$broadcast('show-modal', 'send-email', true);
  }

  calculateAch(inventoriesForEmail) {
    const cqAchs = {};
    const rejectsByAch = {};
    this.inventoriesByAch = {};
    inventoriesForEmail.forEach(i => {
      if (i.cqAch) {
        // First encounter of this ACH
        if (!cqAchs[i.cqAch]) {
          cqAchs[i.cqAch] = this.getNetAmount(i);
          rejectsByAch[i.cqAch] = this.getDenials(i);
          this.inventoriesByAch[i.cqAch] = [i];
        } else {
          cqAchs[i.cqAch] = cqAchs[i.cqAch] + this.getNetAmount(i);
          rejectsByAch[i.cqAch] += this.getDenials(i);
          this.inventoriesByAch[i.cqAch].push(i);
        }
      }
    });
    // Convert to an array so we can iterate
    this.cqAchArray = [];
    _.forEach(cqAchs, (v, k) => {
      this.cqAchArray.push({achNumber: k, achValue: v, denials: rejectsByAch[k]});
    });

    // Saving this for templates that don't care about ACH like denial
    this.inventoriesForEmail = inventoriesForEmail;
  }

  getDenials(i) {
    if (i.rejected) {
      return i.rejectAmount;
    }

    if (i.credited) {
      return i.creditAmount * -1;
    }

    return 0;
  }

  getNetAmount(inventory) {
    if (inventory.isTransaction) {
      return inventory.transaction.netPayout;
    }
    return inventory.netAmount;
  }

  sendAccountingEmail() {
    // Get the active mail directive
    const dir = angular.element('#email-template-container').children().eq(0);
    const body = dir.html();
    let companyId;
    try {
      this.inventoriesForEmail.forEach(i => {
        if (! companyId) {
          companyId = i.company._id;
        } else {
          if (companyId !== i.company._id) {
            throw new Error('COMPANY_ID_MISMATCH');
          }
        }
      });
    } catch (ex) {
      if (ex.message === 'COMPANY_ID_MISMATCH') {
        // Show error message
        scope.get(this).$broadcast('show-modal', 'send-email-company-mismatch');
        scope.get(this).$broadcast('hide-modal', 'send-email');
      }

      return;
    }

    if (! companyId) {
      // whoa what
      return;
    }

    Service.get(this).sendAccountingEmail(this.displayData.emailType, companyId, body).then(() => {
      scope.get(this).$broadcast('show-modal', 'send-email-success');
      scope.get(this).$broadcast('hide-modal', 'send-email');
    }).catch(() => {
      scope.get(this).$broadcast('show-modal', 'send-email-fail');
    });
  }

  sumAchs(achs) {
    return achs.reduce((a, b) => {
      return a + b.achValue;
    }, 0);
  }

  getStoreNames(inventories) {
    const stores = {};
    inventories.forEach(inventory => {
      if (inventory.store) {
        stores[inventory.store._id] = inventory.store.name;
      }
    });

    return Object.values(stores).join(',');
  }
}
