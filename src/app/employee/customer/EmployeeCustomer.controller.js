import moment from 'moment';

const Service = new WeakMap();
const state = new WeakMap();
const scope = new WeakMap();
const states = new WeakMap();
const timeout = new WeakMap();
const employee = new WeakMap();
const Auth = new WeakMap();
const corpSettings = new WeakMap();
const User = new WeakMap();
/**
 * Employee customer controller
 *
 * UID should be our ID long term
 * We should display phone number and verification URL when we perform searches for cards
 * Searches should be performed as cards are entered
 * Update DB to the CQ Master Retailer List google doc
 * If we don't get a balance back, we want to let the user enter the balance manually
 *
 * When selling gift cards, for each card, currently a minimum of $20 and a max of $300 (balance, not what we're buying/selling)
 */
export class EmployeeCustomerController {
  constructor(EmployeeCustomerService, $state, $scope, $timeout, States, Employee, AuthService, CorpService, user) {
    'ngInject';
    // Make sure we have a store if accessing as corporate admin
    this.selectedStore = null;
    Service.set(this, EmployeeCustomerService);
    // Expose customer search results
    this.displayData = EmployeeCustomerService.displayData;
    state.set(this, $state);
    scope.set(this, $scope);
    states.set(this, States);
    timeout.set(this, $timeout);
    employee.set(this, Employee);
    Auth.set(this, AuthService);
    corpSettings.set(this, CorpService);
    User.set(this, user);
    // States for dropdown
    this.states = States.states;
    // See if creating a new customer (I don't think this is commented correctly)
    this.watchNewCustomerCreation();
    // Search if the user stops typing for one second
    this.searchOnStopTyping();
    // Make sure to clear the form when a new customer is created
    this.clearCustomerFormOnLoad();

    CorpService.getCompany(AuthService.user.company._id.toString()).then(() => {
      this.displayData.showAddCardsButton = !CorpService.displayData.company.settings.useAlternateGCMGR;

      if (AuthService.user.role === 'corporate-admin') {
        this.displayData.showAddCardsButton = true;
      }

      if ($state.current.name === 'main.employee.customer.new' && !this.displayData.showAddCardsButton) {
        $state.go('main.employee.customer');
      }
    });
  }

  /**
   * If the user quits typing for one second, perform customer search
   */
  searchOnStopTyping() {
    let timer;
    scope.get(this).$watch(() => this.customerName, newVal => {
      // Remove results if search is deleted
      if (!newVal) {
        this.displayData.customerResults = [];
        if (timer) {
          timeout.get(this).cancel(timer);
          timer = null;
        }
      }
      if (timer) {
        timeout.get(this).cancel(timer);
        timer = null;
      }
      timer = timeout.get(this)(() => {
        if (this.customerName) {
          this.searchCustomers();
        }
      }, 250);
    });
  }

  /**
   * Watch new customer creation form
   */
  watchNewCustomerCreation() {
    scope.get(this).$watch(() => state.get(this).current.name, newVal => {
      // Displaying customers
      this.newCustomer = ['main.employee.customer', 'main.corporate.customer'].indexOf(newVal) === -1;
      // Retrieve customer details if landing on a state displaying customer details
      if (/main.(employee|corporate).customer.(details|edit|intake)/.test(newVal)) {
        // Make sure we don't get the selected customer more than once
        if (this.displayData.selectedCustomer && this.displayData.selectedCustomer._id === state.get(this).params.customerId) {
          return;
        }
        this.getCustomer(state.get(this).params.customerId);
      }
    });
  }

  /**
   * Clear new customer form when transitioning to this state
   */
  clearCustomerFormOnLoad() {
    scope.get(this).$watch(() => state.get(this).current.name, (newVal, oldVal) => {
      if (/main.(employee|corporate).customer.new/.test(newVal) && /main.(employee|corporate).customer.new/.test(oldVal)) {
        this.displayData.newCustomer = {};
      }
    });
  }

  /**
   * Search existing customers
   */
  searchCustomers() {
    return Service.get(this).searchCustomers(this.customerName);
  }

