'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getReceipts = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Retrieve store receipts
 */
var getReceipts = exports.getReceipts = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var _req$query, _req$query$perPage, perPage, _req$query$offset, offset, receiptService, query, _ref2, _ref3, totalReceipts, receipts;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _req$query = req.query, _req$query$perPage = _req$query.perPage, perPage = _req$query$perPage === undefined ? 20 : _req$query$perPage, _req$query$offset = _req$query.offset, offset = _req$query$offset === undefined ? 0 : _req$query$offset;
            _context.prev = 1;
            receiptService = new _receipt4.default();
            query = Object.assign({}, _lodash2.default.pick(req.query, ['created']), { store: req.user.store });
            _context.next = 6;
            return Promise.all([receiptService.getReceiptsCount(query), receiptService.getReceipts(query, { perPage: parseInt(perPage, 10), offset: parseInt(offset, 10) })]);

          case 6:
            _ref2 = _context.sent;
            _ref3 = _slicedToArray(_ref2, 2);
            totalReceipts = _ref3[0];
            receipts = _ref3[1];


            res.json({
              data: receipts,
              pagination: {
                total: totalReceipts
              }
            });
            _context.next = 20;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](1);

            console.log('**************ERR IN GET RECEIPTS**********');
            console.log(_context.t0);
            _context.next = 19;
            return _errorLog2.default.create({
              method: 'getReceipts',
              controller: 'store.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context.t0.stack,
              error: _context.t0
            });

          case 19:
            return _context.abrupt('return', res.status(500).json(_context.t0));

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 13]]);
  }));

  return function getReceipts(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

require('../company/company.model');

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _receipt = require('../receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _receipt3 = require('../receipt/receipt.service');

var _receipt4 = _interopRequireDefault(_receipt3);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Retailer = require('../retailer/retailer.model');
var Card = require('../card/card.model');
//# sourceMappingURL=store.controller.js.map
