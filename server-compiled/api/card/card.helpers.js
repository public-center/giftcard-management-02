'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recalculateTransactionAndReserve = undefined;

/**
 * Recalculate transaction values for a transaction
 * @param inventory
 * @return {Promise.<void>}
 */
var recalculateTransactionAndReserve = exports.recalculateTransactionAndReserve = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(inventory) {
    var company, companySettings, reserve, dbCard;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (inventory.isTransaction) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', Promise.resolve(false));

          case 2:
            _context.next = 4;
            return inventory.removeReserve();

          case 4:
            _context.next = 6;
            return _company2.default.findOne(inventory.company);

          case 6:
            company = _context.sent;
            _context.next = 9;
            return company.getSettings();

          case 9:
            companySettings = _context.sent;
            _context.next = 12;
            return (0, _runDefers.finalizeTransaction)(inventory, companySettings, true);

          case 12:
            inventory = _context.sent;
            _context.next = 15;
            return inventory.createReserve();

          case 15:
            reserve = _context.sent;
            _context.next = 18;
            return _inventory2.default.addToRelatedReserveRecords(reserve);

          case 18:
            _context.next = 20;
            return _card2.default.findById(inventory.card).populate('inventory');

          case 20:
            dbCard = _context.sent;

            if (!inventory.rejected) {
              _context.next = 26;
              break;
            }

            _context.next = 24;
            return new _callback2.default().sendCallback(dbCard, 'denial');

          case 24:
            _context.next = 29;
            break;

          case 26:
            if (!inventory.credited) {
              _context.next = 29;
              break;
            }

            _context.next = 29;
            return new _callback2.default().sendCallback(dbCard, 'credit');

          case 29:
            return _context.abrupt('return', Promise.resolve(true));

          case 30:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function recalculateTransactionAndReserve(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.determineSellTo = determineSellTo;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

require('../stores/store.model');

require('../reserve/reserve.model');

var _smp = require('../../helpers/smp');

var _runDefers = require('../deferredBalanceInquiries/runDefers');

var _callback = require('../callbackLog/callback');

var _callback2 = _interopRequireDefault(_callback);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Deterine who to sell the card to
 *
 * @return {
 *   rate: rate BEFORE margin
 *   type: card type
 *   smp: smp
 * }
 */
function determineSellTo(retailer, balance, companySettings) {
  var availableSmps = (0, _smp.getActiveSmps)();
  var sellRates = retailer.sellRates;
  var types = retailer.smpType;
  // SMP hard limits
  var hardLimits = {
    saveya: {
      min: 20,
      max: 300
    },
    cardcash: {
      min: 1,
      max: 2000
    },
    cardpool: {
      min: 25,
      max: 1000
    },
    giftcardzen: {
      min: -Infinity,
      max: Infinity
    }
  };
  var thisHardLimit = {
    min: -Infinity, max: Infinity
  };

  var sellTo = {
    rate: 0,
    smp: null,
    type: null
  };

  var eligibleSmps = {};

  // Determine SMP
  _lodash2.default.forEach(sellRates, function (rate, smp) {
    if (typeof smp === 'string' && availableSmps.indexOf(smp.toLowerCase()) !== -1) {
      var maxMin = retailer.smpMaxMin[smp];
      var maxValid = true;
      var minValid = true;
      var hardMinValid = true;
      var hardMaxValid = true;
      // If no balance, determine best sell rate
      if (balance !== null && typeof maxMin !== 'undefined') {
        maxValid = typeof maxMin.max === 'number' ? maxMin.max >= balance : true;
        minValid = typeof maxMin.min === 'number' ? maxMin.min <= balance : true;
      }
      // Check max/min
      if (maxValid && minValid) {
        var smpLower = smp.toLowerCase();
        if (typeof rate === 'number' && rate >= sellTo.rate && availableSmps.indexOf(smpLower) !== -1 && types[smp] !== 'disabled') {
          if (companySettings && companySettings.cardType && companySettings.cardType !== 'both' && companySettings.cardType !== types[smp]) {
            return;
          }

          thisHardLimit = hardLimits[smpLower];
          if (balance !== null) {
            hardMaxValid = thisHardLimit.max >= balance;
            hardMinValid = thisHardLimit.min <= balance;
          }
          if (hardMaxValid && hardMinValid) {
            sellTo.rate = rate;
            sellTo.smp = smp;
            sellTo.type = types[smp];

            if (eligibleSmps[rate]) {
              eligibleSmps[rate].push({
                smp: smp,
                rate: rate,
                type: types[smp]
              });
            } else {
              eligibleSmps[rate] = [{
                smp: smp,
                rate: rate,
                type: types[smp]
              }];
            }
          }
        }
      }
    }
  });

  // No eligible SMPs here
  if (!Object.keys(eligibleSmps).length) {
    return false;
  }

  var eligible = null;
  // Find eligible
  try {
    eligible = eligibleSmps[sellTo.rate];
  } catch (e) {
    console.log('**************NO ELIGIBLE SMPs**********');
    console.log(e);
    eligible = null;
  }
  // None found
  if (!eligible) {
    return false;
  }
  var smpPool = eligible.filter(function (smp) {
    return smp.type === 'electronic';
  });
  if (!smpPool.length) {
    smpPool = eligible;
  }
  // Choose SMP randomly from highest rate
  if (smpPool && smpPool.length) {
    var smp = _lodash2.default.sample(smpPool);
    sellTo.smp = smp.smp;
    sellTo.type = smp.type;
  }

  // No SMP available
  if (sellTo.smp === null) {
    return false;
  }
  return sellTo;
}
//# sourceMappingURL=card.helpers.js.map
