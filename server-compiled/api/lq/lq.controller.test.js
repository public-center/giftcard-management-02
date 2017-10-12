'use strict';

var _chai = require('chai');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _helpers = require('../../tests/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _biRequestLog = require('../biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

var _callbackLog = require('../callbackLog/callbackLog.model');

var _callbackLog2 = _interopRequireDefault(_callbackLog);

var _customer = require('../customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _receipt = require('../receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _card3 = require('../card/card.controller');

var _helpers3 = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = new _helpers2.default();

describe('lq.controller.js', function () {
  test.initDb();

  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var _test$createRetailer;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return test.createAdminUser();

          case 2:
            _context.next = 4;
            return test.createCompanyAndCorporateAdminUser(1, {}, {}, { callbackUrl: _environment2.default.testServer });

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
            _context.next = 20;
            return test.loginUserSaveToken('admin');

          case 20:
            _context.next = 22;
            return test.loginUserSaveToken('corporateAdmin');

          case 22:
            _context.next = 24;
            return test.loginUserSaveToken('employee');

          case 24:
            _context.next = 26;
            return test.loginUserSaveToken('employee', 2);

          case 26:
            _context.next = 28;
            return test.createRetailer({
              gsId: '1'
            });

          case 28:
            _context.next = 30;
            return test.createRetailer((_test$createRetailer = {
              name: 'PinLovers'
            }, _defineProperty(_test$createRetailer, 'name', 'PinLovers'), _defineProperty(_test$createRetailer, 'pinRequired', true), _test$createRetailer));

          case 30:
            _context.next = 32;
            return test.createBestBuy();

          case 32:
            _context.next = 34;
            return test.createBiRequestLog(true, { "number": '2', "pin": "2" });

          case 34:
            _context.next = 36;
            return test.createBiRequestLog(true, { "number": '7', "pin": "7" });

          case 36:
            _context.next = 38;
            return test.createBiRequestLog(false, { "number": '8', "pin": "8" });

          case 38:
            _context.next = 40;
            return test.createBiRequestLog(false, {
              number: 'a', pin: 'a', user: test.getDefaultReferenceId('users')
            });

          case 40:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));

  describe('POST api/lq/account/create', function () {
    it('should create a new account', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var params;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              params = {
                email: 'hnnng@ecks.dee',
                password: 'aightden',
                firstName: 'herewego',
                lastName: 'newuser',
                companyName: 'newcompany'
              };
              _context2.next = 3;
              return test.request.post('/api/lq/account/create').set('Authorization', 'bearer ' + test.tokens.admin1.token).send(params).then(function (res) {
                (0, _chai.expect)(res).to.have.status(200);
                var expectedProps = ['token', 'companyId', 'customerId'];
                test.checkResponseProperties(res.body, expectedProps);
              });

            case 3:
              return _context2.abrupt('return', _context2.sent);

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
  });

  describe('POST api/lq/account/create/user', function () {
    it('should create a new account under the same company', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var companyId, storeId, params;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              companyId = test.getDefaultReferenceId('companies');
              storeId = test.getDefaultReferenceId('stores');
              params = {
                email: 'oahsdfiusadhf@ddd.com',
                password: 'wwwwwwwwwwwwwww',
                firstName: 'herewego',
                lastName: 'newuser',
                companyId: companyId,
                storeId: storeId
              };
              _context3.next = 5;
              return test.request.post('/api/lq/account/create/user').set('Authorization', 'bearer ' + test.tokens.corporateAdmin1.token).send(params).then(function (res) {
                (0, _chai.expect)(res).to.have.status(200);
                var expectedProps = ['token', 'companyId', 'customerId'];
                test.checkResponseProperties(res.body, expectedProps);
                (0, _chai.expect)(res.body.companyId).to.be.equal(test.getDefaultReferenceId('companies').toString());
              });

            case 5:
              return _context3.abrupt('return', _context3.sent);

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));
  });

  describe('POST api/lq/new', function () {
    it('should require params', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt('return', test.lqNew({}).catch(function (err) {
                test.checkErrorResponseProperties(err, ['number', 'retailer', 'userTime', 'balance']);
              }));

            case 1:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    })));

    it('should add a new card to the system', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var _this = this;

      var params;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _card3.testBiMockData.push(test.createMockBiDeferResponse(1, { requestId: 'e', request_id: 'e' }));
              params = {
                number: '1',
                pin: '1',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 40,
                merchandise: false
              };
              return _context6.abrupt('return', test.lqNew(params).then(function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(res) {
                  var expectedProps, card, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, expected, actual;

                  return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          test.checkResponseProperties(res.body, ['card']);

                          expectedProps = ['_id', 'sellRate', 'number', 'retailer', 'userTime', 'merchandise', 'balance', 'pin', 'buyAmount', 'soldFor', 'statusCode', 'status'];


                          test.checkResponseProperties(res.body.card, expectedProps);

                          card = res.body.card;
                          _iteratorNormalCompletion = true;
                          _didIteratorError = false;
                          _iteratorError = undefined;
                          _context5.prev = 8;


                          for (_iterator = Object.keys(params)[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            key = _step.value;

                            if (key === 'retailer') {
                              (0, _chai.expect)(card.retailer).to.be.equal(test.retailers[0].name);
                            } else if (key === 'userTime') {
                              expected = (0, _moment2.default)(params.userTime);
                              // MongoDb forces time to be saved in UTC, so we have to pretend
                              // the current local time is in UTC

                              expected.add(expected.utcOffset(), 'minutes').utc();
                              actual = (0, _moment2.default)(card.userTime);


                              (0, _chai.expect)(actual.unix()).to.be.closeTo(expected.unix(), 2); // Tolerate 2 second difference
                            } else {
                              (0, _chai.expect)(card[key]).to.be.equal(params[key]);
                            }
                          }
                          _context5.next = 16;
                          break;

                        case 12:
                          _context5.prev = 12;
                          _context5.t0 = _context5['catch'](8);
                          _didIteratorError = true;
                          _iteratorError = _context5.t0;

                        case 16:
                          _context5.prev = 16;
                          _context5.prev = 17;

                          if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                          }

                        case 19:
                          _context5.prev = 19;

                          if (!_didIteratorError) {
                            _context5.next = 22;
                            break;
                          }

                          throw _iteratorError;

                        case 22:
                          return _context5.finish(19);

                        case 23:
                          return _context5.finish(16);

                        case 24:
                        case 'end':
                          return _context5.stop();
                      }
                    }
                  }, _callee5, _this, [[8, 12, 16, 24], [17,, 19, 23]]);
                }));

                return function (_x) {
                  return _ref6.apply(this, arguments);
                };
              }()));

            case 3:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));

    it('should create a customer if none is specified and default customer does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var cards, thisCard, thisCustomer, user;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _card2.default.find({});

            case 2:
              cards = _context7.sent;

              (0, _chai.expect)(cards.length).to.be.equal(1);
              thisCard = cards[0];
              _context7.next = 7;
              return _customer2.default.findById(thisCard.customer);

            case 7:
              thisCustomer = _context7.sent;
              _context7.next = 10;
              return _user2.default.findById(thisCard.user[0]);

            case 10:
              user = _context7.sent;

              (0, _chai.expect)(user.company.toString()).to.be.equal(thisCustomer.company.toString());
              (0, _chai.expect)(thisCustomer.stateId).to.be.equal('API_Customer');

            case 13:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));

    it('should add additional cards to the same customer if none specified', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      var _this2 = this;

      var params;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              params = {
                number: '2',
                pin: '2',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 100,
                merchandise: false
              };
              _context9.next = 3;
              return test.lqNew(params).then(function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(res) {
                  var card, thisCustomer, cardsThisCustomer;
                  return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context8.next = 3;
                          return _card2.default.findById(res.body.card._id);

                        case 3:
                          card = _context8.sent;
                          _context8.next = 6;
                          return _customer2.default.findById(card.customer);

                        case 6:
                          thisCustomer = _context8.sent;
                          _context8.next = 9;
                          return _card2.default.find({ customer: thisCustomer._id });

                        case 9:
                          cardsThisCustomer = _context8.sent;

                          (0, _chai.expect)(cardsThisCustomer.length).to.be.equal(2);

                        case 11:
                        case 'end':
                          return _context8.stop();
                      }
                    }
                  }, _callee8, _this2);
                }));

                return function (_x2) {
                  return _ref9.apply(this, arguments);
                };
              }());

            case 3:
              return _context9.abrupt('return', _context9.sent);

            case 4:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this);
    })));

    it('should have specified a verified balance since a completed BI request log exists', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      var card;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _card2.default.findOne({ number: '2', pin: '2' }).populate('inventory');

            case 2:
              card = _context10.sent;

              (0, _chai.expect)(card.verifiedBalance).to.be.equal(50);
              (0, _chai.expect)(card.inventory.verifiedBalance).to.be.equal(50);

            case 5:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, this);
    })));

    it('should reject duplicate cards', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
      var params;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              params = {
                number: '1',
                pin: '1',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 40,
                merchandise: false
              };
              _context11.next = 3;
              return test.lqNew(params).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(400);
                var body = test.getErrBody(err);
                (0, _chai.expect)(body).to.have.property('invalid');
                (0, _chai.expect)(body.invalid).to.be.equal('Card has already been inserted into the database');
              });

            case 3:
              return _context11.abrupt('return', _context11.sent);

            case 4:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, this);
    })));

    it('should reject cards with no matching SMPs', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
      var params;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              params = {
                number: '3',
                pin: '3',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 250,
                merchandise: false
              };
              _context12.next = 3;
              return test.lqNew(params).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(400);
                var body = test.getErrBody(err);
                (0, _chai.expect)(body).to.have.property('invalid');
              });

            case 3:
              return _context12.abrupt('return', _context12.sent);

            case 4:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, this);
    })));

    it('should select lower sell rate with higher limit', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
      var _this3 = this;

      var params;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              params = {
                number: '4',
                pin: '4',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 60,
                merchandise: false
              };
              _context14.next = 3;
              return test.lqNew(params).then(function () {
                var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(res) {
                  return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                      switch (_context13.prev = _context13.next) {
                        case 0:
                          (0, _chai.expect)(res.body.card.sellRate).to.be.closeTo(0.77, 0.001);

                        case 1:
                        case 'end':
                          return _context13.stop();
                      }
                    }
                  }, _callee13, _this3);
                }));

                return function (_x3) {
                  return _ref14.apply(this, arguments);
                };
              }());

            case 3:
              return _context14.abrupt('return', _context14.sent);

            case 4:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, this);
    })));

    it('should accept electronic cards with no PIN if the retailer does not require a PIN code', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
      var params;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              params = {
                number: '5',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 30,
                merchandise: false
              };
              _context15.next = 3;
              return test.lqNew(params).then(function (res) {
                (0, _chai.expect)(res).to.have.status(200);
              });

            case 3:
              return _context15.abrupt('return', _context15.sent);

            case 4:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, this);
    })));

    it('should reject cards without a PIN code if a PIN is required', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
      var retailer, params;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              retailer = test.references.retailers.filter(function (r) {
                return r.name === 'PinLovers';
              })[0];
              params = {
                number: '6',
                retailer: retailer._id,
                userTime: (0, _moment2.default)().format(),
                balance: 30,
                merchandise: false
              };
              _context16.next = 4;
              return test.lqNew(params).catch(function (err) {
                var body = test.getErrBody(err);
                (0, _chai.expect)(err).to.have.status(400);
                (0, _chai.expect)(body).to.have.property('invalid');
                (0, _chai.expect)(body.invalid).to.be.equal('A PIN is required for ' + retailer.name);
              });

            case 4:
              return _context16.abrupt('return', _context16.sent);

            case 5:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, this);
    })));

    it('should complete cards when a BI response is received', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
      var _this4 = this;

      var cardParams;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              cardParams = { number: '4', pin: '4' };
              _context18.next = 3;
              return test.completeBiLog(cardParams).then(function () {
                var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(res) {
                  var card, log;
                  return regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) {
                      switch (_context17.prev = _context17.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context17.next = 3;
                          return _card2.default.findOne(cardParams).populate('inventory');

                        case 3:
                          card = _context17.sent;
                          _context17.next = 6;
                          return _biRequestLog2.default.findOne({ card: card._id });

                        case 6:
                          log = _context17.sent;

                          (0, _chai.expect)(log.balance).to.be.equal(100);
                          (0, _chai.expect)(card.verifiedBalance).to.be.equal(100);
                          (0, _chai.expect)(card.inventory.verifiedBalance).to.be.equal(100);

                        case 10:
                        case 'end':
                          return _context17.stop();
                      }
                    }
                  }, _callee17, _this4);
                }));

                return function (_x4) {
                  return _ref18.apply(this, arguments);
                };
              }());

            case 3:
              return _context18.abrupt('return', _context18.sent);

            case 4:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, this);
    })));

    it('should have the store attached when a receipt is generated', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
      var _this5 = this;

      var params;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              params = {
                number: '7',
                pin: '7',
                retailer: test.getDefaultReferenceId('retailers'),
                userTime: (0, _moment2.default)().format(),
                balance: 100,
                merchandise: false
              };
              _context20.next = 3;
              return test.lqNew(params).then(function () {
                var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(res) {
                  var card, receipt;
                  return regeneratorRuntime.wrap(function _callee19$(_context19) {
                    while (1) {
                      switch (_context19.prev = _context19.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context19.next = 3;
                          return _card2.default.findById(res.body.card._id);

                        case 3:
                          card = _context19.sent;
                          _context19.next = 6;
                          return _receipt2.default.findOne({ inventories: [card.inventory] });

                        case 6:
                          receipt = _context19.sent;

                          (0, _chai.expect)(receipt).to.have.property('store');

                        case 8:
                        case 'end':
                          return _context19.stop();
                      }
                    }
                  }, _callee19, _this5);
                }));

                return function (_x5) {
                  return _ref20.apply(this, arguments);
                };
              }());

            case 3:
              return _context20.abrupt('return', _context20.sent);

            case 4:
            case 'end':
              return _context20.stop();
          }
        }
      }, _callee20, this);
    })));
  });

  describe('POST /lq/bi', function () {
    it('should respond to fake cards for customer testing purposes', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return test.createBiLog({
                number: '1000',
                pin: '1a',
                retailer: '5668fbff37226093139b912c'
              }).then(function (res) {
                var body = res.body;
                (0, _chai.expect)(body.responseCode).to.be.equal('000');
                (0, _chai.expect)(body.request_id).to.be.equal('11502131554644889807');
                (0, _chai.expect)(body.balance).to.be.equal(100);
                (0, _chai.expect)(body.responseMessage).to.be.equal('success');
              });

            case 2:
            case 'end':
              return _context21.stop();
          }
        }
      }, _callee21, this);
    })));
    it('should accept a card to initiate a balance inquiry', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _card3.testBiMockData.push(test.createMockBiDeferResponse(1, { requestId: '1b', request_id: '1b' }));
              _context22.next = 3;
              return test.createBiLog({
                number: '1b',
                pin: '1b',
                prefix: '1b'
              }).then(function (res) {
                var expectedProps = ['balance', 'response_datetime', 'responseMessage', 'requestId', 'responseCode', 'responseDateTime', 'recheckDateTime'];
                test.checkResponseProperties(res.body, expectedProps);
                var body = res.body;
                (0, _chai.expect)(body.balance).to.be.equal(null);
                (0, _chai.expect)(body.requestId).to.be.equal('1b');
                (0, _chai.expect)(body.responseCode).to.be.equal('010');
              });

            case 3:
            case 'end':
              return _context22.stop();
          }
        }
      }, _callee22, this);
    })));

    it('should not initiate multiple balance inquiries on the same card within a 12 hour period', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.next = 2;
              return test.createBiLog({
                number: '1c',
                pin: '1b',
                prefix: '1b'
              }).then(function (res) {
                var body = res.body;
                (0, _chai.expect)(body.balance).to.be.equal(null);
                (0, _chai.expect)(body.requestId).to.be.equal('1b');
                (0, _chai.expect)(body.responseCode).to.be.equal('010');
              });

            case 2:
            case 'end':
              return _context23.stop();
          }
        }
      }, _callee23, this);
    })));

    it('should reject a card for BI if the retailer does not support BI', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
            case 'end':
              return _context24.stop();
          }
        }
      }, _callee24, this);
    })));
  });

  describe('POST /lq/bi/:requestId', function () {
    it('should return a 400 if any params are missing for completing ', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return test.completeBiLog(null).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(400);
                var body = test.getErrBody(err);
                (0, _chai.expect)(body.error).to.have.property('errors');
                (0, _chai.expect)(body.error.errors).to.have.lengthOf(3);
                test.checkErrorResponseProperties(err, ['retailerId', 'number', 'balance']);
              });

            case 2:
              return _context25.abrupt('return', _context25.sent);

            case 3:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, this);
    })));

    it('should create a log if none exists', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
      var _this6 = this;

      var params;
      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              params = { number: 'nope', pin: 'nope' };
              _context27.next = 3;
              return test.completeBiLog(params, 'nope').then(function () {
                var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(res) {
                  var log;
                  return regeneratorRuntime.wrap(function _callee26$(_context26) {
                    while (1) {
                      switch (_context26.prev = _context26.next) {
                        case 0:
                          _context26.next = 2;
                          return _biRequestLog2.default.findOne(params);

                        case 2:
                          log = _context26.sent;

                          (0, _chai.expect)(log).to.be.ok;
                          (0, _chai.expect)(log.balance).to.be.equal(100);

                        case 5:
                        case 'end':
                          return _context26.stop();
                      }
                    }
                  }, _callee26, _this6);
                }));

                return function (_x6) {
                  return _ref27.apply(this, arguments);
                };
              }());

            case 3:
              return _context27.abrupt('return', _context27.sent);

            case 4:
            case 'end':
              return _context27.stop();
          }
        }
      }, _callee27, this);
    })));

    it('should return 404 if a retailer does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
      var params;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              params = { number: 'nope', pin: 'nope', retailerId: test.getDefaultReferenceId('companies') };
              _context28.next = 3;
              return test.completeBiLog(params).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(404);
                var errBody = test.getErrBody(err);
                (0, _chai.expect)(errBody).to.have.property('err');
                (0, _chai.expect)(errBody.err).to.be.equal('Retailer not found');
              });

            case 3:
              return _context28.abrupt('return', _context28.sent);

            case 4:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, this);
    })));

    it('should create a new BiRequestLog if one does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
      var _this7 = this;

      return regeneratorRuntime.wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.next = 2;
              return test.completeBiLog({ number: '100', pin: '100' }, 'b').then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                var log;
                return regeneratorRuntime.wrap(function _callee29$(_context29) {
                  while (1) {
                    switch (_context29.prev = _context29.next) {
                      case 0:
                        _context29.next = 2;
                        return _biRequestLog2.default.findOne({ requestId: 'b' });

                      case 2:
                        log = _context29.sent;

                        (0, _chai.expect)(log).to.be.ok;
                        (0, _chai.expect)(log.number).to.be.equal('100');
                        (0, _chai.expect)(log.pin).to.be.equal('100');
                        (0, _chai.expect)(log.balance).to.be.equal(100);
                        (0, _chai.expect)(log.finalized).to.be.ok;

                      case 8:
                      case 'end':
                        return _context29.stop();
                    }
                  }
                }, _callee29, _this7);
              })));

            case 2:
            case 'end':
              return _context30.stop();
          }
        }
      }, _callee30, this);
    })));

    it('should create a new BiRequestLog if the value of the card changes', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
      var _this8 = this;

      return regeneratorRuntime.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.next = 2;
              return test.completeBiLog({ number: '100', pin: '100', balance: 0 }, 'b').then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
                var logs, newLog;
                return regeneratorRuntime.wrap(function _callee31$(_context31) {
                  while (1) {
                    switch (_context31.prev = _context31.next) {
                      case 0:
                        _context31.next = 2;
                        return _biRequestLog2.default.find({ requestId: 'b' }).sort({ created: -1 });

                      case 2:
                        logs = _context31.sent;

                        (0, _chai.expect)(logs).to.have.lengthOf(2);
                        newLog = logs[0];

                        (0, _chai.expect)(newLog.number).to.be.equal('100');
                        (0, _chai.expect)(newLog.pin).to.be.equal('100');
                        (0, _chai.expect)(newLog.balance).to.be.equal(0);
                        (0, _chai.expect)(newLog.finalized).to.be.ok;

                      case 9:
                      case 'end':
                        return _context31.stop();
                    }
                  }
                }, _callee31, _this8);
              })));

            case 2:
            case 'end':
              return _context32.stop();
          }
        }
      }, _callee32, this);
    })));

    it('should complete an existing BiRequestLog', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34() {
      var _this9 = this;

      return regeneratorRuntime.wrap(function _callee34$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              _card3.testBiMockData.push(test.createMockBiDeferResponse(1, { requestId: 'c', request_id: 'c' }));
              // Create a card
              _context34.next = 3;
              return test.createBiLog({
                number: 'c',
                pin: 'c',
                prefix: 'c'
              });

            case 3:
              _context34.next = 5;
              return test.completeBiLog({ number: 'c', pin: 'c', balance: '50' }, 'c').then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
                var logs, newLog;
                return regeneratorRuntime.wrap(function _callee33$(_context33) {
                  while (1) {
                    switch (_context33.prev = _context33.next) {
                      case 0:
                        _context33.next = 2;
                        return _biRequestLog2.default.find({ requestId: 'c' }).sort({ created: -1 });

                      case 2:
                        logs = _context33.sent;

                        (0, _chai.expect)(logs).to.have.lengthOf(1);
                        newLog = logs[0];

                        (0, _chai.expect)(newLog.number).to.be.equal('c');
                        (0, _chai.expect)(newLog.pin).to.be.equal('c');
                        (0, _chai.expect)(newLog.balance).to.be.equal(50);
                        (0, _chai.expect)(newLog.finalized).to.be.ok;

                      case 9:
                      case 'end':
                        return _context33.stop();
                    }
                  }
                }, _callee33, _this9);
              })));

            case 5:
            case 'end':
              return _context34.stop();
          }
        }
      }, _callee34, this);
    })));

    it('should have sent a callback if callbackUrl was specified in BiRequestLog', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
      var callbacks, callback;
      return regeneratorRuntime.wrap(function _callee35$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              _context35.next = 2;
              return _callbackLog2.default.find();

            case 2:
              callbacks = _context35.sent;

              (0, _chai.expect)(callbacks).to.have.lengthOf(1);
              callback = callbacks[0];

              (0, _chai.expect)(callback.callbackType).to.be.equal('balanceCB');
              (0, _chai.expect)(callback.prefix).to.be.equal('c');
              (0, _chai.expect)(callback.verifiedBalance).to.be.equal(50);
              (0, _chai.expect)(callback.number).to.be.equal('****c');
              (0, _chai.expect)(callback.pin).to.be.equal('c');

            case 10:
            case 'end':
              return _context35.stop();
          }
        }
      }, _callee35, this);
    })));

    it('should create a BI request and then transaction for the same card', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
      var bestBuySetNumber, number, truncatedNumber, callbackLog;
      return regeneratorRuntime.wrap(function _callee36$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              bestBuySetNumber = 3;
              number = '6119735259158091';
              truncatedNumber = (0, _helpers3.getLastFourCharacters)(number);

              _card3.testBiMockData.push(test.createMockBiDeferResponse(1, { requestId: 'd', request_id: 'd' }));
              _context36.prev = 4;
              _context36.next = 7;
              return test.createBiLog({
                "number": "6119735259158091",
                "pin": "1244",
                "prefix": 582394,
                "retailer": test.getDefaultReferenceId('retailers', bestBuySetNumber)
              });

            case 7:
              _context36.next = 9;
              return test.createCardFromTransaction({
                "customer": test.getDefaultReferenceId('customers'),
                "transactionId": 1503970810,
                "vmMemo1": "a_111627",
                "callbackUrl": "http://ob1epin.herokuapp.com/api/nbc/callback",
                "storeId": test.getDefaultReferenceId('stores'),
                "customerId": test.getDefaultReferenceId('customers'),
                "transactionTotal": 200,
                "userTime": "2017-08-29 01:40:10",
                "ip_address": "103.248.173.218",
                "prefix": "582394",
                "brandname": "Best Buy",
                "memo": "2028560424-1",
                "balance": 200,
                "retailer": test.getDefaultReferenceId('retailers', bestBuySetNumber),
                "pin": "1244",
                "number": "6119735259158091"
              });

            case 9:
              _context36.next = 11;
              return test.completeBiLog({
                "fixed": 0,
                "invalid": 0,
                "number": "6119735259158091",
                "pin": "1244",
                "balance": "200",
                "retailerId": test.getDefaultReferenceId('retailers', bestBuySetNumber)
              });

            case 11:
              _context36.next = 13;
              return _callbackLog2.default.findOne({ number: new RegExp(truncatedNumber) });

            case 13:
              callbackLog = _context36.sent;

              console.log('**************LOG**********');
              console.log(callbackLog);
              _context36.next = 22;
              break;

            case 18:
              _context36.prev = 18;
              _context36.t0 = _context36['catch'](4);

              console.log('**************ERR**********');
              console.log(test.getErrBody(_context36.t0));

            case 22:
            case 'end':
              return _context36.stop();
          }
        }
      }, _callee36, this, [[4, 18]]);
    })));

    it('should gracefully handle errors in running the BI PHP script', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
      return regeneratorRuntime.wrap(function _callee37$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
            case 'end':
              return _context37.stop();
          }
        }
      }, _callee37, this);
    })));
  });

  /**
   * For these tests, you're going to need to modify the store record that is being used in the requests. Set the following properties
   * creditValuePercentage: 1.1
   * maxSpending: 100
   * payoutAmountPercentage: 0.5
   *
   * creditValuePercentage is the amount additional that the store is willing to give the customer for the card. 1.1 means that a customer will be $110 for a $100 card.
   * maxSpending is the maximum amount a customer is allowed to spend on a card for a single transaction. This endpoint is used for purchasing merchandise using cards. If the customer wants to buy an item that is $200, and they bring in a card that is $100, and they get $110 for the card, then the customer will owe the store $90 in cash (200 - 110 = 90)
   * payoutAmountPercentage: This is the amount that we will pay the store for the card. At 0.5, it means that the store will receive 50% of the value that we sell the card for. If we sold this $100 card for $80, then the store will get $40.
   */
  describe('POST /lq/transactions', function () {
    /**
     * Make sure that all required properties are sent in to new transactions. A complete transaction request body looks like this:
     * {
    "number":"12345",
    "pin":"05321",
    "retailer":"{{retailer_id}}",
    "userTime":"2016-09-10T20:34:50-04:00",
    "balance": 100,
    "memo": "Match example",
    "merchandise": false,
    "transactionTotal": 50,
    "transactionId": 12345,
    "customerId": "{{customer_id}}",
    "storeId": "{{store_id}}",
    "prefix": "xyz",
    "vmMemo1": "a",
    "vmMemo2": "b",
    "vmMemo3": "c",
    "vmMemo4": "d"
    }
     The transactions documentation lists all properties as well: http://docs.gcmgrapi.apiary.io/#reference/0/transactions
     */
    it('should require number, retailer, userTime, balance, transaction, transactionTotal, customerId, and storeId in the request body', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
      return regeneratorRuntime.wrap(function _callee38$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              _context38.next = 2;
              return test.lqTransactions(null).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(400);
                test.checkErrorResponseProperties(err, ['number', 'retailer', 'userTime', 'balance', 'transactionId', 'transactionTotal', 'transactionTotal', 'customerId', 'storeId']);
              });

            case 2:
              return _context38.abrupt('return', _context38.sent);

            case 3:
            case 'end':
              return _context38.stop();
          }
        }
      }, _callee38, this);
    })));

    /**
     * When a card is submitted, it is sent to the balance inquiry system, which will attempt to determine the balance. When this happens, a BiRequestLog entry is created in the DB. When a response is received from BI, it is completed, and the balance returned from BI is recorded as the "verifiedBalance" in both the card and inventory. The balance that users enter when submitting a card is called the claimed balance, and it is recorded in the property "balance" in both the card and inventory.
     * In this test, create a BiRequestLog for the card being submitted, and test that the verified balance is recorded on both the card and inventory.
     */
    it('should set the verifiedBalance on both card and inventory for cards for which BI is already completed', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
      var _this10 = this;

      return regeneratorRuntime.wrap(function _callee40$(_context40) {
        while (1) {
          switch (_context40.prev = _context40.next) {
            case 0:
              _context40.next = 2;
              return test.lqTransactions({ number: '7', pin: '7', callbackUrl: _environment2.default.testServer }).then(function () {
                var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(res) {
                  var biLog, card;
                  return regeneratorRuntime.wrap(function _callee39$(_context39) {
                    while (1) {
                      switch (_context39.prev = _context39.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          // Get BI log
                          _context39.next = 3;
                          return _biRequestLog2.default.findOne({ number: '7' });

                        case 3:
                          biLog = _context39.sent;

                          (0, _chai.expect)(biLog).to.be.ok;
                          // Get card
                          _context39.next = 7;
                          return _card2.default.findById(res.body.card._id).populate('inventory');

                        case 7:
                          card = _context39.sent;

                          (0, _chai.expect)(biLog.card.toString()).to.be.equal(card._id.toString());
                          (0, _chai.expect)(card.verifiedBalance).to.be.equal(50);
                          (0, _chai.expect)(card.inventory.verifiedBalance).to.be.equal(50);

                        case 11:
                        case 'end':
                          return _context39.stop();
                      }
                    }
                  }, _callee39, _this10);
                }));

                return function (_x7) {
                  return _ref40.apply(this, arguments);
                };
              }());

            case 2:
              return _context40.abrupt('return', _context40.sent);

            case 3:
            case 'end':
              return _context40.stop();
          }
        }
      }, _callee40, this);
    })));

    it('should set no verifiedBalance on the record if balance inquiry has not finished yet', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42() {
      var _this11 = this;

      return regeneratorRuntime.wrap(function _callee42$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              _context42.next = 2;
              return test.lqTransactions({ number: '8', pin: '8' }).then(function () {
                var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(res) {
                  var card;
                  return regeneratorRuntime.wrap(function _callee41$(_context41) {
                    while (1) {
                      switch (_context41.prev = _context41.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context41.next = 3;
                          return _card2.default.findById(res.body.card._id).populate('inventory');

                        case 3:
                          card = _context41.sent;

                          (0, _chai.expect)(card.verifiedBalance).to.be.undefined;
                          (0, _chai.expect)(card.inventory.verifiedBalance).to.be.null;

                        case 6:
                        case 'end':
                          return _context41.stop();
                      }
                    }
                  }, _callee41, _this11);
                }));

                return function (_x8) {
                  return _ref42.apply(this, arguments);
                };
              }());

            case 2:
              return _context42.abrupt('return', _context42.sent);

            case 3:
            case 'end':
              return _context42.stop();
          }
        }
      }, _callee42, this);
    })));

    it('should reject duplicate cards', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43() {
      return regeneratorRuntime.wrap(function _callee43$(_context43) {
        while (1) {
          switch (_context43.prev = _context43.next) {
            case 0:
              _context43.next = 2;
              return test.lqTransactions({ number: '8', pin: '8' }).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(400);
                var body = test.getErrBody(err);
                (0, _chai.expect)(body).to.have.property('invalid');
                (0, _chai.expect)(body.invalid).to.be.equal('Card already exists in database');
              });

            case 2:
              return _context43.abrupt('return', _context43.sent);

            case 3:
            case 'end':
              return _context43.stop();
          }
        }
      }, _callee43, this);
    })));

    it('should create a new BiRequestLog entry for a card which has not had BI started before', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
      var _this12 = this;

      return regeneratorRuntime.wrap(function _callee45$(_context45) {
        while (1) {
          switch (_context45.prev = _context45.next) {
            case 0:
              _context45.next = 2;
              return test.lqTransactions({ number: '9', pin: '9' }).then(function () {
                var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(res) {
                  var card, log;
                  return regeneratorRuntime.wrap(function _callee44$(_context44) {
                    while (1) {
                      switch (_context44.prev = _context44.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context44.next = 3;
                          return _card2.default.findById(res.body.card._id).populate('inventory');

                        case 3:
                          card = _context44.sent;
                          _context44.next = 6;
                          return _biRequestLog2.default.findOne({ card: card._id });

                        case 6:
                          log = _context44.sent;

                          (0, _chai.expect)(log).not.to.be.undefined;
                          (0, _chai.expect)(log.card.toString()).to.be.equal(card._id.toString());

                        case 9:
                        case 'end':
                          return _context44.stop();
                      }
                    }
                  }, _callee44, _this12);
                }));

                return function (_x9) {
                  return _ref45.apply(this, arguments);
                };
              }());

            case 2:
              return _context45.abrupt('return', _context45.sent);

            case 3:
            case 'end':
              return _context45.stop();
          }
        }
      }, _callee45, this);
    })));

    it('should populate the verifiedBalance of a card when BI completes', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47() {
      var _this13 = this;

      var cardParams;
      return regeneratorRuntime.wrap(function _callee47$(_context47) {
        while (1) {
          switch (_context47.prev = _context47.next) {
            case 0:
              cardParams = { number: '9', pin: '9' };
              _context47.next = 3;
              return test.completeBiLog({ number: '9', pin: '9' }).then(function () {
                var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(res) {
                  var card, log;
                  return regeneratorRuntime.wrap(function _callee46$(_context46) {
                    while (1) {
                      switch (_context46.prev = _context46.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context46.next = 3;
                          return _card2.default.findOne(cardParams).populate('inventory');

                        case 3:
                          card = _context46.sent;
                          _context46.next = 6;
                          return _biRequestLog2.default.findOne({ card: card._id });

                        case 6:
                          log = _context46.sent;

                          (0, _chai.expect)(log.balance).to.be.equal(100);
                          (0, _chai.expect)(card.verifiedBalance).to.be.equal(100);
                          (0, _chai.expect)(card.inventory.verifiedBalance).to.be.equal(100);

                        case 10:
                        case 'end':
                          return _context46.stop();
                      }
                    }
                  }, _callee46, _this13);
                }));

                return function (_x10) {
                  return _ref47.apply(this, arguments);
                };
              }());

            case 3:
              return _context47.abrupt('return', _context47.sent);

            case 4:
            case 'end':
              return _context47.stop();
          }
        }
      }, _callee47, this);
    })));

    it('should have made a callback when BI was completed', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48() {
      var cardParams, card;
      return regeneratorRuntime.wrap(function _callee48$(_context48) {
        while (1) {
          switch (_context48.prev = _context48.next) {
            case 0:
              cardParams = { number: '9', pin: '9' };
              _context48.next = 3;
              return _card2.default.findOne(cardParams).populate('inventory');

            case 3:
              card = _context48.sent;

              (0, _chai.expect)(card.inventory.transaction.callbacks).to.have.members(['biComplete']);

            case 5:
            case 'end':
              return _context48.stop();
          }
        }
      }, _callee48, this);
    })));

    it('should return 404 status code if the customer does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50() {
      var _this14 = this;

      return regeneratorRuntime.wrap(function _callee50$(_context50) {
        while (1) {
          switch (_context50.prev = _context50.next) {
            case 0:
              _context50.next = 2;
              return test.lqTransactions({ number: '9', pin: '9', customerId: test.getDefaultReferenceId('stores') }).catch(function () {
                var _ref50 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49(err) {
                  var body;
                  return regeneratorRuntime.wrap(function _callee49$(_context49) {
                    while (1) {
                      switch (_context49.prev = _context49.next) {
                        case 0:
                          (0, _chai.expect)(err).to.have.status(404);
                          body = test.getErrBody(err);

                          (0, _chai.expect)(body).to.be.equal('Customer not found');

                        case 3:
                        case 'end':
                          return _context49.stop();
                      }
                    }
                  }, _callee49, _this14);
                }));

                return function (_x11) {
                  return _ref50.apply(this, arguments);
                };
              }());

            case 2:
              return _context50.abrupt('return', _context50.sent);

            case 3:
            case 'end':
              return _context50.stop();
          }
        }
      }, _callee50, this);
    })));

    it('should send a cqPaymentInitiated callback after a cqAch number is set', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
      var _this15 = this;

      var card;
      return regeneratorRuntime.wrap(function _callee52$(_context52) {
        while (1) {
          switch (_context52.prev = _context52.next) {
            case 0:
              _context52.next = 2;
              return _card2.default.findOne({ number: '9' }).populate('inventory');

            case 2:
              card = _context52.sent;

              card.inventory.cqAch = '1';
              _context52.next = 6;
              return card.inventory.save();

            case 6:
              _context52.next = 8;
              return test.sendTransactionCallback('cqPaymentInitiated', [card.inventory._id]).then(function () {
                var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51(res) {
                  return regeneratorRuntime.wrap(function _callee51$(_context51) {
                    while (1) {
                      switch (_context51.prev = _context51.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context51.next = 3;
                          return _card2.default.findOne({ number: '9' }).populate('inventory');

                        case 3:
                          card = _context51.sent;

                          (0, _chai.expect)(card.inventory.transaction.callbacks).to.have.members(['biComplete', 'cqPaymentInitiated']);

                        case 5:
                        case 'end':
                          return _context51.stop();
                      }
                    }
                  }, _callee51, _this15);
                }));

                return function (_x12) {
                  return _ref52.apply(this, arguments);
                };
              }());

            case 8:
              return _context52.abrupt('return', _context52.sent);

            case 9:
            case 'end':
              return _context52.stop();
          }
        }
      }, _callee52, this);
    })));

    it('should return a 404 status code if the combination of store and company is not correct', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54() {
      var _this16 = this;

      var _storeId;

      return regeneratorRuntime.wrap(function _callee54$(_context54) {
        while (1) {
          switch (_context54.prev = _context54.next) {
            case 0:
              _storeId = test.getDefaultReferenceId('stores', '2');
              _context54.next = 3;
              return test.lqTransactions({ storeId: _storeId }).catch(function () {
                var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53(err) {
                  return regeneratorRuntime.wrap(function _callee53$(_context53) {
                    while (1) {
                      switch (_context53.prev = _context53.next) {
                        case 0:
                          (0, _chai.expect)(err).to.have.status(404);
                          (0, _chai.expect)(JSON.parse(err.response.text)).to.be.equal("Customer not found");

                        case 2:
                        case 'end':
                          return _context53.stop();
                      }
                    }
                  }, _callee53, _this16);
                }));

                return function (_x13) {
                  return _ref54.apply(this, arguments);
                };
              }());

            case 3:
              return _context54.abrupt('return', _context54.sent);

            case 4:
            case 'end':
              return _context54.stop();
          }
        }
      }, _callee54, this);
    })));

    it('should return a 404 status code if the store specified in the request body does not exist or is not part of the company that the user making the request belogs to', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56() {
      var _this17 = this;

      var _storeId;

      return regeneratorRuntime.wrap(function _callee56$(_context56) {
        while (1) {
          switch (_context56.prev = _context56.next) {
            case 0:
              _storeId = test.getDefaultReferenceId('stores', '2');
              _context56.next = 3;
              return test.lqTransactions({ storeId: _storeId }).catch(function () {
                var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55(err) {
                  return regeneratorRuntime.wrap(function _callee55$(_context55) {
                    while (1) {
                      switch (_context55.prev = _context55.next) {
                        case 0:
                          console.log('**************ERR**********');
                          console.log(test.getErrBody(err));
                          //expect(err).to.have.status(404)
                          //expect(JSON.parse(err.response.text)).to.be.equal("store not found");

                        case 2:
                        case 'end':
                          return _context55.stop();
                      }
                    }
                  }, _callee55, _this17);
                }));

                return function (_x14) {
                  return _ref56.apply(this, arguments);
                };
              }());

            case 3:
              return _context56.abrupt('return', _context56.sent);

            case 4:
            case 'end':
              return _context56.stop();
          }
        }
      }, _callee56, this);
    })));

    it('should return a 400 status code if the card specified in the request body already exists in the DB', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58() {
      var _this18 = this;

      return regeneratorRuntime.wrap(function _callee58$(_context58) {
        while (1) {
          switch (_context58.prev = _context58.next) {
            case 0:
              _card3.testBiMockData.push(test.createMockBiDeferResponse(1, { requestId: 'f', request_id: 'f' }));
              _context58.next = 3;
              return test.lqTransactions().catch(function () {
                var _ref58 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57(err) {
                  var parsedResponse;
                  return regeneratorRuntime.wrap(function _callee57$(_context57) {
                    while (1) {
                      switch (_context57.prev = _context57.next) {
                        case 0:
                          (0, _chai.expect)(err).to.have.status(400);
                          //console.log("error message is"+err.response.text);
                          parsedResponse = JSON.parse(err.response.text);

                          (0, _chai.expect)(parsedResponse.invalid).to.be.equal("Card already exists in database");

                        case 3:
                        case 'end':
                          return _context57.stop();
                      }
                    }
                  }, _callee57, _this18);
                }));

                return function (_x15) {
                  return _ref58.apply(this, arguments);
                };
              }());

            case 3:
              return _context58.abrupt('return', _context58.sent);

            case 4:
            case 'end':
              return _context58.stop();
          }
        }
      }, _callee58, this);
    })));

    it('should specify inventory.transaction.amountDue as 45 if the transaction total is 100 and card balance is 50 if the retailer pays out 0.9 for the card', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60() {
      var _this19 = this;

      var retailerData, thisStore;
      return regeneratorRuntime.wrap(function _callee60$(_context60) {
        while (1) {
          switch (_context60.prev = _context60.next) {
            case 0:
              _context60.next = 2;
              return _retailer2.default.findOne({ "sellRates.cardCash": "0.9" });

            case 2:
              retailerData = _context60.sent;


              console.log("retailer value is:" + retailerData._id);
              // Update the maxSpending for the store being used to allow for the full value of the card to be used
              thisStore = test.references.stores[0];

              thisStore.maxSpending = 100;
              _context60.next = 8;
              return thisStore.save();

            case 8:
              test.references.stores[0] = thisStore;

              _context60.next = 11;
              return test.lqTransactions({
                transactionTotal: 100,
                balance: 50,
                retailer: retailerData._id,
                storeId: thisStore._id
              }).then(function () {
                var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59(res) {
                  var parsedText, amountDue;
                  return regeneratorRuntime.wrap(function _callee59$(_context59) {
                    while (1) {
                      switch (_context59.prev = _context59.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);

                          parsedText = res.body;
                          amountDue = parsedText.card.transaction.amountDue;


                          (0, _chai.expect)(amountDue).to.be.equal(45);

                        case 4:
                        case 'end':
                          return _context59.stop();
                      }
                    }
                  }, _callee59, _this19);
                }));

                return function (_x16) {
                  return _ref60.apply(this, arguments);
                };
              }());

            case 11:
              return _context60.abrupt('return', _context60.sent);

            case 12:
            case 'end':
              return _context60.stop();
          }
        }
      }, _callee60, this);
    })));

    it('should specify inventory.transaction.amountDue as 0 if the transaction total is 50 and the card balance is 100', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62() {
      var _this20 = this;

      return regeneratorRuntime.wrap(function _callee62$(_context62) {
        while (1) {
          switch (_context62.prev = _context62.next) {
            case 0:
              _context62.next = 2;
              return test.lqTransactions({
                transactionTotal: '50',
                balance: '100'
              }).then(function () {
                var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61(res) {
                  var parsedText, amountDue;
                  return regeneratorRuntime.wrap(function _callee61$(_context61) {
                    while (1) {
                      switch (_context61.prev = _context61.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);

                          parsedText = res.body;
                          amountDue = parsedText.card.transaction.amountDue;


                          (0, _chai.expect)(amountDue).to.be.equal(0);

                        case 4:
                        case 'end':
                          return _context61.stop();
                      }
                    }
                  }, _callee61, _this20);
                }));

                return function (_x17) {
                  return _ref62.apply(this, arguments);
                };
              }());

            case 2:
              return _context62.abrupt('return', _context62.sent);

            case 3:
            case 'end':
              return _context62.stop();
          }
        }
      }, _callee62, this);
    })));
    //
    it('should specify inventory.transaction.nccCardValue as 0 if the transaction total is 100 and the card balance is 50', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64() {
      var _this21 = this;

      return regeneratorRuntime.wrap(function _callee64$(_context64) {
        while (1) {
          switch (_context64.prev = _context64.next) {
            case 0:
              _context64.next = 2;
              return test.lqTransactions({
                transactionTotal: '100',
                balance: '50'
              }).then(function () {
                var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63(res) {
                  var parsedText, nccCardValue;
                  return regeneratorRuntime.wrap(function _callee63$(_context63) {
                    while (1) {
                      switch (_context63.prev = _context63.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          parsedText = res.body;
                          nccCardValue = parsedText.card.transaction.nccCardValue;

                          (0, _chai.expect)(nccCardValue).to.be.equal(0);

                        case 4:
                        case 'end':
                          return _context63.stop();
                      }
                    }
                  }, _callee63, _this21);
                }));

                return function (_x18) {
                  return _ref64.apply(this, arguments);
                };
              }());

            case 2:
              return _context64.abrupt('return', _context64.sent);

            case 3:
            case 'end':
              return _context64.stop();
          }
        }
      }, _callee64, this);
    })));
    //
    it('should specify inventory.transaction.nccCardValue as 60 if the transaction total is 50 and the card balance is 100', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee66() {
      var _this22 = this;

      return regeneratorRuntime.wrap(function _callee66$(_context66) {
        while (1) {
          switch (_context66.prev = _context66.next) {
            case 0:
              _context66.next = 2;
              return test.lqTransactions({
                transactionTotal: '50',
                balance: '100'
              }).then(function () {
                var _ref66 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee65(res) {
                  var parsedText, nccCardValue;
                  return regeneratorRuntime.wrap(function _callee65$(_context65) {
                    while (1) {
                      switch (_context65.prev = _context65.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          parsedText = res.body;
                          nccCardValue = parsedText.card.transaction.nccCardValue;

                          (0, _chai.expect)(nccCardValue).to.be.equal(60);

                        case 4:
                        case 'end':
                          return _context65.stop();
                      }
                    }
                  }, _callee65, _this22);
                }));

                return function (_x19) {
                  return _ref66.apply(this, arguments);
                };
              }());

            case 2:
              return _context66.abrupt('return', _context66.sent);

            case 3:
            case 'end':
              return _context66.stop();
          }
        }
      }, _callee66, this);
    })));
    //
    it('should specify inventory.transaction.merchantPayoutAmount as 25 if the transaction total is 50 and the card balance is 100', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee68() {
      var _this23 = this;

      return regeneratorRuntime.wrap(function _callee68$(_context68) {
        while (1) {
          switch (_context68.prev = _context68.next) {
            case 0:
              _context68.next = 2;
              return test.lqTransactions({
                transactionTotal: '50',
                balance: '100'
              }).then(function () {
                var _ref68 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee67(res) {
                  var parsedText, merchantPayoutAmount;
                  return regeneratorRuntime.wrap(function _callee67$(_context67) {
                    while (1) {
                      switch (_context67.prev = _context67.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          parsedText = res.body;
                          merchantPayoutAmount = parsedText.card.transaction.merchantPayoutAmount;

                          (0, _chai.expect)(merchantPayoutAmount).to.be.equal(25);

                        case 4:
                        case 'end':
                          return _context67.stop();
                      }
                    }
                  }, _callee67, _this23);
                }));

                return function (_x20) {
                  return _ref68.apply(this, arguments);
                };
              }());

            case 2:
              return _context68.abrupt('return', _context68.sent);

            case 3:
            case 'end':
              return _context68.stop();
          }
        }
      }, _callee68, this);
    })));

    it('should specify inventory.transaqction.merchantPayoutAmount as 27.5 if the transaction total is 100 and the card balance is 50', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee70() {
      var _this24 = this;

      return regeneratorRuntime.wrap(function _callee70$(_context70) {
        while (1) {
          switch (_context70.prev = _context70.next) {
            case 0:
              _context70.next = 2;
              return test.lqTransactions({
                transactionTotal: '100',
                balance: '50'
              }).then(function () {
                var _ref70 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee69(res) {
                  var parsedText, merchantPayoutAmount;
                  return regeneratorRuntime.wrap(function _callee69$(_context69) {
                    while (1) {
                      switch (_context69.prev = _context69.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          parsedText = res.body;
                          merchantPayoutAmount = parsedText.card.transaction.merchantPayoutAmount;

                          (0, _chai.expect)(merchantPayoutAmount).to.be.equal(27.5);

                        case 4:
                        case 'end':
                          return _context69.stop();
                      }
                    }
                  }, _callee69, _this24);
                }));

                return function (_x21) {
                  return _ref70.apply(this, arguments);
                };
              }());

            case 2:
              return _context70.abrupt('return', _context70.sent);

            case 3:
            case 'end':
              return _context70.stop();
          }
        }
      }, _callee70, this);
    })));

    it('should still work if the customer has rejection', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee72() {
      var _this25 = this;

      var customer, originalRejectionTotal;
      return regeneratorRuntime.wrap(function _callee72$(_context72) {
        while (1) {
          switch (_context72.prev = _context72.next) {
            case 0:
              _context72.next = 2;
              return _customer2.default.findById(test.getDefaultReferenceId('customers'));

            case 2:
              customer = _context72.sent;

              customer.rejectionTotal = 200;
              originalRejectionTotal = customer.rejectionTotal;
              _context72.next = 7;
              return customer.save();

            case 7:
              _context72.next = 9;
              return test.lqTransactions({
                transactionTotal: '100',
                balance: '50'
              }).then(function () {
                var _ref72 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee71(res) {
                  var card, customer;
                  return regeneratorRuntime.wrap(function _callee71$(_context71) {
                    while (1) {
                      switch (_context71.prev = _context71.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context71.next = 3;
                          return _card2.default.findById(res.body.card._id);

                        case 3:
                          card = _context71.sent;
                          _context71.next = 6;
                          return _customer2.default.findById(test.getDefaultReferenceId('customers'));

                        case 6:
                          customer = _context71.sent;

                          console.log(card.buyAmount, card.balance);
                          (0, _chai.expect)(customer.rejectionTotal).to.be.closeTo(originalRejectionTotal - card.buyAmount, 0.001);

                        case 9:
                        case 'end':
                          return _context71.stop();
                      }
                    }
                  }, _callee71, _this25);
                }));

                return function (_x22) {
                  return _ref72.apply(this, arguments);
                };
              }());

            case 9:
              return _context72.abrupt('return', _context72.sent);

            case 10:
            case 'end':
              return _context72.stop();
          }
        }
      }, _callee72, this);
    })));
  });
});
//# sourceMappingURL=lq.controller.test.js.map
