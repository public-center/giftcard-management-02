'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validation = require('../../helpers/validation');

var validCallbacks = ['biComplete', 'cardFinalized', 'cqPaymentInitiated', 'denial', 'credit', 'biUnavailableCardAccepted'];
/**
 * Validation rules for callbackLog route
 */
exports.default = {
  '/reFire/:cardId/:callbackType': {
    'cardId': [{ rule: _validation.isObjectId, message: 'Card ID is invalid' }, { async: _validation.recordExists, model: 'Card', message: 'Card does not exist' }],
    'callbackType': [{ enum: validCallbacks, message: 'Callback must be one of the following: ' + validCallbacks.join(', ') }]
  },
  '/:begin/:end': {
    'begin': [{ rule: _validation.isSimpleDate, message: 'Begin must have the following format: YYYY-MM-DD' }],
    'end': [{ rule: _validation.isSimpleDate, message: 'End must have the following format: YYYY-MM-DD' }]
  },
  '/fireAll/:companyId': {
    companyId: [{ rule: _validation.isObjectId, message: 'Company ID is invalid' }, { async: _validation.recordExists, model: 'Company', message: 'Company does not exist' }]
  }
};
//# sourceMappingURL=validationRules.js.map
