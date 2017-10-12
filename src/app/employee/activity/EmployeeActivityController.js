const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new Map();
const datePurchased = new WeakMap();
const state = new WeakMap();
import moment from 'moment';
import _ from 'lodash';
/**
 * Employee denials controller
 */
export class EmployeeActivityController {
  constructor(EmployeeActivityService, $scope, $timeout, $state, AuthService, CorpService) {
    'ngInject';
    Service.set(this, EmployeeActivityService);
    scope.set(this, $scope);
    timeout.set(this, $timeout);
    datePurchased.set(this, null);
    state.set(this, $state);
    const stateName = $state.current.name;
    const isCustomerDenial = stateName === 'main.employee.customer-denials';
    // Show only denials
    this.isDenials =
      stateName === 'main.employee.denials' || stateName === 'main.employee.customer.intake-revised.denials' ||
      isCustomerDenial;
    // Check if this is from intake page and showing denials
    this.isIntakeDenials = $state.current.name === 'main.employee.customer.intake-revised.denials';
    // Reference displayData
    this.displayData = EmployeeActivityService.displayData;
    this.safeData = EmployeeActivityService.safeData;
    $scope.displayData = {
      safe: [],
      display: [],
      perPage: isCustomerDenial ? 100000 : this.displayData.perPage
    };
    // Set begin calendar to today
    this.setBeginCalendarToToday();
    this.setEndCalendarToTomorrow();

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

    this.displayData.hideBuyRates = true;
    CorpService.getCompany(AuthService.user.company._id.toString()).then(() => {
      if (['manager', 'employee'].indexOf(AuthService.user.role) !== -1) {
        this.displayData.hideBuyRates = CorpService.displayData.company.settings.useAlternateGCMGR;

        if (this.displayData.hideBuyRates && this.isDenials) {
          $state.go('main.employee.activity');
          return;
        }
      } else {
        this.displayData.hideBuyRates = false;
      }
    });

    this.search();
  }

  /**
   * Trigger a search and uses the current table state as the query params
   */
  search(tableState) {
    this.getActivityData(tableState || this.safeData.tableState);
  }

  /**
   * Recalculate totals on filter
   */
  recalculateTotals(inventories) {
    this.filteredInventories = inventories.inventories;
    Service.get(this).calculateTotals(1, inventories.inventories);
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
    if (!this.isIntakeDenials && !this.isDenials) {
      this.displayData.dateRange.dateBegin = moment().subtract(2, 'weeks').format('MM-DD-YYYY');
    } else {
      this.displayData.dateRange.dateBegin = moment().subtract(10, 'years').format('MM-DD-YYYY');
    }
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
  getActivityData(query) {
    return Service.get(this).getAll(query, this.isDenials, state.get(this).params.customerId)
      .then(() => this.exposeTableData())
      .then(() => {
        const companies = {};
        // Clear selected
        this.displayData.selectedRows = {};
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
    if (ids.length === 1) {
      return {
        _id: this.currentInventory._id
      };
    } else {
      return ids;
    }
    try {
      return {
        _id: this.currentInventory._id
      };
    } catch (e) {
      return {
        number: this.currentInventory.card_number,
        pin: this.currentInventory.pin_code,
        retailer: this.currentInventory.retailer_id,
        balance: this.currentInventory.card_balance || 0.01,
        cqTransactionId: this.currentInventory.cq_transaction_id
      }
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
      scope.get(this).$broadcast('hide-modal', 'inventory-details');
      Service.get(this).getAll({}, this.isDenials);
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
      scope.get(this).$broadcast('hide-modal', 'inventory-details');
      // Re-query
      Service.get(this).getAll({}, this.isDenials);
    })
    .catch(() => {
      scope.get(this).$broadcast('hide-modal', 'delete-inventory-confirm');
      scope.get(this).$broadcast('hide-modal', 'inventory-details');
      scope.get(this).$broadcast('show-modal', 'delete-fail');
    });
  }

  /**
   * Change SMP that a card is sold to
   */
  changeCardDetails() {
    Service.get(this).changeCardDetails({
      inventory: this.getInventory(),
      smp: this.smpSelect,
      number: this.number,
      pin: this.pin
    })
    .then(() => {
      scope.get(this).$broadcast('show-modal', 'update-card-success');
      this.getActivityData();
    })
    .catch(err => {
      scope.get(this).$broadcast('show-modal', 'change-smp-fail');
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
   * Change page callback
   * @param page
   */
  changePage(page) {
    Service.get(this).calculateTotals(page.newPage);
  }

  /**
   * Set verified balance for a card
   * @param params
   */
  setValue(params) {
    Service.get(this).setInventoryValue(params.row, params.type);
  }

  /**
   * Mass update inventories
   */
  massUpdate() {
    let inventories;
    if (this.filteredInventories) {
      inventories = this.filteredInventories;
    } else {
      inventories = Service.get(this).activity;
    }
    const ids = inventories.map(inventory => inventory.gcmgrData ? inventory.gcmgrData._id : null).filter(a => a);
    Service.get(this).massUpdate(ids)
      .then(() => {
        this.displayData.activity = this.displayData.activity.map(inventory => {
          if (inventory.gcmgrData && ids.indexOf(inventory.gcmgrData._id) !== -1) {
            return Object.assign(inventory, this.displayData.mass);
          }
          return inventory;
        });
        this.exposeTableData();
        this.resetMassUpdate();
      })
      .then(() => {
        scope.get(this).$broadcast('show-modal', 'mass-update-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'mass-update-failure');
      })
      .finally(() => {
        scope.get(this).$broadcast('hide-modal', 'mass-update-confirm');
      });
  }

  /**
   * Reset mass update
   */
  resetMassUpdate() {
    this.displayData.mass = {};
  }

  /**
   * Confirm mass update
   */
  massUpdateConfirm() {
    scope.get(this).$broadcast('show-modal', 'mass-update-confirm');
  }

  /**
   * Go to customer denials
   * @param customer
   */
  goToCustomerDenials(customer) {
    state.get(this).go('main.employee.customer-denials', {customerId: customer.customerId});
  }
}
