'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recordExists = exports.runValidation = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Run validation on a request body
 * @param validation Validation rules
 * @param body Request body
 * @param params Path params
 * @return {Array}
 */
var runValidation = exports.runValidation = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(validation, body) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var valErrors, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref3, _ref4, k, v, compareVal, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, thisV;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            valErrors = [];
            _context2.prev = 1;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 5;
            _iterator = Object.entries(validation)[Symbol.iterator]();

          case 7:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 73;
              break;
            }

            _ref3 = _step.value;
            _ref4 = _slicedToArray(_ref3, 2);
            k = _ref4[0];
            v = _ref4[1];

            // Value in body
            compareVal = _lodash2.default.get(body, k);
            // Value in params

            if (!compareVal) {
              compareVal = _lodash2.default.get(params, k);
            }
            compareVal = typeof compareVal === 'string' ? compareVal : '';

            if (_lodash2.default.isPlainObject(v)) {
              v = [v];
            }

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 19;
            _iterator2 = v[Symbol.iterator]();

          case 21:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 56;
              break;
            }

            thisV = _step2.value;

            if (!(thisV.type && !_validator2.default[thisV.type](compareVal, thisV.options))) {
              _context2.next = 27;
              break;
            }

            // Invalid based on validator.js
            pushValError(valErrors, k, thisV);
            _context2.next = 53;
            break;

          case 27:
            if (!(thisV.regex && !thisV.regex.test(compareVal))) {
              _context2.next = 31;
              break;
            }

            // Invalid based on regex
            pushValError(valErrors, k, thisV);
            // Check to make sure string does not match this regex
            _context2.next = 53;
            break;

          case 31:
            if (!(thisV.notRegex && thisV.notRegex.test(compareVal))) {
              _context2.next = 35;
              break;
            }

            pushValError(valErrors, k, thisV);
            _context2.next = 53;
            break;

          case 35:
            if (!(thisV.date && !(0, _moment2.default)(compareVal).isValid())) {
              _context2.next = 39;
              break;
            }

            // Invalid based on moment()
            pushValError(valErrors, k, thisV);
            _context2.next = 53;
            break;

          case 39:
            if (!(thisV.rule && !thisV.rule(compareVal))) {
              _context2.next = 43;
              break;
            }

            // Invalid based on custom validation rule
            pushValError(valErrors, k, thisV);
            // Invalid based on record existence
            _context2.next = 53;
            break;

          case 43:
            _context2.t0 = thisV.async;

            if (!_context2.t0) {
              _context2.next = 48;
              break;
            }

            _context2.next = 47;
            return thisV.async(compareVal, models[thisV.model]);

          case 47:
            _context2.t0 = !_context2.sent;

          case 48:
            if (!_context2.t0) {
              _context2.next = 52;
              break;
            }

            // Invalid based on async validation rule
            pushValError(valErrors, k, thisV);
            _context2.next = 53;
            break;

          case 52:
            if (thisV.enum && thisV.enum.indexOf(compareVal) === -1) {
              pushValError(valErrors, k, thisV);
            }

          case 53:
            _iteratorNormalCompletion2 = true;
            _context2.next = 21;
            break;

          case 56:
            _context2.next = 62;
            break;

          case 58:
            _context2.prev = 58;
            _context2.t1 = _context2['catch'](19);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t1;

          case 62:
            _context2.prev = 62;
            _context2.prev = 63;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 65:
            _context2.prev = 65;

            if (!_didIteratorError2) {
              _context2.next = 68;
              break;
            }

            throw _iteratorError2;

          case 68:
            return _context2.finish(65);

          case 69:
            return _context2.finish(62);

          case 70:
            _iteratorNormalCompletion = true;
            _context2.next = 7;
            break;

          case 73:
            _context2.next = 79;
            break;

          case 75:
            _context2.prev = 75;
            _context2.t2 = _context2['catch'](5);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

          case 79:
            _context2.prev = 79;
            _context2.prev = 80;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 82:
            _context2.prev = 82;

            if (!_didIteratorError) {
              _context2.next = 85;
              break;
            }

            throw _iteratorError;

          case 85:
            return _context2.finish(82);

          case 86:
            return _context2.finish(79);

          case 87:
            return _context2.abrupt('return', valErrors);

          case 90:
            _context2.prev = 90;
            _context2.t3 = _context2['catch'](1);

            console.log('**************VALIDATION ERROR**********');
            console.log(_context2.t3);
            return _context2.abrupt('return', valErrors);

          case 95:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 90], [5, 75, 79, 87], [19, 58, 62, 70], [63,, 65, 69], [80,, 82, 86]]);
  }));

  return function runValidation(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Err on the side of caution here
 */


/**
 * Check to see if a record exists
 * @param id
 * @param model
 * @return {Promise.<void>}
 */
var recordExists = exports.recordExists = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id, model) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (isObjectId(id)) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt('return', false);

          case 2:
            _context3.next = 4;
            return model.findById(id);

          case 4:
            return _context3.abrupt('return', !!_context3.sent);

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function recordExists(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
}();

