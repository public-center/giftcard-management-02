const Resource = new WeakMap();

export class ReceiptService {
  constructor(GcResource) {
    'ngInject';
    Resource.set(this, GcResource);

    this.displayData = {
      receipt: null,
      customer: null,
      total: 0,
      subTotal: 0,
      grandTotal: 0,
      rejectionTotal: 0,
      remainingDenials: 0,
      subtracted: 0
    };
  }

  /**
   * Get the current receipt
   * @param receiptId
   */
  getReceipt(receiptId) {
    return Resource.get(this).resource('Employee:getReceipt', receiptId)
      .then(receipt => {
        this.displayData.receipt = receipt;
        // If has a modified denial amout
        this.displayData.hasModifiedDenial = typeof receipt.modifiedDenialAmount === 'number';
        // Don't display default customer
        if (receipt.customer.firstName !== '__default__') {
          this.displayData.customer = receipt.customer;
        }
        let total = receipt.total;
        if (!total) {
          total = this.determineTotals(receipt);
        }
        this.displayData.rejectionTotal = receipt.rejectionTotal;
        // Sale total
        this.displayData.total = total;
        this.displayData.grandTotal = total;
        // Customer owed money from previous rejections before this sale
        if (receipt.rejectionTotal) {
          this.displayData.rejectionTotal = receipt.rejectionTotal;
          this.displayData.grandTotal = receipt.grandTotal;
          this.displayData.remainingDenials = receipt.rejectionTotal - receipt.appliedTowardsDenials;
          // Values from DB
          if (receipt.appliedTowardsDenials) {
            this.displayData.subtracted = receipt.appliedTowardsDenials;
          // Determine amount for denials
          } else if (receipt.rejectionTotal) {
            const modifiedDenials = receipt.modifiedDenialAmount;
            const rejectionTotal = receipt.rejectionTotal;
            let appliedTowardsDenials = 0;
            // Apply modified amount
            if (modifiedDenials) {
              appliedTowardsDenials = modifiedDenials;
              // Apply full amount
            } else if (rejectionTotal >= total) {
              appliedTowardsDenials = total;
              // All denials paid, but receipt is higher value
            } else {
              appliedTowardsDenials = rejectionTotal;
            }
            // Amount applied towards denials
            this.displayData.subtracted = appliedTowardsDenials;
            this.displayData.grandTotal = total - appliedTowardsDenials;
            this.displayData.remainingDenials = receipt.rejectionTotal - appliedTowardsDenials;
          }
        }
      });
  }

  /**
   * Determine totals for cards in this receipt
   * @param receipt
   */
  determineTotals(receipt) {
    let total = 0;
    receipt.inventories.forEach(inventory => {
      total += inventory.buyAmount;
    });
    return total;
  }
}
