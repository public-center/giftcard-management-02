import {isObjectId, isNotEmpty} from '../../helpers/validation';

/**
 * Validation rules for callbackLog route
 */
export default {
  '/new': {
    'number': [{rule: isNotEmpty, message: 'Card number is required'}],
    "retailer": [{rule: isObjectId, message: 'Retailer ID is required'}],
    'userTime': [
      {notRegex: /^\d{4}-\d{2}-\d{2}$/, message: 'userTime must be a valid ISO-8601 string'},
      {date: true, message: 'userTime must be a valid ISO-8601 string'}
    ],
    'balance': [{regex: /^\d+(\.\d{1,2})?$/, message: 'Invalid balance. balance must be an integer or float'}]
  },
  '/transactions': {
    'number': [{rule: isNotEmpty, message: 'Card number is required'}],
    'retailer': [{rule: isObjectId, message: 'Invalid retailer ID'}],
    'userTime': [
      {notRegex: /^\d{4}-\d{2}-\d{2}$/, message: 'userTime must be a valid ISO-8601 string'},
      {date: true, message: 'userTime must be a valid ISO-8601 string'}
    ],
    'balance': [{regex: /^\d+(\.\d{1,2})?$/, message: 'Invalid balance. balance must be an integer or float'}],
    'transactionId': [{rule: isNotEmpty, message: 'transactionId is required'}],
    'transactionTotal': [{rule: isNotEmpty, message: 'transactionTotal is required'}, {
      type: 'isNumeric', message: 'transactionTotal must be a number'
    }],
    'customerId': [{rule: isObjectId, message: 'customerId is invalid'}],
    'storeId': [{rule: isObjectId, message: 'storeId is invalid'}],
  },
  '/bi/:requestId': {
    'retailerId': [{rule: isNotEmpty, message: 'Retailer ID is required'}],
    'number': [{rule: isNotEmpty, message: 'Card number is required'}],
    'balance': [{regex: /^(\d+(\.\d{1,2})?)$/, message: 'Invalid balance. balance must be an integer or float'}],
  }
}
