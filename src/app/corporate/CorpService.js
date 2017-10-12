const Resource = new WeakMap();
/**
 * Update company service
 */
export class CorpService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);
    // Display data
    this.displayData = {
      stores: [],
      selectedStore: null,
      selectedState: null,
      company: null,
      alternativeGcmgr: false
    };
  }

  /**
   * Retrieve company profile
   */
  getCompany(companyId) {
    return Resource.get(this).resource('SupplierCompany:getCompany', {companyId})
    .then(company => {
      // Conver to whole numbers
      this.changeRateDisplayToNumbers(company);
      this.displayData.company = company;
    });
  }

  /**
   * Convert rate display from decimals to whole numbers
   * @param company
   */
  changeRateDisplayToNumbers(company) {
    angular.forEach(company.settings.autoBuyRates, (val, key) => {
      if (angular.isNumber(val)) {
        company.settings.autoBuyRates[key] = (val * 100).toFixed(2);
      }
    });
  }

  /**
   * Update company profile
   */
  updateProfile(companyId) {
    const displayCompany = this.displayData.company;
    const params = {
      companyId,
      name: displayCompany.name,
      address1: displayCompany.address1,
      address2: displayCompany.address2,
      city: displayCompany.city,
      state: displayCompany.state,
      zip: displayCompany.zip,
      url: displayCompany.url
    };
    return Resource.get(this).resource('SupplierCompany:updateCompany', params);
  }

  /**
   * Managers set buy rates
   * @param companyId
   * @param setting Setting to change
   * @param toggle Toggle a value, rather than set it explicitly
   */
  changeCompanySettings(companyId, setting, toggle = true) {
    let value;
    value = toggle ? !this.displayData.company.settings[setting] : this.displayData.company.settings[setting];
    const newSetting = {
      [setting]: value
    };
    return Resource.get(this).resource('SupplierCompany:changeCompanySettings', {companyId, newSetting})
      .then(company => {
        this.changeRateDisplayToNumbers(company);
        this.displayData.company = company;
      });
  }

  /**
   * Save auto-buy rates for this company
   */
  saveAutoBuyRates(companyId) {
    // Get rates, parse floats
    const rates = angular.copy(this.displayData.company.settings.autoBuyRates);
    angular.forEach(rates, (rate, key) => {
      // Only modify rates
      if (/_\d{2}/.test(key)) {
        rates[key] = parseFloat(rate);
      }
    });
    return Resource.get(this).resource('SupplierCompany:saveAutoBuyRates', {
        companyId,
        rates
      });
  }

  /**
   * Get stores for the corporate admin company
   */
  getStores(companyId) {
    return Resource.get(this).resource('Store:getStores', {companyId})
      .then(res => {
        this.displayData.stores = res;
      });
  }

  /**
   * Select store to use for corporate selling
   * @param storeId Store ID
   */
  changeStore(storeId) {
    this.displayData.selectedStore = storeId;
  }
}
