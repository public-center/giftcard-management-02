import {isObjectId, recordExists, isString, isNotEmpty} from '../../helpers/validation';

/**
 * Validation rules for callbackLog route
 */
export default {
  '/callbacks/:type': {
    'type': [
      {rule: function (type) {
        return ['cardFinalized', 'cqPaymentInitiated', 'needsAttention', 'denial'].indexOf(type) > -1;
      }, message: 'Invalid callback type'}
    ],
    'inventories': [
      {rule: function (val) {
        const ids = val.split(',');

        for (const id of ids) {
          if (!isObjectId(id)) {
            return false;
          }
        }

        return true;
      }, message: 'Invalid object ID'}
    ]
  },
  '/sendAccountingEmail/:companyId': {
    'companyId': [
      {rule: isObjectId, message: 'Company ID is invalid'},
      {async: recordExists, model: 'Company', message: 'Company does not exist'}
    ],
    'emailBody': [
      {rule: isString, message: 'Email body is not a string'},
      {rule: isNotEmpty, message: 'Email body is required'}
    ],
    'emailSubject': [
      {rule: isString, message: 'Email subject is not a string'},
      {rule: isNotEmpty, message: 'Email subject is required'}
    ]
  }
}
