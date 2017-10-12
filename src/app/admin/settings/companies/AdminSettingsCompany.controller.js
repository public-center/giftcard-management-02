const Supplier = new WeakMap();
/**
 * Admin settings company controller
 *
 * We do not need the ID
 * All users will be in a store, unless they're admins at the corporate level
 * We need a corporate admin login which can access all of the stores
 * Then we need a store login that can't access corporate stuff, but the corporate level can access store level
 *
 * Need address, contact, phone number, eventually ACH information
 */
export class AdminSettingsCompanyController {
  constructor(NgTableParams, SupplierCompany) {
    'ngInject';
    Supplier.set(this, SupplierCompany);
    // Retrieve all supplier companies
    SupplierCompany.getAll()
    .then(() => {
      this.tableParams = new NgTableParams({
        page: 1,
        count: 20
      }, {
        filterDelay: 0,
        data: SupplierCompany.companies,
        counts: []
      });
    });
  }

  // Set an API as accessible or not accessible for a company
  setApi(company, api) {
    Supplier.get(this)
      .setApi(company, api)
      .then((apiResult) => {
        company.apis ? company.apis[api] = apiResult : company.apis = {[api]: apiResult};
      });
  }
}
