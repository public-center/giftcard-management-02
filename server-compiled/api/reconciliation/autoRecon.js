'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var reconciliateCards = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var companies, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, company, settings, localTime, fakeReq, fakeRes;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _company2.default.find({}).populate('users');

          case 3:
            companies = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;
            _iterator = companies[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 25;
              break;
            }

            company = _step.value;
            _context.next = 13;
            return company.getSettings();

          case 13:
            settings = _context.sent;
            localTime = (0, _moment2.default)().tz(settings.timezone);

            if (!(localTime.hour() === 0)) {
              _context.next = 22;
              break;
            }

            // oshit, it's time for da midnite partaaayyyy!
            fakeReq = {
              params: {
                companyId: company._id,
                storeId: 'all'
              },
              body: {
                userTime: localTime.format()
              },
              user: company.users[0]
            };
            fakeRes = {
              status: function status() {
                return this;
              },
              json: function json() {
                return this;
              }
            };
            _context.next = 20;
            return (0, _company3.reconcile)(fakeReq, fakeRes);

          case 20:
            _context.next = 22;
            return (0, _company3.markAsReconciled)(fakeReq, fakeRes);

          case 22:
            _iteratorNormalCompletion = true;
            _context.next = 9;
            break;

          case 25:
            _context.next = 31;
            break;

          case 27:
            _context.prev = 27;
            _context.t0 = _context['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 31:
            _context.prev = 31;
            _context.prev = 32;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 34:
            _context.prev = 34;

            if (!_didIteratorError) {
              _context.next = 37;
              break;
            }

            throw _iteratorError;

          case 37:
            return _context.finish(34);

          case 38:
            return _context.finish(31);

          case 39:
            _context.next = 46;
            break;

          case 41:
            _context.prev = 41;
            _context.t1 = _context['catch'](0);

            console.log('Aaargghhh, I neeed a medic baaag');
            console.log('I HAVE HAD IT WITH THESE MOTHERFUCKING SNAKES ON THIS MOTHERFUCKING PLANE!');
            console.log(_context.t1);

          case 46:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 41], [7, 27, 31, 39], [32,, 34, 38]]);
  }));

  return function reconciliateCards() {
    return _ref.apply(this, arguments);
  };
}();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment-timezone');

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _company3 = require('../company/company.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var intervalLength = 3600 * 1000;

exports.default = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return reconciliateCards();

          case 2:
            setTimeout(function () {
              autoRecon();
            }, intervalLength);

          case 3:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function autoRecon() {
    return _ref2.apply(this, arguments);
  }

  return autoRecon;
}();
//# sourceMappingURL=autoRecon.js.map
