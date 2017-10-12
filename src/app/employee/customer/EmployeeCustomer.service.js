const Resource = new WeakMap();
/**
 * Employee customer service
 */
export class EmployeeCustomerService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    this.displayData = {
      customerResults: [],
      newCustomer: {
        // Just default a state
        state: {
          abbreviation: "AL",
          name: "Alabama"
        }
      },
      selectedCustomer: null,
      // Customer has pending rejections
      rejectionTotal: false,
      // Amount being paid in cash
      denialCashPayment: 0,
      // Allow new card addition
      showAddCardsButton: false
    };
  }

  /**
   * Search customer by name
   */
  searchCustomers(name) {
    return Resource.get(this).resource('Employee:searchCustomerByName', {name})
      .then(res => {
        res = res.filter(customer => {
          return customer.firstName !== '__default__';
        });
        this.displayData.customerResults = res;
      });
  }

  /**
   * Retrieve details about a specific customer
   */
  getCustomer(id) {
    this.displayData.rejectionTotal = false;
    return Resource.get(this).resource('Employee:getCustomer', id)
      .then(res => {
        // Check if customer has rejections
        if (res.rejectionTotal && res.rejectionTotal > 0) {
          this.displayData.rejectionTotal = res.rejectionTotal;
        }
        // Default customer
        if (res.defaultCustomer) {
          this.displayData.selectedCustomer = {
            default: true
          };
        } else if (!res._id) {
          throw 'Cannot find customer';
        } else {
          this.displayData.selectedCustomer = res;
        }
      });
  }

  /**
   * Format selected customer for display or editing
   * @param id
   * @param state $state
   * @param states States objects
   * @returns {*}
   */
  formatSelectedCustomer(id, state, states) {
    if (!this.displayData.selectedCustomer || this.displayData.selectedCustomer._id !== id) {
      return this.getCustomer(id)
        .then(() => {
          // If editing, replace state with state object
          if (state.current.name === 'main.employee.customer.edit') {
            this.displayData.selectedCustomer.state = states.states.map(state => {
              if (state.abbreviation === this.displayData.selectedCustomer.state) {
                return state;
              }
            }).filter(state => state)[0];
          } else {
            // replace with string
            if (angular.isObject(this.displayData.selectedCustomer.state)) {
              this.displayData.selectedCustomer.state = this.displayData.selectedCustomer.state.abbreviation;
            }
          }
        })
        .catch(() => {
          // If on default, redirect directly into the intake page
          if (state.params.customerId !== 'default') {
            // Redirect on not found
            state.go('main.employee.customer');
          }
        });
    }
  }

  /**
   * Update the selected customer
   */
  updateCustomer() {
    const customer = this.displayData.selectedCustomer;
    const updated = {
      firstName: customer.firstName,
      middleName: customer.middleName,
      lastName: customer.lastName,
      stateId: customer.stateId,
      phone: customer.phone,
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      state: customer.state.abbreviation,
      zip: customer.zip,
      _id: customer._id
    };
    return Resource.get(this).resource('Employee:updateCustomer', updated);
  }

  /**
   * Register a new customer
   */
  newCustomer(selectedStore) {
    const customer = this.displayData.newCustomer;
    if (selectedStore) {
      customer.store = selectedStore;
    }
    return Resource.get(this).resource('Employee:newCustomer', customer);
  }

  /**
   * Make a cash payment against denials
   */
  cashPayment(params) {
    return Resource.get(this).resource('Store:denialCashPayment', params);
  }
}
