import ResourceBase from './ResourceBase';
import moment from 'moment';

export default class SupplierCompany extends ResourceBase {
  /**
   * Expose the $resource service
   * @param $resource
   */
  constructor($resource) {
    super($resource);
  }

  /**
   * Get all supplier companies
   */
  getAll() {
    return this.query('api/companies');
  }

  /**
   * Create a new supplier company
   * @param params
   */
  create(params) {
    return this.post(`api/companies/create`, {}, params);
  }

  /**
   * Set API as accessible/inaccessible
   * @param params
   */
  setApi(params) {
    const {company, api} = params;
    return this.post(`api/companies/${company._id}/api/${api}`);
  }

  /**
   * Get a company
   * @param params
   */
  getCompany(params) {
    return this.get(`api/companies/${params.companyId}`);
  }

  /**
   * Update company settings
   * @param params
   */
  updateCompany(params) {
    return this.put(`api/companies/${params.companyId}`, {}, params);
  }

  /**
   * Get the currently selected store for corporate admins
   * @param params companyId and storeId
   */
  getStore(params) {
    return this.get(`api/companies/${params.companyId}/store/${params.storeId}`);
  }

  /**
   * Toggle managers set buy rates for a company
   */
  changeCompanySettings(params) {
    return this.post(`api/companies/${params.companyId}/settings`, {}, params.newSetting);
  }

  /**
   * Save a company's auto-buy rates
   */
  saveAutoBuyRates(params) {
    return this.post(`api/companies/${params.companyId}/settings/autoBuyRates`, {}, params.rates);
  }

  /**
   * Attempt manager override
   * @param params
   */
  managerOverride(params) {
    return this.post(`api/companies/${params.companyId}/managerOverride`, {}, params);
  }

  /**
   * Sell a card which is not auto-sold
   * @param params
   */
  sellCard(params) {
    return this.post(`api/companies/${params.companyId}/store/${params.storeId}/inventory/${params.inventoryId}/sell`, {},
      params);
  }

  /**
   * Get activity for a company
   */
  getActivity(params) {
    const paramLength = Object.keys(params).length;
    // Both begin and end date
    if (paramLength === 3) {
      return this.get(`api/companies/company/${params.companyId}/activity/begin/${params.dateBegin}/end/${params.dateEnd}`);
      // Single date value
    } else if (paramLength === 2) {
      if (params.dateBegin) {
        return this.get(`api/companies/company/${params.companyId}/activity/begin/${params.dateBegin}`);
      } else if (params.dateEnd) {
        return this.get(`api/companies/company/${params.companyId}/activity/end/${params.dateEnd}`);
      }
    } else {
      return this.get(`api/companies/company/${params.companyId}/activity/all`);
    }
  }

  /**
   * Get all activity (admin revised)
   */
  getAllActivityRevised(params) {
    const dateRange = params.dateRange;
    let uriParams = '?';
    let offset = 0;
    let dateBegin = dateRange.dateBegin;
    let dateEnd = dateRange.dateEnd;
    let perPage = dateRange.perPage;
    // Create query params
    if (params.query) {
      uriParams += this.createQueryParams(params.query.search.predicateObject);
      uriParams += this.createQueryParams(params.query.sort, true);
      // uriParams += this.createQueryParams(params);
      offset = params.query.start || 0;
    }
    if (params.isDenials) {
      uriParams = uriParams ? uriParams + '&rejected=true' : '?rejected=true';
    }
    // Query single customer
    if (params.customer) {
      uriParams = uriParams ? uriParams + `&customer=${params.customer}` : `?customer=${params.customer}`;
    }
    if (uriParams) {
      uriParams = uriParams ? uriParams + `&companyId=${params.companyId}` : `?companyId=${params.companyId}`;
    }
    if (params.isTransactions) {
      uriParams = uriParams ? uriParams + `&isTransactions=${params.isTransactions}` : ``;
    }
    // If querying rejections for one customer, sort by rejection date desc
    if (params.customer && params.isDenials) {
      uriParams += '&sort=rejectedDate:-1';
      dateBegin = moment().subtract(10, 'years').format('MM-DD-YYYY');
      dateEnd = null;
      perPage = 100000;
    }
    // Download as CSV
    if (params.csv) {
      uriParams = uriParams + `&csvSmp=corporate`;
    }
    if (!dateBegin) {
      dateBegin = '01-01-2000';
    }
    if (!dateEnd) {
      dateEnd = '01-01-3000';
    }
    return this.get(
      `api/companies/activity/begin/${dateBegin}/end/${dateEnd}/${perPage}/${offset}${uriParams}`);
  }

  /**
   * Create query params for performing a search
   * @param searchParams
   * @param sort
   */
  createQueryParams(searchParams, sort = false) {
    if (!searchParams) {
      return '';
    }
    // Sorting
    if (sort && searchParams.predicate && typeof searchParams.reverse === 'boolean') {
      return `&sort=${searchParams.predicate}:${searchParams.reverse ? -1 : 1}`;
    }
    return Object.keys(searchParams).map(k => k + '=' + encodeURIComponent(searchParams[k])).join('&');
  }

  /**
   * Get batches in a date range
   * @param params
   */
  getParamsInRange(params) {
    let finalParams = this.createQueryParams(params.dateRange);
    finalParams = finalParams ? finalParams + `&companyId=${params.companyId}` : `?companyId=${params.companyId}`;
    return this.get(`api/companies/activity/getParamsInRange?${finalParams}`);
  }

  /**
   * Set inventory value
   * @param params
   */
  setInventoryValue(params) {
    return this.post(`api/card/company/${params.companyId}/edit/setCardValue`, {}, params);
  }

  /**
   * Mass update inventories
   * @param params
   */
  massUpdateInventories(params) {
    return this.post(`api/card/company/${params.companyId}/massUpdate`, {}, params);
  }

  /**
   * Get receipts for a company
   * @param params
   */
  getReceipts(params) {
    return this.get(`api/companies/${params.companyId}/receipts/${params.perPage}/${params.offset}`);
  }

  /**
   * Get cards in inventory
   * @param params
   */
  getCardsInInventory(params) {
    return this.query(
      `api/companies/${params.companyId}/inventory`);
  }
}