  /**
   * Retrieve a customer's details
   * @param id Customer ID
   */
  getCustomer(id) {
    angular.forEach(this.displayData.customerResults, customer => {
      if (customer._id === id) {
        this.displayData.selectedCustomer = customer;
      }
    });
    // Format customer for display or editing
    Service.get(this).getCustomer(id)
    .then(() => {
      Service.get(this).formatSelectedCustomer(id, state.get(this), states.get(this));
    });
  }

  /**
   * Go to customer from view
   * @param id Customer ID
   */
  goToCustomer(id) {
    var stateTransition;
    if (Auth.get(this).user.role === 'corporate-admin') {
      stateTransition = state.get(this).go('main.corporate.customer.details', {customerId: id});
    } else {
      stateTransition = state.get(this).go('main.employee.customer.details', {customerId: id});
    }
    stateTransition.then(() => {
      this.getCustomer(id);
    });
  }

  /**
   * Update customer
   */
  updateCustomer() {
    return Service.get(this).updateCustomer()
      .then(() => {
        const url = Auth.get(this).user.role === 'corporate-admin' ? 'main.corporate.customer.details' : 'main.employee.customer.details';
        state.get(this).go(url, {customerId: state.get(this).params.customerId});
      });
  }

  /**
   * Register a new customer
   */
  registerNewCustomer() {
    // Set store for corporate admin
    if (User.get(this).role === 'corporate-admin') {
      this.selectedStore = corpSettings.get(this).displayData.selectedStore;
    }
    return Service.get(this).newCustomer(this.selectedStore)
      .then(() => {
        const url = Auth.get(this).user.role === 'corporate-admin' ? 'main.corporate.customer' : 'main.employee.customer';
        state.get(this).go(url);
      });
  }

  /**
   * Go to card intake, show denials if customer has denials
   */
  goToCardIntake() {
    let url;
    if (Auth.get(this).user.role === 'corporate-admin') {
      url = 'main.corporate.customer.intake-revised';
    } else {
      url = 'main.employee.customer.intake-revised';
    }
    if (this.displayData.rejectionTotal) {
      url = url + '.denials';
    }
    state.get(this).go(url, {customerId: this.displayData.selectedCustomer._id});
  }

  /**
   * Go to edit customer view
   */
  goToEditCustomer() {
    let url;
    if (Auth.get(this).user.role === 'corporate-admin') {
      url = 'main.corporate.customer.edit';
    } else {
      url = 'main.employee.customer.edit';
    }
    state.get(this).go(url, {customerId: this.displayData.selectedCustomer._id});
  }

  /**
   * Open cash payment modal
   */
  openCashPayment() {
    scope.get(this).$broadcast('show-modal', 'cash-payment');
  }

  /**
   * Cash payment
   */
  cashPayment() {
    // Disable button during processing
    this.displayData.cashPaymentsSubmitDisabled = true;
    const amount = parseFloat(this.displayData.denialCashPayment);
    const user = Auth.get(this).user;
    const storeId = user.role === 'corporate-admin' ? corpSettings.get(this).displayData.selectedStore : user.store._id;
    const params = {
      customerId: state.get(this).params.customerId,
      amount: amount,
      userTime: moment().format(),
      rejectionTotal: this.displayData.rejectionTotal,
      store: storeId,
      company: Auth.get(this).user.company._id
    };
    Service.get(this).cashPayment(params)
      .then(res => {
        const receiptUrl = Auth.get(this).user.role === 'corporate-admin' ? 'main.corporate.customer.receipt' :
                                  'main.employee.customer.receipt';
        state.get(this).go(receiptUrl, {receiptId: res.data._id});
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'cash-payment-fail');
      })
      .finally(() => {
        scope.get(this).$broadcast('hide-modal', 'cash-payment');
      });
  }

  /**
   * Make sure we have a value
   */
  cashPaymentDisableSubmit() {
    return !this.displayData.denialCashPayment || this.displayData.cashPaymentsSubmitDisabled;
  }
}