exports.checkStructuredValidation = checkStructuredValidation;
exports.convertBodyToStrings = convertBodyToStrings;
exports.ensureDecimals = ensureDecimals;
exports.returnValidationErrors = returnValidationErrors;
exports.isEmail = isEmail;
exports.isNotEmpty = isNotEmpty;
exports.isObjectId = isObjectId;
exports.isSimpleDate = isSimpleDate;
exports.isString = isString;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _mongoose = require('mongoose');

var _card = require('../api/card/card.model');

var _card2 = _interopRequireDefault(_card);

var _company = require('../api/company/company.model');

var _company2 = _interopRequireDefault(_company);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var isValidObjectId = _mongoose.Types.ObjectId.isValid;

var models = {
  Card: _card2.default,
  Company: _company2.default
};

/**
 * Check structured validation in middleware
 * @param validationRules Validation rules for endpoints in this route
 */
function checkStructuredValidation(validationRules) {
  return function (req, res, next) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var route, ruleToUse, body, params, valErrors;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              req.validationFailed = false;
              // No route for some weird reason

              if (req.route) {
                _context.next = 3;
                break;
              }

              return _context.abrupt('return', next());

            case 3:
              route = req.route.path;

              if (validationRules) {
                _context.next = 6;
                break;
              }

              return _context.abrupt('return', next());

            case 6:
              // Get this specific validation rule
              ruleToUse = validationRules[route];
              // No validation rules for this endpoint

              if (ruleToUse) {
                _context.next = 9;
                break;
              }

              return _context.abrupt('return', next());

            case 9:
              // Check for validation errors
              body = Object.assign({}, req.body);
              params = Object.assign({}, req.params);
              _context.next = 13;
              return runValidation(ruleToUse, convertBodyToStrings(body), convertBodyToStrings(params));

            case 13:
              valErrors = _context.sent;

              if (!valErrors.length) {
                _context.next = 18;
                break;
              }

              returnValidationErrors(res, valErrors);
              req.validationFailed = true;
              return _context.abrupt('return');

            case 18:
              next();

            case 19:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }))();
  };
}

/**
 * Convert all body props to string
 * @param body Req.body
 * @return {*}
 */
function convertBodyToStrings(body) {
  var bodyStrings = {};
  // Convert everything to a string for validation
  for (var i in body) {
    if (body.hasOwnProperty(i)) {
      if (typeof body[i] !== 'undefined' && typeof body[i].toString === 'function') {
        bodyStrings[i] = body[i].toString();
      }
    }
  }
  return bodyStrings;
}

/**
 * Ensure that we have a decimal value, rather than an integer representation of percentages
 * @param next
 * @param props
 * @param propMaxes
 */
function ensureDecimals(next, props) {
  var _this = this;

  var propMaxes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  props.forEach(function (prop) {
    if (_this[prop]) {
      // Make sure it's a decimal
      if (_this[prop]) {
        _this[prop] = parseFloat(_this[prop]);
        var maxValue = 1;
        // margin could potentially be less than "1", but entered wrong. It will always be less than 10%
        if (propMaxes[prop]) {
          maxValue = propMaxes[prop];
        }
        if (_this[prop] > maxValue) {
          _this[prop] = (_this[prop] / 100).toFixed(3);
        }
      }
    }
  });
  next();
}

function pushValError(valErrors, k, v) {
  valErrors.push({ name: k, message: v.message });
}

/**
 * Return validation errors
 * @param res
 * @param valErrors Validation errors
 */
function returnValidationErrors(res, valErrors) {
  return res.status(400).json({ error: { errors: valErrors } });
}function isEmail(val) {
  return (/.+@.+\..+/.test(val)
  );
}

/**
 * Checks a given string to make sure it's not empty
 *
 * @param {String} val
 * @return {Boolean}
 */
function isNotEmpty(val) {
  return _validator2.default.isLength(_validator2.default.trim(val), { min: 1 });
}

/**
 * Check for valid objectId
 * @param val
 */
function isObjectId(val) {
  return isValidObjectId(val);
}

/**
 * Test simple date format: YYYY-MM-DD
 * @param val
 * @return {boolean}
 */
function isSimpleDate(val) {
  return (/^\d{4}-\d{2}-\d{2}$/.test(val)
  );
}

/**
 * Check if value is a string
 */
function isString(val) {
  return typeof val === 'string';
}
//# sourceMappingURL=validation.js.map
