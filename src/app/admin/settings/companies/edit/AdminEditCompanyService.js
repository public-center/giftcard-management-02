const Resource = new WeakMap();
/**
 * Company service
 */
export class AdminEditCompanyService {
  constructor(GcResource) {
    'ngInject';

    Resource.set(this, GcResource);

    // Display data
    this.displayData = {
      company: null
    };
  }

  /**
   * Retrieve the current company
   * @param companyId
   */
  getCompany(companyId) {
    return Resource.get(this).resource('Admin:getCompany', {companyId})
      .then((res) => {
        this.displayData.company = res;
      });
  }

  /**
   * Update the current company
   */
  update(companyId) {
    return Resource.get(this).resource('Admin:updateCompany', {
      company: {
        ...this.displayData.company,
        margin: this.displayData.company.settings.margin,
        useAlternateGCMGR: this.displayData.company.settings.useAlternateGCMGR,
        serviceFee: this.displayData.company.settings.serviceFee
      },
      companyId
    });
  }
}
