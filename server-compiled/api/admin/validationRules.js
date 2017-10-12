'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validation = require('../../helpers/validation');

/**
 * Validation rules for callbackLog route
 */
exports.default = {
  '/callbacks/:type': {
    'type': [{ rule: function rule(type) {
        return ['cardFinalized', 'cqPaymentInitiated', 'needsAttention', 'denial'].indexOf(type) > -1;
      }, message: 'Invalid callback type' }],
    'inventories': [{ rule: function rule(val) {
        var ids = val.split(',');

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var id = _step.value;

            if (!(0, _validation.isObjectId)(id)) {
              return false;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return true;
      }, message: 'Invalid object ID' }]
  },
  '/sendAccountingEmail/:companyId': {
    'companyId': [{ rule: _validation.isObjectId, message: 'Company ID is invalid' }, { async: _validation.recordExists, model: 'Company', message: 'Company does not exist' }],
    'emailBody': [{ rule: _validation.isString, message: 'Email body is not a string' }, { rule: _validation.isNotEmpty, message: 'Email body is required' }],
    'emailSubject': [{ rule: _validation.isString, message: 'Email subject is not a string' }, { rule: _validation.isNotEmpty, message: 'Email subject is required' }]
  }
};
//# sourceMappingURL=validationRules.js.map
