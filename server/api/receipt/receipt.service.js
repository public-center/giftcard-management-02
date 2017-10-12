import Receipt from './receipt.model';

export default class ReceiptService {
  /**
   * Get receipts with inventories
   *
   * @param {Object} query
   * @param {{perPage: 20, offset: 0}} pagination
   * @return {Array}
   */
  async getReceipts(query = {}, pagination = {}) {
    if (!pagination.perPage) {
      pagination.perPage = 20;
    }

    if (!pagination.offset) {
      pagination.offset = 0;
    }

    const filter = this.getReceiptsBaseFilter(query);

    const receipts = await Receipt.find(filter).populate({
      path: 'inventories',
      populate: [{
        path: 'card',
        model: 'Card'
      }, {
        path: 'retailer',
        model: 'Retailer'
      }]
    })
    .populate('customer')
    .populate('store')
    .sort({created: -1})
    .limit(pagination.perPage)
    .skip(pagination.offset);

    return receipts;
  }

  /**
   * Count receipts with inventories
   *
   * @param {Object} query
   * @return {Number}
   */
  async getReceiptsCount(query = {}) {
    const filter = this.getReceiptsBaseFilter(query);

    return await Receipt.count(filter);
  }

  /**
   * Converts query input into a filter appropriate for querying the database
   *
   * @param {Object} query
   * @return {Object}
   */
  getReceiptsBaseFilter(query = {}) {
    const filter = {};

    filter['inventories.0'] = {$exists: true}; // Filters receipts with no inventories

    if (typeof query.created === 'string' && Date.parse(query.created)) {
      filter.created = {
        $gte: new Date(query.created),
        $lt: new Date(new Date(query.created).setDate(new Date(query.created).getDate() + 1))
      };
    }

    return filter;
  }
}
