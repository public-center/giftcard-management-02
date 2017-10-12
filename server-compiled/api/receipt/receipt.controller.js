'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getReceipt = getReceipt;

var _receipt = require('./receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Retrieve a receipt
 */
function getReceipt(req, res) {
  var _this = this;

  _receipt2.default.findById(req.params.receiptId).populate('customer').populate('store').populate({
    path: 'user',
    populate: [{
      path: 'store',
      model: 'Store'
    }, {
      path: 'company',
      model: 'Company'
    }]
  }).populate({
    path: 'inventories',
    populate: [{
      path: 'card',
      model: 'Card'
    }, {
      path: 'retailer',
      model: 'Retailer'
    }]
  }).then(function (receipt) {
    return res.json(receipt);
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log('**************ERR IN GET RECEIPT**********');
              console.log(err);
              _context.next = 4;
              return _errorLog2.default.create({
                method: 'getReceipt',
                controller: 'receipt.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}
//# sourceMappingURL=receipt.controller.js.map
