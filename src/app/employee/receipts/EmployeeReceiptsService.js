const Resource = new WeakMap();
import moment from 'moment';
const auth = new WeakMap();
/**
 * Store receipt service
 */
export class EmployeeReceiptsService {
  constructor(GcResource, AuthService) {
    'ngInject';
    Resource.set(this, GcResource);
    auth.set(this, AuthService);
    this.displayData = {
      user: AuthService.user,
      // Per page
      perPage: "20",
      page: 5,
      totalPages: 1,
      currentPage: 1,
      // Total number of inventories in search range
      totalItems: 0,
      display: []
    };
    this.role = auth.get(this).user.role;
  }

  /**
   * Retrieve receipts this store
   */
  getReceipts(start, number) {
    let promise;
    // Corporate
    if (this.role === 'corporate-admin') {
      promise = Resource.get(this).resource('SupplierCompany:getReceipts', {
        companyId: auth.get(this).user.company._id,
        perPage: number,
        offset: start
      });
    // Store
    } else {
      promise = Resource.get(this).resource('Employee:getStoreReceipts', {
        storeId: auth.get(this).user.store._id
      });
    }
    return promise
    .then(receipts => {
      let data = receipts.data;
      data = data.map(receipt => {
        const inventories = receipt.inventories;
        receipt.created = moment(receipt.created).format('M/D/YYYY');
        receipt.customerName = receipt.customer.fullName;
        receipt.storeName = receipt.store ? receipt.store.name : '';
        receipt.totalSale = inventories.reduce((current, next) => {
          return current + next.buyAmount;
        }, 0);
        receipt.totalBalance = inventories.reduce((current, next) => {
          return current + next.balance;
        }, 0);
        return receipt;
      });

      const floatTotalPages = receipts.pagination.total/parseInt(this.displayData.perPage);

      this.displayData.display = data;
      this.displayData.totalItems = receipts.pagination.total;
      this.displayData.totalPages = Math.ceil(floatTotalPages);
    });
  }
}
