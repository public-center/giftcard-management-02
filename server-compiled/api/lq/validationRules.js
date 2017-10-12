'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validation = require('../../helpers/validation');

/**
 * Validation rules for callbackLog route
 */
exports.default = {
  '/new': {
    'number': [{ rule: _validation.isNotEmpty, message: 'Card number is required' }],
    "retailer": [{ rule: _validation.isObjectId, message: 'Retailer ID is required' }],
    'userTime': [{ notRegex: /^\d{4}-\d{2}-\d{2}$/, message: 'userTime must be a valid ISO-8601 string' }, { date: true, message: 'userTime must be a valid ISO-8601 string' }],
    'balance': [{ regex: /^\d+(\.\d{1,2})?$/, message: 'Invalid balance. balance must be an integer or float' }]
  },
  '/transactions': {
    'number': [{ rule: _validation.isNotEmpty, message: 'Card number is required' }],
    'retailer': [{ rule: _validation.isObjectId, message: 'Invalid retailer ID' }],
    'userTime': [{ notRegex: /^\d{4}-\d{2}-\d{2}$/, message: 'userTime must be a valid ISO-8601 string' }, { date: true, message: 'userTime must be a valid ISO-8601 string' }],
    'balance': [{ regex: /^\d+(\.\d{1,2})?$/, message: 'Invalid balance. balance must be an integer or float' }],
    'transactionId': [{ rule: _validation.isNotEmpty, message: 'transactionId is required' }],
    'transactionTotal': [{ rule: _validation.isNotEmpty, message: 'transactionTotal is required' }, {
      type: 'isNumeric', message: 'transactionTotal must be a number'
    }],
    'customerId': [{ rule: _validation.isObjectId, message: 'customerId is invalid' }],
    'storeId': [{ rule: _validation.isObjectId, message: 'storeId is invalid' }]
  },
  '/bi/:requestId': {
    'retailerId': [{ rule: _validation.isNotEmpty, message: 'Retailer ID is required' }],
    'number': [{ rule: _validation.isNotEmpty, message: 'Card number is required' }],
    'balance': [{ regex: /^(\d+(\.\d{1,2})?)$/, message: 'Invalid balance. balance must be an integer or float' }]
  }
};
//# sourceMappingURL=validationRules.js.map
