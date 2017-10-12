'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Record not found
 */
var notFound = exports.notFound = {
  code: 404,
  res: { err: 'Record not found' },
  resFn: function resFn(type) {
    return type + ' not found';
  }
};

/**
 * Invalid ObjectId
 */
var invalidObjectId = exports.invalidObjectId = {
  code: 400,
  res: { err: 'Invalid ID' }
};

/**
 * Document was not found
 */

var DocumentNotFoundException = exports.DocumentNotFoundException = function DocumentNotFoundException(message, code) {
  _classCallCheck(this, DocumentNotFoundException);

  this.message = message;
  this.code = code;
};

/**
 * Violates sell limits
 */


var SellLimitViolationException = exports.SellLimitViolationException = function SellLimitViolationException(message, code) {
  _classCallCheck(this, SellLimitViolationException);

  this.message = message;
  this.code = code;
};
//# sourceMappingURL=exceptions.js.map
