const Resource = new WeakMap();
/**
 * Denials by customer service
 */
export class CustomerDenialsService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);

    // Rates
    this.displayData = {
      customers: [],
      customersSafe: [],
      perPage: 20
    };
  }

  /**
   * Retrieve all supplier companies
   */
  getAll() {
    return Resource.get(this).resource('Admin:getAllCustomersWithDenials')
    .then(res => {
      this.displayData.customersSafe = res.customers;
    });
  }

  /**
   * Update total for a customer
   * @param record
   */
  updateTotal(record) {
    return Resource.get(this).resource('Admin:updateCustomerDenialTotal', {
      newTotal: record.newTotal,
      _id: record._id
    })
    .then(customer => {
      this.displayData.customersSafe = this.displayData.customersSafe.map(thisCustomer => {
        if (thisCustomer._id === customer._id) {
          thisCustomer.rejectionTotal = customer.rejectionTotal;
        }
        return thisCustomer;
      });
    });
  }
}
