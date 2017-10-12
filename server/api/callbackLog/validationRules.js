import {isObjectId, recordExists, isSimpleDate} from '../../helpers/validation';

const validCallbacks = ['biComplete', 'cardFinalized', 'cqPaymentInitiated', 'denial', 'credit', 'biUnavailableCardAccepted'];
/**
 * Validation rules for callbackLog route
 */
export default {
  '/reFire/:cardId/:callbackType': {
    'cardId': [
      {rule: isObjectId, message: 'Card ID is invalid'},
      {async: recordExists, model: 'Card', message: 'Card does not exist'},
    ],
    'callbackType': [
      {enum: validCallbacks, message: `Callback must be one of the following: ${validCallbacks.join(', ')}`},
    ]
  },
  '/:begin/:end': {
    'begin': [
      {rule: isSimpleDate, message: 'Begin must have the following format: YYYY-MM-DD'},
    ],
    'end': [
      {rule: isSimpleDate, message: 'End must have the following format: YYYY-MM-DD'},
    ]
  },
  '/fireAll/:companyId': {
    companyId: [
      {rule: isObjectId, message: 'Company ID is invalid'},
      {async: recordExists, model: 'Company', message: 'Company does not exist'},
    ]
  }
}
