const Resource = new WeakMap();
/**
 * Basic supplier company service
 */
export class SupplierCompany {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
  }

  /**
   * Retrieve all supplier companies
   */
  getAll() {
    return Resource.get(this).resource('SupplierCompany:getAll')
    .then((res) => {
      this.companies = res;
    });
  }

  /**
   * Set or deny access to an API
   * @param company
   * @param api
   */
  setApi(company, api) {
    return Resource.get(this).resource('SupplierCompany:setApi', {
        company,
        api
      })
      .then((res) => {
        this.companies = this.companies.map(thisCompany => {
          // Update role
          if (thisCompany._id === company._id) {
            thisCompany.apis ? thisCompany.apis[api] = res.access : thisCompany.apis = {[api]: res.access};
          }
          return thisCompany;
        });
        return res.access;
      });
  }

  /**
   * Retrieve settings for a company
   */
  getSettings(companyId) {
    return Resource.get(this).resource('SupplierCompany:getProfile', {companyId})
      //.then((res) => {
      //
      //});
  }
}
