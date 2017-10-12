const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new WeakMap();
const state = new WeakMap();

import {newRetailerInterface} from './BiIdService';
/**
 * BI ID controller
 */
export class BiIdController {
  constructor(BiIdService, $scope, $timeout, $state) {
    'ngInject';
    Service.set(this, BiIdService);
    scope.set(this, $scope);
    state.set(this, $state);
    timeout.set(this, $timeout);
    $scope.displayData = {
      safe: [],
      retailers: [],
      perPage: 100
    };
    this.displayData = BiIdService.displayData;
    this.safeData = BiIdService.safeData;
    // Get all of the retailers
    this.getRetailers();
    // Get companies
    BiIdService.getCompanyList();
    // Revert save text
    this.displayData.saveNewRetailerText = 'Create new retailer';
    this.displayData.valid = true;
    this.displayData.new = {};
  }

  /**
   * Get all of the gcmgr retailers
   */
  getRetailers() {
    Service.get(this).getRetailers()
      .then(() => {
        scope.get(this).displayData.safe = this.displayData.retailers;
      });
  }

  /**
   * Change the giftsquirrel ID
   * @param retailer
   */
  changeGsId(retailer) {
    // Cancel search
    if (this.idTimer) {
      timeout.get(this).cancel(this.idTimer);
      this.idTimer = null;
    }
    this.idTimer = timeout.get(this)(() => {
      // Search for this query
      Service.get(this).changeGsId(retailer);
    }, 500);
  }

  /**
   * Generate an object for entry into the BI system
   */
  generateObject() {
    const retailers = this.displayData.retailers;
    const retailersWithGsId = retailers.filter(retailer => retailer.gsId);
    const retailerObject = {};
    console.log(retailersWithGsId);
    retailersWithGsId.forEach(retailer => {
      retailerObject[retailer.gsId] = {
        gsId: retailer.gsId.toString(),
        name: retailer.name
      }
    });
    console.log('**************END**********');
    console.log(angular.toJson(retailerObject));
  }

  /**
   * Sync with BI
   */
  sync() {
    Service.get(this).sync();
  }

  /**
   * Create new retailer like an old one
   */
  newRetailerLikeOld() {
    if (!this.displayData.new.name || !this.displayData.new.gsId) {
      this.displayData.saveNewRetailerText = 'Complete all fields.';
      this.displayData.valid = false;
      return;
    }
    Service.get(this).newRetailerLikeOld()
      .then(() => {
        state.get(this).go('main.admin.biIds');
      })
      .catch(() => {
        this.displayData.saveNewRetailerText = 'Failed to create. Check BI ID and try again.';
      });
  }

  /**
   * Select row
   * @param row
   */
  rowSelect(row) {
    const index = this.displayData.selected.indexOf(row._id);
    if (index !== -1) {
      this.displayData.selected.splice(index, 1);
    } else {
      this.displayData.selected.push(row._id);
    }
  }

  /**
   * Disable retailer
   */
  disableRetailerShow() {
    scope.get(this).$broadcast('show-modal', 'disable-retailer-for-company');
  }

  /**
   * Search any type using backend data
   */
  searchCompanies() {
    const searchQuery = new RegExp(this.companySearch, 'i');
    this.displayData.companies = this.safeData.companies.filter(record => searchQuery.test(record.name));
    if (this.displayData.companies.length > 50) {
      this.displayData.companies = this.displayData.companies.slice(0, 49);
    }
  }

  /**
   * Handle disable
   */
  disableForCompany() {
    Service.get(this).doDisableRetailer(this.selectedCompany, this.displayData.selected)
      .finally(() => {
        scope.get(this).$broadcast('hide-modal', 'disable-retailer-for-company');
      });
  }

  /**
   * Select a company to disable retailers
   */
  handleSelectCompany() {
    const thisCompany = this.displayData.companies.filter(
      company => company._id.toString() === this.selectedCompany)[0];
    this.displayData.currentlyDisabled = thisCompany.disabled;
  }

  /**
   * Show whether a company is disabled
   * @param row
   * @return {string}
   */
  isDisabledClass(row) {
    if (this.displayData.currentlyDisabled.indexOf(row) !== -1) {
      return 'rejected';
    }
  }

  /**
   * Create retailer
   */
  createRetailer() {
    let validURL = this.validateUrl(this.displayData.retailer.imageUrl);
    const retailer = this.displayData.retailer;
    // Rates
    const ccRate = parseFloat(retailer.sellRates.cardCash);
    const cpRate = parseFloat(retailer.sellRates.cardPool);
    const gczRate = parseFloat(retailer.sellRates.giftcardZen);
    // Invalid
    if (isNaN(ccRate) || isNaN(cpRate) || isNaN(gczRate)) {
      return alert('Please enter valid numbers for CardCash, CardPool, and GiftCardZen rates');
    }

    if (validURL) {
      Service.get(this).createRetailer(retailer).then(() => {
        // Reset values
        this.displayData.retailer = Object.assign({}, newRetailerInterface);
        window.location.reload();
      }).catch((res) => { alert(res.data.msg)});
    } else {
      alert('Please input a valid image URL');
    }
  }

  /**
   * Verify url
   */
  validateUrl(str) {
    if (str === "") {
      return true;
    } else {
      const urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
      return urlRegex.test(str);
    }
  }

  /**
   * Set card type for retailer
   */
  newRetailerSetCardType(smp, type) {
    this.displayData.retailer.smpType[smp] = type;
  }
}
