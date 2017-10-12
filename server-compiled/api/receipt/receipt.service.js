'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _receipt = require('./receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReceiptService = function () {
  function ReceiptService() {
    _classCallCheck(this, ReceiptService);
  }

  _createClass(ReceiptService, [{
    key: 'getReceipts',

    /**
     * Get receipts with inventories
     *
     * @param {Object} query
     * @param {{perPage: 20, offset: 0}} pagination
     * @return {Array}
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var pagination = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var filter, receipts;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!pagination.perPage) {
                  pagination.perPage = 20;
                }

                if (!pagination.offset) {
                  pagination.offset = 0;
                }

                filter = this.getReceiptsBaseFilter(query);
                _context.next = 5;
                return _receipt2.default.find(filter).populate({
                  path: 'inventories',
                  populate: [{
                    path: 'card',
                    model: 'Card'
                  }, {
                    path: 'retailer',
                    model: 'Retailer'
                  }]
                }).populate('customer').populate('store').sort({ created: -1 }).limit(pagination.perPage).skip(pagination.offset);

              case 5:
                receipts = _context.sent;
                return _context.abrupt('return', receipts);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getReceipts() {
        return _ref.apply(this, arguments);
      }

      return getReceipts;
    }()

    /**
     * Count receipts with inventories
     *
     * @param {Object} query
     * @return {Number}
     */

  }, {
    key: 'getReceiptsCount',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var filter;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                filter = this.getReceiptsBaseFilter(query);
                _context2.next = 3;
                return _receipt2.default.count(filter);

              case 3:
                return _context2.abrupt('return', _context2.sent);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getReceiptsCount() {
        return _ref2.apply(this, arguments);
      }

      return getReceiptsCount;
    }()

    /**
     * Converts query input into a filter appropriate for querying the database
     *
     * @param {Object} query
     * @return {Object}
     */

  }, {
    key: 'getReceiptsBaseFilter',
    value: function getReceiptsBaseFilter() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var filter = {};

      filter['inventories.0'] = { $exists: true }; // Filters receipts with no inventories

      if (typeof query.created === 'string' && Date.parse(query.created)) {
        filter.created = {
          $gte: new Date(query.created),
          $lt: new Date(new Date(query.created).setDate(new Date(query.created).getDate() + 1))
        };
      }

      return filter;
    }
  }]);

  return ReceiptService;
}();

exports.default = ReceiptService;
//# sourceMappingURL=receipt.service.js.map
