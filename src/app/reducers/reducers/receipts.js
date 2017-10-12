import Immutable from 'immutable';
import _ from 'lodash';

const initialReceipts = Immutable.fromJS({
  receipts: [],
  getFilter: {
    perPage: 20,
    offset: 0
  }
});

/**
 * Get company/store receipts
 *
 * @param {String} type The entity type ('company' or 'store')
 * @param {Number} id The entity ID
 * @param {Object} params
 */
export function getReceipts(type, id, params = initialReceipts.get('getFilter')) {
  const types = {company: 'companies', store: 'stores'};
  type = types[type];

  if (typeof params.get('perPage') !== 'number') {
    params = params.set('perPage', initialReceipts.getIn(['getFilter', 'perPage']));
  }

  if (typeof params.get('offset') !== 'number') {
    params = params.set('offset', initialReceipts.getIn(['getFilter', 'offset']));
  }

  return {
    types: ['receipts/get_receipts_success', 'receipts/get_receipts_fail'],
    func: async client => client.get(`api/${type}/${id}/receipts`, params.toJS())
  };
}

/**
 * Updates the filter for retrieving receipts
 *
 * @param {Object} filterUpdate
 */
export function setGetFilter(filterUpdate) {
  return {
    types: 'receipts/set_get_filter',
    func: () => filterUpdate
  };
}

export function receiptsReducer(state = initialReceipts, action) {
  switch (action.type) {
    case 'receipts/get_receipts_success':
      return handleSuccessfulGetReceipt(state, action);
    case 'receipts/get_receipts_fail':
      return state
        .set('receipts', Immutable.List())
        .set('error', 'ERROR MESSAGE');
    case 'receipts/set_get_filter':
      return state
        .set('getFilter', state.get('getFilter').merge(action.result));
    default:
      return state;
  }
}

/**
 * Sets the return receipts on the state tree
 *
 * @param {Immutable.Map} state
 * @param {Object} action
 * @return {Immutable.Map}
 */
function handleSuccessfulGetReceipt(state, action) {
  let receipts = Immutable.fromJS(action.result.data);
  // Calculate sale and balance totals first
  receipts = receipts.map(receipt => {
    receipt = receipt.set(
      'saleTotal',
      receipt.get('inventories').reduce((current, next) => current + next.get('buyAmount'), 0).toFixed(2)
    );

    receipt = receipt.set(
      'balanceTotal',
      receipt.get('inventories').reduce((current, next) => current + next.get('balance'), 0).toFixed(2)
    );

    return receipt;
  });

  return state
    .set('receipts', receipts)
    .remove('error');
}
