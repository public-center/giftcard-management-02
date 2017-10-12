'use strict';

var _chai = require('chai');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _helpers = require('../../tests/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _runDefers = require('../deferredBalanceInquiries/runDefers');

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = new _helpers2.default();


describe('admin.controller.js', function () {
  // Init DB for card controller
  test.initDb();
  // Init company and admin user
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var smpMaxMin, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, retailer, cards, inventories;

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
            _context.next = 25;
            return test.loginUserSaveToken('employee');

          case 25:
            _context.next = 27;
            return test.loginUserSaveToken('employee', 2);

          case 27:
            _context.next = 29;
            return test.loginUserSaveToken('admin');

          case 29:
            _context.next = 31;
            return test.createCard(1, {});

          case 31:
            _context.next = 33;
            return test.createCard(1, { number: '2', pin: '2' });

          case 33:
            _context.next = 35;
            return test.createCard(2, { number: '3', pin: '3' });

          case 35:
            _context.next = 37;
            return test.createCard(2, { number: '4', pin: '4' });

          case 37:
            _context.next = 39;
            return test.createCard(2, { number: '5', pin: '5' });

          case 39:
            _context.next = 41;
            return test.addCardsToInventory(1);

          case 41:
            _context.next = 43;
            return test.addCardsToInventory(2);

          case 43:
            // Reject some cards for each retailer
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 46;
            _iterator = test.retailers[Symbol.iterator]();

          case 48:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 62;
              break;
            }

            retailer = _step.value;
            _context.next = 52;
            return _card2.default.find({ retailer: retailer._id });

          case 52:
            cards = _context.sent;

            cards = cards.slice(0, cards.length - 1);
            inventories = cards.map(function (card) {
              return card.inventory;
            });
            _context.next = 57;
            return _inventory2.default.update({ _id: { '$in': inventories } }, { $set: { verifiedBalance: 0 } }, { multi: true });

          case 57:
            _context.next = 59;
            return test.rejectCard(inventories);

          case 59:
            _iteratorNormalCompletion = true;
            _context.next = 48;
            break;

          case 62:
            _context.next = 68;
            break;

          case 64:
            _context.prev = 64;
            _context.t0 = _context['catch'](46);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 68:
            _context.prev = 68;
            _context.prev = 69;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 71:
            _context.prev = 71;

            if (!_didIteratorError) {
              _context.next = 74;
              break;
            }

            throw _iteratorError;

          case 74:
            return _context.finish(71);

          case 75:
            return _context.finish(68);

          case 76:
            _context.next = 78;
            return (0, _runDefers.sellCardsInLiquidation)();

          case 78:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[46, 64, 68, 76], [69,, 71, 75]]);
  })));

  describe('GET /denials/begin/:begin/end/:end/:pageSize/:page', function () {
    // inventory.rejected === true
    it('should return array of retailers paginated with percentage of denials', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var _this = this;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return test.request.get('/api/admin/denials/begin/2015-01-01/end/' + (0, _moment2.default)(new Date()).add(2, 'days').format('YYYY-MM-DD') + '/10/0').set('Authorization', 'bearer ' + test.tokens.admin1.token).then(function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(res) {
                  var body;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          body = res.body;

                          (0, _chai.expect)(body.data).to.be.an('array');
                          (0, _chai.expect)(body.data.length).to.be.equal(2);
                          (0, _chai.expect)(body.total).to.be.an('number');
                          // Test that denials are correct
                          (0, _chai.expect)(body.data[0].percentOfDenials).to.be.equal(50);
                          (0, _chai.expect)(parseFloat(body.data[1].percentOfDenials.toFixed(2))).to.be.equal(66.67);

                        case 6:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this);
                }));

                return function (_x) {
                  return _ref3.apply(this, arguments);
                };
              }());

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));

    // inventory.rejected === true && inventory.company === companyId
    it('should return array of retailers paginated with percentage of denials from a selected company', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var _this2 = this;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return test.request.get('/api/admin/denials/begin/2015-01-01/end/' + (0, _moment2.default)(new Date()).add(2, 'days').format('YYYY-MM-DD') + '/10/0?companyId=' + test.companies[0].id).set('Authorization', 'bearer ' + test.tokens.admin1.token).then(function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(res) {
                  var data;
                  return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          data = res.body.data;

                          (0, _chai.expect)(data).to.be.an('array');
                          (0, _chai.expect)(data.length).to.be.equal(2);
                          (0, _chai.expect)(res.body.total).to.be.an('number');

                          (0, _chai.expect)(data[0].percentOfDenials).to.be.equal(50);
                          (0, _chai.expect)(data[1].percentOfDenials).to.be.equal(0);

                        case 6:
                        case 'end':
                          return _context4.stop();
                      }
                    }
                  }, _callee4, _this2);
                }));

                return function (_x2) {
                  return _ref5.apply(this, arguments);
                };
              }());

            case 2:
              return _context5.abrupt('return', _context5.sent);

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    })));

    // inventory.rejected === true && inventory.store === storeId
    it('should return array of retailers paginated with percentage of denials from a selected store', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var _this3 = this;

      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return test.request.get('/api/admin/denials/begin/2015-01-01/end/' + (0, _moment2.default)(new Date()).add(2, 'days').format('YYYY-MM-DD') + '/10/0?storeId=' + test.stores[0].id).set('Authorization', 'bearer ' + test.tokens.admin1.token).then(function () {
                var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(res) {
                  var data;
                  return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          data = res.body.data;
                          // const a = { store: ObjectId('59c1acf8d133a349e99425bb'), retailer: ObjectId('59c1acf8d133a349e99425c3') };

                          (0, _chai.expect)(data).to.be.an('array');
                          (0, _chai.expect)(data.length).to.be.equal(2);
                          (0, _chai.expect)(res.body.total).to.be.an('number');

                          (0, _chai.expect)(data[0].percentOfDenials).to.be.equal(50);
                          (0, _chai.expect)(data[1].percentOfDenials).to.be.equal(0);

                        case 6:
                        case 'end':
                          return _context6.stop();
                      }
                    }
                  }, _callee6, _this3);
                }));

                return function (_x3) {
                  return _ref7.apply(this, arguments);
                };
              }());

            case 2:
              return _context7.abrupt('return', _context7.sent);

            case 3:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));
  });
});
//# sourceMappingURL=admin.controller.test.js.map
