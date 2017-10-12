const Resource = new WeakMap();
/**
 * Basic supplier company service
 */
export class AdminSettingsRatesService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);

    // Rates
    this.displayData = {
      rates: [],
      ratesSafe: [],
      perPage: 20
    };
    // Changed rates
    this.recordChanges = {
      cardcash: {},
      saveya: {},
      cardpool: {},
      giftcardrescue: {}
    };
    // Spelling change
    this.spellingChange = {
      cardcash: {},
      saveya: {},
      cardpool: {},
      giftcardrescue: {}
    };
  }

  /**
   * Retrieve all supplier companies
   */
  getAll() {
    return Resource.get(this).resource('Admin:getAllRates')
    .then((res) => {
      this.displayData.ratesSafe = res.retailers;
    });
  }

  /**
   * Upload CC rates document
   * @param params
   */
  uploadCcRatesDoc(params) {
    return Resource.get(this).resource('Admin:uploadCcRatesDoc', params);
  }

  /**
   * Upload CardPool rates or electronic/physical document
   * @param params
   */
  uploadCpDoc(params) {
    return Resource.get(this).resource('Admin:uploadCpDoc', params);
  }

  /**
   * Update a retailer type
   * @param params
   */
  setRetailerType(params) {
    return Resource.get(this).resource('Admin:setRetailerType', params);
  }

  /**
   * Set a property for a record
   * @param value New value
   * @param propPath Path to property to set
   * @param id Record ID
   */
  setProp(value, propPath, id) {
    return Resource.get(this).resource('Admin:setRetailerProp', {value, propPath, id})
    .then(res => {
      const isMerch = !!propPath[0].match(/Merch$/i);
      propPath[0] = isMerch ? propPath[0].substring(0, propPath[0].length - 'merch'.length) : propPath[0];

      if (propPath[0] === 'sellRates') {
        value = parseFloat(value);
        if (value > 1) {
          value = value / 100;
        }
      }
      this.displayData.ratesSafe.forEach((rate, index) => {
        if (rate._id === res._id && rate.smp === propPath[1] && rate.isMerch === isMerch) {
          if (propPath[0] === 'smpMaxMin') {
            this.displayData.ratesSafe[index][propPath[2]] = value;
          } else {
            this.displayData.ratesSafe[index][propPath[0]] = value;
          }
        }
      });
    });
  }
}
