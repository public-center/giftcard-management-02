import ResourceBase from './ResourceBase';

/**
 * Handle employee related API requests
 */
export default class Employee extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    super($resource);
  }

  /**
   * Retrieve employee details
   */
  employeeDetails(params) {
    return this.get(`api/users/${params.employeeId}`);
  }

  /**
   * Update employee details
   */
  update(params) {
    return this.put(`api/users/${params.employeeId}`, {}, params);
  }

  /**
   * Update employee role
   */
  updateRole(params){
    return this.put(`api/companies/${params.companyId}/employee/${params.employeeId}/${params.role}`)
  }
  /**
   * Retrieve available retailers for a store, along with the respective buy rates
   */
  getRetailers(params) {
    return this.query(`api/retailers/store/${params.storeId}/min/${params.minVal || 'All'}`);
  }

  /**
   * Download retailers as CSV
   */
  downloadRetailers(params) {
    return this.post(`api/retailers/store/${params.storeId}/min/${params.minVal || 'All'}/csv`);
  }

  /**
   * Search customer by name
   */
  searchCustomerByName(params) {
    return this.query(`api/customers/?name=${params.name}`);
  }

  /**
   * Retrieve all customers for a company
   * @param params
   */
  getAllCustomersThisCompany(params) {
    return this.query(`api/customers/company/${params.companyId}`);
  }

  /**
   * Retrieve customer by ID
   * @param id
   */
  getCustomer(id) {
    return this.get(`api/customers/${id}`);
  }

  newCustomer(params) {
    return this.post(`api/customers`, {}, params);
  }

  /**
   * Update a customer
   */
  updateCustomer(params) {
    const id = params._id;
    delete params._id;
    return this.post(`api/customers/${id}`, {}, params);
  }

  /**
   * Check a card's balance
   */
  checkBalance(card) {
    return this.post(`api/card/balance`, {}, card);
  }

  /**
   * Update card balance
   * @param card
   */
  updateCardBalance(card) {
    return this.post(`api/card/balance/update`, {}, card);
  }

  /**
   * Retrieve retailers for intaking a card
   */
  getRetailersForIntake(query) {
    return this.query(`api/retailers?query=${encodeURIComponent(query)}`);
  }

  /**
   * Input a new card
   */
  newCard(params) {
    return this.post(`api/card/newCard`, {}, params);
  }

  /**
   * Get cards on load
   */
  getCards(customerId) {
    return this.get(`api/card/${customerId}`);
  }

  /**
   * Get cards for receipts
   */
  getCardsForReceipts(customerId) {
    return this.get(`api/card/${customerId}/receipt`);
  }

  /**
   * Edit existing card
   */
  editCard(params) {
    return this.post(`api/card/edit`, {}, params);
  }

  /**
   * Delete a card
   * @param cardId
   */
  deleteCard(cardId) {
    return this.delete(`api/card/${cardId}`);
  }

  /**
   * Get buy rates for a store
   */
  getBuyRatesForStore(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/buyRates`);
  }

  /**
   * Add to inventory
   * @param params {cards, userTime}
   */
  addToInventory(params) {
    return this.post(`api/card/addToInventory`, {}, params);
  }

  /**
   * Assign a customer to a card
   * @param params
   */
  assignCustomer(params) {
    return this.post(`api/customers/assignCustomer`, {}, params);
  }

  /**
   * Get a receipt
   */
  getReceipt(receiptId) {
    return this.get(`api/receipt/${receiptId}`);
  }

  /**
   * Check if there is inventory which needs to be reconciled
   */
  checkInventoryNeedReconciled(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/checkInventoryNeedsReconciled`);
  }

  /**
   * Get receipts for a store
   * @param params
   */
  getStoreReceipts(params) {
    return this.get(`api/stores/${params.storeId}/receipts`);
  }
}
