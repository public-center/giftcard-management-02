import ResourceBase from './ResourceBase';

/**
 * Handle store related API requests
 */
export default class Store extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    super($resource);
  }

  /**
   * Create a new store
   */
  newStore(params) {
    return this.post(`api/companies/${params.companyId}/store/new/`, {}, params);
  }

  /**
   * Retrieve stores for a company
   */
  getStores(params) {
    return this.query(`api/companies/${params.companyId}/store`);
  }

  /**
   * Retrieve employees at a company
   */
  getStoreDetails(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}`);
  }

  /**
   * Update a store's details
   * @param params
   */
  updateStoreDetails(params) {
    return this.put(`api/companies/${params.companyId}/store/${params.storeId}/update`, {}, params);
  }

  /**
   * Create a new employee
   */
  newEmployee(params) {
    return this.post(`api/companies/${params.companyId}/store/${params.storeId}/newEmployee`, {}, params);
  }

  /**
   * Delete store
   * @param params
   */
  deleteStore(params) {
    return this.delete(`api/companies/${params.companyId}/store/${params.storeId}`);
  }

  /**
   * Delete employee
   */
  deleteEmployee(params) {
    return this.delete(`api/companies/${params.companyId}/store/${params.storeId}/employee/${params.employeeId}`);
  }

  /**
   * Get store with buy rates
   */
  getStoreWithBuyRates(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/buyRates`);
  }

  /**
   * Update store buy rates for a retailer
   * @param params
   */
  updateBuyRate(params) {
    return this.put(`api/companies/${params.companyId}/store/${params.storeId}/buyRates/${params.retailerId}`, {}, params);
  }

  /**
   * Retrieve cards in inventory
   */
  getCardsInInventory(params) {
    return this.query(
      `api/companies/${params.companyId}/store/${params.storeId}/inventory`);
  }

  /**
   * Get cards currently in reconciliation
   */
  getCardsInReconciliation(params) {
    return this.query(`api/companies/${params.companyId}/store/${params.storeId}/reconciliation/current`);
  }

  /**
   * Get the last time this store was reconciled
   */
  getLastReconciliationDate(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/reconciliationTime`);
  }

  /**
   * Reconcile all waiting cards
   * @param params
   * @returns {*}
   */
  reconcile(params) {
    return this.post(`api/companies/${params.companyId}/store/${params.storeId}/reconcile`, {}, params);
  }

  /**
   * Retrieve denials since the last reconciliation time
   */
  getDenials(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/denials`);
  }

  /**
   * Delete inventory record
   * @param params
   */
  deleteInventory(params) {
    return this.delete(`api/companies/${params.companyId}/store/${params.storeId}/inventory/${params.inventory._id}`);
  }

  /**
   * Retrieve the last time reconciliation was completed
   * @param params
   * @returns {*}
   */
  getLastReconciliationCompleteDate(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/reconciliationCompleteTime`);
  }

  /**
   * Mark current items in reconciliation as reconciled
   * @param params
   */
  markAsReconciled(params) {
    return this.post(`api/companies/${params.companyId}/store/${params.storeId}/markAsReconciled`, {}, params);
  }

  /**
   * Retrieve reconciliations for today
   * @param params
   */
  getReconciliationToday(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}/reconciliationToday/${params.currentDate}`);
  }

  /**
   * Get store totals
   * @param params
   */
  getStoreTotals(params) {
    return this.get(`api/companies/${params.companyId}/storeTotals/${params.begin}/${params.end}`);
  }

  /**
   * Make a denial cash payment
   */
  denialCashPayment(params) {
    return this.post(`api/customers/${params.customerId}/denials/cashPayment`, {}, params);
  }
}
