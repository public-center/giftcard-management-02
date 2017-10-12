const Resource = new WeakMap();
const timeout = new WeakMap();

export const newRetailerInterface = {
  name: "",
  gsId: "",
  imageUrl: "",
  smpType: {
    cardCash: 'electronic',
    cardPool: 'electronic',
    giftcardZen: 'electronic'
  },
  sellRates: {
    cardCash: "",
    cardPool: "",
    giftcardZen: ""
  },
  smpMaxMin: {
    cardCash: {
      max: null,
      min: null
    },
    cardPool: {
      max: null,
      min: null
    },
    giftcardZen: {
      max: null,
      min: null
    }
  }
};
/**
 * BI ID service
 */
export class BiIdService {
  constructor(GcResource, $timeout) {
    'ngInject';
    Resource.set(this, GcResource);
    timeout.set(this, $timeout);
    this.displayData = {
      saveResult: "",
      retailers: [],
      // New retailer
      new: {},
      retailer: Object.assign({}, newRetailerInterface),
      saveNewRetailerText: 'Create new retailer',
      valid: true,
      selected: [],
      companies: [],
      currentlyDisabled: []
    };
    this.safeData = {
      companies: []
    };
  }

  /**
   * Get GCMGR retailers
   */
  getRetailers() {
    return Resource.get(this).resource('Admin:getAllRetailers')
      .then(res => {
        this.displayData.retailers = res;
      });
  }

  /**
   * Change GiftSquirrel ID
   */
  changeGsId(retailer) {
    return Resource.get(this).resource('Admin:changeSqId', {retailer});
  }

  /**
   * Sync retailers with BI
   */
  sync() {
    return Resource.get(this).resource('Admin:syncWithBi');
  }

  /**
   * Create new retailer like an old one
   * @return {*}
   */
  newRetailerLikeOld() {
    return Resource.get(this).resource('Admin:newRetailerLikeOld', {
      retailer: this.displayData.new
    });
  }

  /**
   * Get company list for disabling
   */
  getCompanyList() {
    return Resource.get(this).resource('SupplierCompany:getAll')
      .then(companies => {
        this.safeData.companies = companies.map(company => {
          return {
            name: company.name,
            _id: company._id,
            disabled: company.disabledRetailers
          };
        });
      });
  }

  /**
   * Disable retailers for a company
   * @param company Company
   * @param retailers Array of retailer IDs
   */
  doDisableRetailer(company, retailers) {
    return Resource.get(this).resource('Admin:toggleDisableForCompany', {
      company,
      retailers
    });
  }

  /**
   * Create retailer
   */
  createRetailer(retailerObject) {
    return Resource.get(this).resource('Admin:createRetailer', retailerObject);
  }
}
