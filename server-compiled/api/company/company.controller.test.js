'use strict';

var _chai = require('chai');

var _helpers = require('../../tests/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _company = require('./company.model');

var _company2 = _interopRequireDefault(_company);

var _store = require('../stores/store.model');

var _store2 = _interopRequireDefault(_store);

var _customer = require('../customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

var _runDefers = require('../deferredBalanceInquiries/runDefers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = new _helpers2.default();

var cardNumber = 0;

describe('company.controller.js', function () {
  // Init DB for card controller
  test.initDb();
  // Init company and admin user
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var smpMaxMin;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return test.createAdminUser();

          case 2:
            _context.next = 4;
            return test.createCompanyAndCorporateAdminUser();

          case 4:
            _context.next = 6;
            return test.createCompanyAndCorporateAdminUser(2);

          case 6:
            _context.next = 8;
            return test.createStoreAndManager();

          case 8:
            _context.next = 10;
            return test.createStoreAndManager(2);

          case 10:
            _context.next = 12;
            return test.createEmployee();

          case 12:
            _context.next = 14;
            return test.createEmployee(2);

          case 14:
            _context.next = 16;
            return test.createCustomer();

          case 16:
            _context.next = 18;
            return test.createCustomer(2);

          case 18:
            smpMaxMin = {
              cardCash: {
                max: 50,
                min: 0
              },
              cardPool: {
                max: 100,
                min: 10
              },
              giftcardZen: {
                max: null,
                min: 100
              }
            };
            // Create 2 retailers

            _context.next = 21;
            return test.createRetailer({ name: 'Retailer1', smpMaxMin: smpMaxMin });

          case 21:
            _context.next = 23;
            return test.createRetailer({ name: 'Retailer2', smpMaxMin: smpMaxMin });

          case 23:
            return _context.abrupt('return', _context.sent);

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));

  describe('GET /activity/begin/:beginDate/end/:endDate/:perPage/:offset', function () {
    // Create cards
    before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return test.loginUserSaveToken('employee');

            case 2:
              _context2.next = 4;
              return test.loginUserSaveToken('employee', 2);

            case 4:
              _context2.next = 6;
              return test.createCardFromUi(1);

            case 6:
              _context2.next = 8;
              return test.createCardFromUi(2);

            case 8:
              _context2.next = 10;
              return test.addCardsToInventory(1);

            case 10:
              _context2.next = 12;
              return test.addCardsToInventory(2);

            case 12:
              _context2.next = 14;
              return test.createCardFromLqNew(1);

            case 14:
              _context2.next = 16;
              return test.createCardFromLqNew(2);

            case 16:
              _context2.next = 18;
              return test.createCardFromTransaction(1);

            case 18:
              _context2.next = 20;
              return test.createCardFromTransaction(2);

            case 20:
              _context2.next = 22;
              return (0, _runDefers.sellCardsInLiquidation)();

            case 22:
              _context2.next = 24;
              return (0, _runDefers.completeTransactions)();

            case 24:
              return _context2.abrupt('return', _context2.sent);

            case 25:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));

    it('should successfully create cards and inventories using UI, lq/new, and lq/transactions', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var cards;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              (0, _chai.expect)(true).to.be.equal(true);
              _context3.next = 3;
              return _card2.default.find().populate('inventory');

            case 3:
              cards = _context3.sent;

              (0, _chai.expect)(cards).to.have.lengthOf(6);
              cards.forEach(function (card) {
                (0, _chai.expect)(card).to.have.property('inventory');
              });

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));
  });

  // describe('GET /company/:companyId/receipts/:perPage/:offset', function () {
  //   before(async function () {
  //     // Login as employee1
  //     await test.loginUserSaveToken('employee', 1);
  //   });
  //
  //   it('should return array of receipts', async function() {
  //     return await test.request
  //       .get(`/api/companies/${test.companies[0]._id}/receipts/10/0`)
  //       .set('Authorization', `bearer ${test.tokens.employee1.token}`)
  //       .then(async res => {
  //         expect(res.body.data).to.be.an('array');
  //         expect(res.body.data.length).to.be.equal(4);
  //         expect(res.body.pagination).to.be.an('object');
  //         expect(res.body.pagination.total).to.be.equal(4);
  //       });
  //   });
  // });
});
//# sourceMappingURL=company.controller.test.js.map
