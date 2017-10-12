import ResourceBase from './ResourceBase';

export default class Admin extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    super($resource);
  }

  /**
   * Register a new user
   */
  users() {
    return this.query(`api/users`);
  }

  /**
   * Change a user's role
   */
  changeRole(params) {
    const {user, role} = params;
    return this.post(`api/users/${user._id}/role/${role}`);
  }

  /**
   * Retrieve a single user
   * @param params
   */
  getSingle(params) {
    return this.get(`api/users/${params.id}`);
  }

  /**
   * Update a single user
   * @param params
   */
  updateUser(params) {
    return this.put(`api/users/${params._id}`, {}, params);
  }

  /**
   * Delete user
   * @param params
   */
  deleteUser(params) {
    return this.delete(`api/users/${params._id}`);
  }

  /**
   * Search for existing companies
   * @param params
   */
  searchCompany(params) {
    return this.post(`api/companies`, {}, params);
  }

  /**
   * Retrieve all SMP rates
   */
  getAllRates() {
    return this.get('api/retailers/rates')
  }

  /**
   * Update rates from rates page
   */
  updateRates(newRates) {
    return this.post('api/retailers/rates/update', {}, newRates);
  }

  /**
   * Get retailer BI info
   */
  getBiInfo() {
    return this.get('api/retailers/biInfo')
  }

  /**
   * Update retailer BI info
   */
  updateBiInfo(params) {
    return this.post('api/retailers/biInfo', {}, params);
  }

  /**
   * Download BI info
   */
  downloadBiInfo() {
    return this.get('api/retailers/biInfo/csv');
  }

  /**
   * Get all activity (admin)
   */
  getAllActivity(params) {
    const paramLength = Object.keys(params).length;
    // Both begin and end date
    if (paramLength === 2) {
      return this.get(`api/companies/activity/begin/${params.dateBegin}/end/${params.dateEnd}`);
      // Single date value
    } else if (paramLength === 1) {
      if (params.dateBegin) {
        return this.get(`api/companies/activity/begin/${params.dateBegin}`);
      } else if (params.dateEnd) {
        return this.get(`api/companies/activity/end/${params.dateEnd}`);
      }
    } else {
      return this.get('api/companies/activity/all');
    }
  }

  /**
   * Create query params for performing a search
   * @param searchParams
   */
  createQueryParams(searchParams) {
    if (!searchParams) {
      return '';
    }
    return Object.keys(searchParams).map(k => k + '=' + encodeURIComponent(searchParams[k])).join('&');
  }

  /**
   * Get all activity (admin revised)
   */
  getAllActivityRevised(params) {
    const dateRange = params.dateRange;
    let uriParams = '?';
    let offset = 0;
    // Create query params
    if (params.query) {
      uriParams += this.createQueryParams(params.query.search.predicateObject);
      offset = params.query.start || 0;

      if (params.query.sort.predicate) {
        uriParams += '&sort=' + params.query.sort.predicate + ':' + (params.query.sort.reverse ? -1 : 1);
      }
    }
    // Download as CSV
    if (params.csv) {
      uriParams = uriParams + `&csvSmp=${params.smp}`;
    }

    const paramLength = Object.keys(dateRange).length;
    // Both begin and end date
    if (paramLength === 4) {
      return this.get(
        `api/companies/activity/begin/${dateRange.dateBegin}/end/${dateRange.dateEnd}/${dateRange.perPage}/${offset}${uriParams}`);
      // Single date value
    } else if (paramLength === 3) {
      if (dateRange.dateBegin) {
        return this.get(`api/companies/activity/begin/${dateRange.dateBegin}/${dateRange.perPage}/${offset}${uriParams}`);
      } else if (dateRange.dateEnd) {
        return this.get(`api/companies/activity/end/${dateRange.dateEnd}/${dateRange.perPage}/${offset}${uriParams}`);
      }
    } else {
      return this.get(`api/companies/activity/all${uriParams}`);
    }
  }

  /**
   * Get batches in a date range
   * @param params
   */
  getParamsInRange(params) {
    return this.get(`api/companies/activity/getParamsInRange?${this.createQueryParams(params)}`);
  }

  /**
   * Modify an existing card
   */
  modifyCard(params) {
    return this.post('api/card/modify', {}, params);
  }

  /**
   * Change SMP, card number, or pin for a card in activity
   * @param params
   */
  changeCardDetails(params) {
    return this.post('api/card/updateDetails', {}, params);
  }

  /**
   * Update all sell rates in GC MGR DB from LQ API DB
   */
  updateRatesFromLQ() {
    return this.post('api/retailers/rates/updateFromLq');
  }

  /**
   * Delete an inventory
   * @param inventories
   */
  deleteCard(inventories) {
    return this.post(`api/companies/inventory/delete`, {}, inventories);
  }

  /**
   * Modify retailer by SMP
   */
  modifyRetailerSettingsBySmp(params) {
    return this.post('api/retailers/settings/smp/maxMin', {}, params);
  }

  /**
   * Upload CC rates
   * @param params Upload functionality and file object
   */
  uploadCcRatesDoc(params) {
    return params.upload.upload({
      url: `${this.url}/api/retailers/settings/cc/rates`,
      data: {ccRates: params.file}
    }).then(function () {
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    });
  }

  /**
   * Upload CardPool rates
   * @param params Upload functionality and file object
   */
  uploadCpDoc(params) {
    let url, data;
    // Rates
    if (params.type === 'cpRates') {
      url = `${this.url}/api/retailers/settings/cp/rates`;
      data = {cpRates: params.file};
    // Electronic/physical doc
    } else if (params.type === 'cpElectronicPhysical') {
      url = `${this.url}/api/retailers/settings/cp/electronicPhysical`;
      data = {cpElectronicPhysical: params.file};
    }
    return params.upload.upload({
      url,
      data
    }).then(function () {
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    });
  }

  /**
   * Upload Giftcard Rescue docs
   * @param params
   */
  uploadGcrRatesDocs(params) {
    return Promise.all([
      params.upload.upload({
        url: `${this.url}/api/retailers/settings/gcr/rates`,
        data: {rates: params.rates}
      })],
      params.upload.upload({
        url: `${this.url}/api/retailers/settings/gcr/electronic`,
        data: {electronic: params.electronic}
      }),
      params.upload.upload({
        url: `${this.url}/api/retailers/settings/gcr/physical`,
        data: {physical: params.physical}
      }))
  }

  /**
   * Retrieve a single company
   * @param params
   */
  getCompany(params) {
    return this.get(`api/companies/${params.companyId}`);
  }

  /**
   * Update a company
   * @param params
   */
  updateCompany(params) {
    return this.post(`api/companies/${params.companyId}`, {}, params.company);
  }

  /**
   * Set retailer type
   * @param params
   */
  setRetailerType(params) {
    return this.post(`api/retailers/setType`, {}, params);
  }

  /**
   * Create fake cards
   */
  createFakeCards(params) {
    return this.post(`api/card/fake`, {}, params);
  }

  /**
   * Set card statuses
   */
  setCardStatus(params) {
    return this.post(`api/admin/setCardStatus`, {}, params);
  }

  /**
   * Get all gcmgr retailers
   */
  getAllRetailers() {
    return this.query(`api/retailers/all`);
  }

  /**
   * Get all customers
   */
  getAllCustomers() {
    return this.query(`api/customers/all`);
  }

  /**
   * Get all batches
   */
  getAllBatches() {
    return this.query(`api/batches/all`);
  }

  /**
   * Get all users
   */
  getAllUsers() {
    return this.query(`api/users`);
  }

  /**
   * Change giftsquirrel ID
   */
  changeSqId(params) {
    return this.post(`api/retailers/${params.retailer._id}/gsId`, {}, {gsId: params.retailer.gsId});
  }

  /**
   * Upload cards doc
   * @param params Upload functionality and file object
   */
  uploadCards(params) {
    return params.upload.upload({
      url: `${this.url}/api/card/upload`,
      data: {
        file: params.file,
        customer: params.customer
      }
    }).then(function () {
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    });
  }

  /**
   * Upload fixes doc
   * @param params Upload functionality and file object
   */
  uploadFixes(params) {
    return params.upload.upload({
      url: `${this.url}/api/card/upload/fixes`,
      data: {
        file: params.file
      }
    }).then(function () {
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    });
  }

  /**
   * Run BI on cards on page
   * @param cards
   */
  runBi(cards) {
    return this.post(`api/card/runBi`, {}, cards);
  }

  /**
   * Move cards over to the Upload Sales customer for sale
   */
  moveCardsForSale(params) {
    return this.post(`api/card/moveForSale`, {}, params);
  }

  /**
   * Modify card balance
   * @param params
   */
  modifyCardBalance(params) {
    return this.post(`api/card/edit/balance`, {}, params);
  }

  /**
   * Set inventory value
   * @param params
   */
  setInventoryValue(params) {
    return this.post(`api/card/edit/setCardValue`, {}, params);
  }

  /**
   * Mass update inventories
   * @param params
   */
  massUpdateInventories(params) {
    return this.post(`api/card/massUpdate`, {}, params);
  }

  /**
   * Reject selected cards
   */
  rejectCards(params) {
    return this.post(`api/card/reject`, {}, params);
  }

  /**
   * Set retailer property
   * @param params
   */
  setRetailerProp(params) {
    return this.post(`api/retailers/${params.id}/setProp`, {}, params);
  }

  /**
   * Get stats sold on cards broken down by retailer
   */
  getRetailerStats() {
    return this.get(`api/retailers/salesStats`);
  }

  /**
   * Resell cards which have not already been sent to SMP to determine new best rates
   */
  resellCards(inventoryIds) {
    return this.post(`api/card/resell`, {}, inventoryIds);
  }

  /**
   * Get all customers with denials
   */
  getAllCustomersWithDenials() {
    return this.get(`api/customers/denials/all`);
  }

  /**
   * Update denial total for a customer
   */
  updateCustomerDenialTotal(params) {
    return this.post(`api/customers/denials/updateTotal`, {}, params);
  }

  /**
   * Sync retailers with BI
   */
  syncWithBi() {
    return this.post(`api/retailers/syncWithBi`);
  }

  /**
   * Create new retailer based on an old one
   */
  newRetailerLikeOld(params) {
    return this.post('api/retailers/createLike', {}, params)
  }

  /**
   * Disable retailers for a company
   */
  toggleDisableForCompany(params) {
    return this.post('api/retailers/toggleDisableForCompany', {}, params)
  }

  /**
   * Create retailer
   */
  createRetailer(params){
    return this.post('api/retailers/createRetailer', {}, params)
  }

  /**
   * Add deduction
   */
  addDeduction(params) {
    return this.post('api/admin/addDeduction', {}, params);
  }

  /**
   * Recalculate transaction values for an inventory
   */
  recalculateTransactionValues(params) {
    return this.post('api/admin/recalculate/transactions', {}, params);
  }

  /**
   * Send a transaction callback
   * @param params
   * @return {*}
   */
  sendCallback(params) {
    return this.put(`api/admin/callbacks/${params.type}`, {}, params);
  }

  /**
   * Send emails
   */
  sendAccountingEmail(params) {
    return this.post(`api/admin/sendAccountingEmail/${params.companyId}`, {}, params);
  }
}
