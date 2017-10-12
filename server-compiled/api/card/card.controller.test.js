'use strict';

var _chai = require('chai');

var _card = require('./card.model');

var _card2 = _interopRequireDefault(_card);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _runDefers = require('../deferredBalanceInquiries/runDefers');

var _helpers = require('../../tests/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = new _helpers2.default();

describe('card.controller.js', function () {
  // Init DB for card controller
  test.initDb();
  // Init company and admin user
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
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
            return test.createStoreAndManager();

          case 6:
            _context.next = 8;
            return test.createEmployee();

          case 8:
            _context.next = 10;
            return test.createCustomer();

          case 10:
            _context.next = 12;
            return test.createRetailer({ name: 'Test Retailer' });

          case 12:
            _context.next = 14;
            return test.loginUserSaveToken('employee');

          case 14:
            _context.next = 16;
            return test.loginUserSaveToken('admin');

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));

  it('should have set up the tests properly', function () {
    // Check to see if records were created
    (0, _chai.expect)(test.references.companies).to.have.lengthOf(1);
    (0, _chai.expect)(test.references.users).to.have.lengthOf(3);
    (0, _chai.expect)(test.references.stores).to.have.lengthOf(1);
    (0, _chai.expect)(test.references.customers).to.have.lengthOf(1);
    (0, _chai.expect)(test.references.retailers).to.have.lengthOf(1);
  });

  it("should allow us to login as an employee", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return test.loginUserSaveToken('employee');

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));

  describe('POST api/cards/newCard', function () {
    it('should allow us to create a new card', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var _this = this;

      var retailerId, customerId, storeId, params;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              retailerId = test.getDefaultReferenceId('retailers');
              customerId = test.getDefaultReferenceId('customers');
              storeId = test.getDefaultReferenceId('stores');
              params = {
                "retailer": retailerId,
                "number": "1",
                "pin": "1",
                "customer": customerId,
                "store": storeId,
                "userTime": new Date(),
                "balance": 100
              };
              _context4.next = 6;
              return test.request.post('/api/card/newCard').set('Authorization', 'bearer ' + test.tokens.employee1.token).send(params).then(function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(res) {
                  var expectedProps, body;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          // Make sure we have all expected props in the response
                          expectedProps = ['_id', 'sellRate', 'buyRate', 'balanceStatus', 'retailer', 'number', 'pin', 'customer', 'userTime', 'balance', 'merchandise', 'user', 'updates', 'valid', 'created'];
                          body = res.body;

                          test.checkResponseProperties(body, expectedProps);

                        case 4:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this);
                }));

                return function (_x) {
                  return _ref4.apply(this, arguments);
                };
              }());

            case 6:
              return _context4.abrupt('return', _context4.sent);

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    })));

    it('should have the correct references to other objects on the newly created card', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var card;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _card2.default.findOne({});

            case 2:
              card = _context5.sent;

              (0, _chai.expect)(card.retailer.toString()).to.be.equal(test.getDefaultReferenceId('retailers').toString());
              (0, _chai.expect)(card.user[0].toString()).to.be.equal(test.tokens.employee1._id);
              (0, _chai.expect)(card.customer.toString()).to.be.equal(test.getDefaultReferenceId('customers').toString());

            case 6:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    })));

    /**
     * When a card is sold, the balance is used to determine the market to which the card will be sold.
     * In this case, the values are:
     * sellRates: {
      cardCash: 0.9,
      cardPool: 0.8,
      giftcardZen: 0.7
    },
     However, the card has a balance of $100, which is higher than the market with the highest rate, CardCash, will accept, according to the market minimum and maximum values:
     smpMaxMin: {
      cardCash: {
        max: 50,
        min: 0
      },
      cardPool: {
        max: 100,
        min: 10
      },
      giftcardZen: {
        max: 0,
        min: 100
      }
    },
     As such, the card should go to the market with the best rate that will accept it, in this case, cardPool, giving it a 0.77 sellRate
     */
    it('should have sold to cardPool and have a sellRate of 0.03 less than cardPools rate', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var card;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _card2.default.findOne({});

            case 2:
              card = _context6.sent;

              (0, _chai.expect)(card.balance).to.be.equal(100);
              (0, _chai.expect)(card.sellRate).to.be.equal(0.77);

            case 5:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));
  });

  describe('GET api/cards/:customerId', function () {
    // Create another company and customer, so we can verify that users cannot query customers that do not belong to the same company as they do
    before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return test.createCompanyAndCorporateAdminUser(2);

            case 2:
              _context7.next = 4;
              return test.createStoreAndManager(2);

            case 4:
              _context7.next = 6;
              return test.createEmployee(2);

            case 6:
              _context7.next = 8;
              return test.createCustomer(2);

            case 8:
              _context7.next = 10;
              return test.loginUserSaveToken('employee', 2);

            case 10:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));

    it('should retrieve the cards for the existing employee user', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      var _this2 = this;

      var customerId;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              customerId = test.getDefaultReferenceId('customers');
              _context9.next = 3;
              return test.request.get('/api/card/' + customerId).set('Authorization', 'bearer ' + test.tokens.employee1.token).then(function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(res) {
                  var cardsData, dbCards;
                  return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          (0, _chai.expect)(res.text).to.not.be.empty;

                          cardsData = res.body;

                          (0, _chai.expect)(cardsData).to.have.property('data');
                          (0, _chai.expect)(cardsData.data).to.be.instanceof(Array);
                          // Make sure that we go the right number of cards
                          _context8.next = 7;
                          return _card2.default.find({ user: test.tokens.employee1._id });

                        case 7:
                          dbCards = _context8.sent;

                          (0, _chai.expect)(cardsData.data.length).to.be.equal(dbCards.length);

                        case 9:
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

    it('should return a 401 status code when a user tries to query cards that do not belong to them', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
      var customerId;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              customerId = test.getDefaultReferenceId('customers', 2);
              _context11.next = 3;
              return test.request.get('/api/card/' + customerId).set('Authorization', 'bearer ' + test.tokens.employee1.token).catch(function () {
                var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
                  return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          (0, _chai.expect)(err).to.have.status(401);

                        case 1:
                        case 'end':
                          return _context10.stop();
                      }
                    }
                  }, _callee10, this);
                }));

                return function (_x3) {
                  return _ref11.apply(this, arguments);
                };
              }());

            case 3:
              return _context11.abrupt('return', _context11.sent);

            case 4:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, this);
    })));

    it('should return an empty array when a customer with no cards is queried', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
      var _this3 = this;

      var customerId;
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              customerId = test.getDefaultReferenceId('customers', 2);
              _context13.next = 3;
              return test.request.get('/api/card/' + customerId).set('Authorization', 'bearer ' + test.tokens.employee2.token).then(function () {
                var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(res) {
                  var dbCards;
                  return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                      switch (_context12.prev = _context12.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          (0, _chai.expect)(res.body).to.have.property('data');
                          (0, _chai.expect)(res.body.data).to.be.instanceOf(Array);
                          (0, _chai.expect)(res.body.data.length).to.be.equal(0);
                          // Check DB to confirm that the right number of cards was returned
                          _context12.next = 6;
                          return _card2.default.find({ customer: customerId });

                        case 6:
                          dbCards = _context12.sent;

                          (0, _chai.expect)(dbCards.length).to.be.equal(res.body.data.length);

                        case 8:
                        case 'end':
                          return _context12.stop();
                      }
                    }
                  }, _callee12, _this3);
                }));

                return function (_x4) {
                  return _ref13.apply(this, arguments);
                };
              }());

            case 3:
              return _context13.abrupt('return', _context13.sent);

            case 4:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, this);
    })));
  });

  describe('POST api/cards/balance/update', function () {

    // const exampleBody = {
    //   _id: card,
    //    balance: 90
    // };

    it('should update the balance on existing cards', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
      var _this4 = this;

      var card, newBalance, requestBody, updatedCard;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context15.sent;
              newBalance = 20;
              requestBody = {
                _id: card._id,
                balance: newBalance
              };
              _context15.next = 7;
              return test.request.post('/api/card/balance/update').set('Authorization', 'bearer ' + test.tokens.employee1.token).send(requestBody).then(function () {
                var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(res) {
                  return regeneratorRuntime.wrap(function _callee14$(_context14) {
                    while (1) {
                      switch (_context14.prev = _context14.next) {
                        case 0:
                          //console.log("response: " + JSON.stringify(res))
                          (0, _chai.expect)(res).to.have.status(200);

                        case 1:
                        case 'end':
                          return _context14.stop();
                      }
                    }
                  }, _callee14, _this4);
                }));

                return function (_x5) {
                  return _ref15.apply(this, arguments);
                };
              }());

            case 7:
              _context15.next = 9;
              return _card2.default.findOne({ '_id': card._id });

            case 9:
              updatedCard = _context15.sent;

              (0, _chai.expect)(updatedCard.balance).to.be.equal(newBalance);

            case 11:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, this);
    })));

    it('should return a 401 status code if user tries to update a card which does not belong to them', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
      var _this5 = this;

      var card, newBalance, requestBody;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context17.sent;
              newBalance = 20;
              requestBody = {
                _id: card._id,
                balance: newBalance
              };
              _context17.next = 7;
              return test.request.post('/api/card/balance/update').set('Authorization', 'bearer ' + test.tokens.employee2.token).send(requestBody).then(function () {
                var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(res) {
                  return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                      switch (_context16.prev = _context16.next) {
                        case 0:
                        case 'end':
                          return _context16.stop();
                      }
                    }
                  }, _callee16, _this5);
                }));

                return function (_x6) {
                  return _ref17.apply(this, arguments);
                };
              }()).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(401);
                (0, _chai.expect)(err.response.res.statusMessage).to.be.equals("Unauthorized");
                (0, _chai.expect)(err.response.res.body.err).to.be.equals("Card does not belong to this customer");
              });

            case 7:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, this);
    })));

    it('should return a 404 status code if the user tries to update a card which does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
      var requestBody;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              requestBody = {
                _id: test.tokens.employee1._id,
                balance: 0
              };
              _context18.next = 3;
              return test.request.post('/api/card/balance/update').set('Authorization', 'bearer ' + test.tokens.employee1.token).send(requestBody).catch(function (err) {
                (0, _chai.expect)(err.status).to.be.equal(404);
              });

            case 3:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, this);
    })));
  });

  describe('POST api/cards/edit', function () {
    // const exampleBody = {
    //   _id: <cardId>,
    //   number: <new number>,
    //   pin: <new pin>,
    //   merchandise: true
    // };

    it('should allow for an existing card to have the number, pin, and whether the card is a merchandise card to be updated', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
      var _this6 = this;

      var card, retailer, requestBody;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context20.sent;
              retailer = test.getDefaultReferenceId('retailers');
              requestBody = {
                _id: card._id,
                number: "4",
                pin: "6",
                merchandise: true,
                retailer: retailer
              };
              _context20.next = 7;
              return test.request.post('/api/card/edit').set('Authorization', 'bearer ' + test.tokens.employee1.token).send(requestBody).then(function () {
                var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(res) {
                  var updatedCard;
                  return regeneratorRuntime.wrap(function _callee19$(_context19) {
                    while (1) {
                      switch (_context19.prev = _context19.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          updatedCard = res.body;

                          (0, _chai.expect)(updatedCard.number).to.be.equals(requestBody.number);
                          (0, _chai.expect)(updatedCard.pin).to.be.equals(requestBody.pin);
                          (0, _chai.expect)(updatedCard.merchandise).to.be.equals(requestBody.merchandise);

                        case 5:
                        case 'end':
                          return _context19.stop();
                      }
                    }
                  }, _callee19, _this6);
                }));

                return function (_x7) {
                  return _ref20.apply(this, arguments);
                };
              }());

            case 7:
            case 'end':
              return _context20.stop();
          }
        }
      }, _callee20, this);
    })));

    it('should return a 401 status code if user tries to update a card which does not belong to them', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
      var card, retailer, requestBody;
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context21.sent;
              retailer = test.getDefaultReferenceId('retailers');
              requestBody = {
                _id: card._id,
                number: "4",
                pin: "6",
                merchandise: true,
                retailer: retailer
              };
              _context21.next = 7;
              return test.request.post('/api/card/edit').set('Authorization', 'bearer ' + test.tokens.employee2.token).send(requestBody).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(401);
                (0, _chai.expect)(err.response.res.statusMessage).to.be.equals("Unauthorized");
                (0, _chai.expect)(err.response.res.body.err).to.be.equals("Card does not belong to this customer");
              });

            case 7:
            case 'end':
              return _context21.stop();
          }
        }
      }, _callee21, this);
    })));

    it('should return a 404 status code if a card which does not exist is queried', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
      var requestBody;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              requestBody = {
                _id: test.tokens.employee1._id,
                number: "4",
                pin: "6",
                merchandise: true,
                retailer: "Fake"
              };
              _context22.next = 3;
              return test.request.post('/api/card/edit').set('Authorization', 'bearer ' + test.tokens.employee2.token).send(requestBody).catch(function (err) {
                (0, _chai.expect)(err.status).to.be.equal(404);
              });

            case 3:
            case 'end':
              return _context22.stop();
          }
        }
      }, _callee22, this);
    })));
  });

  describe('DELETE api/cards/:cardId', function () {
    it('should allow an existing card to be deleted', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
      var _this7 = this;

      var card, cardId;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context24.sent;
              cardId = card._id;
              _context24.next = 6;
              return test.request.delete('/api/card/' + cardId).set('Authorization', 'bearer ' + test.tokens.employee1.token).then(function () {
                var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(res) {
                  return regeneratorRuntime.wrap(function _callee23$(_context23) {
                    while (1) {
                      switch (_context23.prev = _context23.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          (0, _chai.expect)(res.text).to.be.equal('Card successfully removed');

                        case 2:
                        case 'end':
                          return _context23.stop();
                      }
                    }
                  }, _callee23, _this7);
                }));

                return function (_x8) {
                  return _ref24.apply(this, arguments);
                };
              }());

            case 6:
              return _context24.abrupt('return', _context24.sent);

            case 7:
            case 'end':
              return _context24.stop();
          }
        }
      }, _callee24, this);
    })));

    it('should return a 401 status code if user tries to delete a card which does not belong to them', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
      var card, cardId;
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context25.sent;
              cardId = card._id;
              _context25.next = 6;
              return test.request.delete('/api/card/' + cardId).set('Authorization', 'bearer ' + test.tokens.employee2.token).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(401);
                (0, _chai.expect)(err.response.res.statusMessage).to.be.equals("Unauthorized");
              });

            case 6:
              return _context25.abrupt('return', _context25.sent);

            case 7:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, this);
    })));

    it('should return a 404 status code if a card is deleted which does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
      var card, cardId;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return _card2.default.findOne({ user: test.tokens.employee1._id });

            case 2:
              card = _context26.sent;
              cardId = test.tokens.employee1._id;
              _context26.next = 6;
              return test.request.delete('/api/card/' + cardId).set('Authorization', 'bearer ' + test.tokens.employee1.token).catch(function (err) {
                (0, _chai.expect)(err).to.have.status(404);
                (0, _chai.expect)(err.response.res.statusMessage).to.be.equals("Not Found");
              });

            case 6:
              return _context26.abrupt('return', _context26.sent);

            case 7:
            case 'end':
              return _context26.stop();
          }
        }
      }, _callee26, this);
    })));
  });

  describe('POST api/cards/addToInventory', function () {
    it('should return a 200 status code when the existing card ID is passed in', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
      var _this8 = this;

      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.next = 2;
              return test.addCardsToInventory(1).then(function () {
                var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(res) {
                  var cards, receipt, bodyReceipt;
                  return regeneratorRuntime.wrap(function _callee27$(_context27) {
                    while (1) {
                      switch (_context27.prev = _context27.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          // Get cards
                          _context27.next = 3;
                          return _card2.default.find({ user: test.tokens.employee1._id }).populate({
                            path: 'inventory',
                            populate: {
                              path: 'receipt',
                              model: 'Receipt'
                            }
                          });

                        case 3:
                          cards = _context27.sent;
                          receipt = cards[0].inventory.receipt;
                          bodyReceipt = res.body;

                          (0, _chai.expect)(receipt).to.be.ok;
                          (0, _chai.expect)(bodyReceipt._id.toString()).to.be.equal(receipt._id.toString());

                        case 8:
                        case 'end':
                          return _context27.stop();
                      }
                    }
                  }, _callee27, _this8);
                }));

                return function (_x9) {
                  return _ref28.apply(this, arguments);
                };
              }());

            case 2:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, this);
    })));

    it('should create an inventory object attached', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
      var card;
      return regeneratorRuntime.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              card = _card2.default.findOne({}).populate('inventory');
              //console.log("inventory: "+JSON.stringify(card))
              //expect(card).to.have.property('inventory');

            case 1:
            case 'end':
              return _context29.stop();
          }
        }
      }, _callee29, this);
    })));

    it('should have created a relationship between the card and the inventory', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
      var inventory;
      return regeneratorRuntime.wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              inventory = _inventory2.default.findOne({}).populate('card');
              //expect(inventory).to.have.property('card');

            case 1:
            case 'end':
              return _context30.stop();
          }
        }
      }, _callee30, this);
    })));

    it('should have the SMP value defined as cardPool (3)', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
      var inventory;
      return regeneratorRuntime.wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _context31.next = 2;
              return _inventory2.default.findOne({});

            case 2:
              inventory = _context31.sent;

            case 3:
            case 'end':
              return _context31.stop();
          }
        }
      }, _callee31, this);
    }))
    //expect(inventory.smp).to.be.equal(config.smpIds.CARDPOOL);
    );

    it('should have the created a receipt for the inventory', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
      var inventory;
      return regeneratorRuntime.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.next = 2;
              return _inventory2.default.findOne({});

            case 2:
              inventory = _context32.sent;

            case 3:
            case 'end':
              return _context32.stop();
          }
        }
      }, _callee32, this);
    }))
    //expect(inventory).to.have.property('receipt');
    );
  });

  describe('POST api/cards/updateDetails', function () {
    before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
      return regeneratorRuntime.wrap(function _callee33$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              _context33.next = 2;
              return (0, _runDefers.sellCardsInLiquidation)();

            case 2:
            case 'end':
              return _context33.stop();
          }
        }
      }, _callee33, this);
    })));
    it('should allow the user to modify details about a card', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
      var _this9 = this;

      var cards;
      return regeneratorRuntime.wrap(function _callee35$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              _context35.next = 2;
              return _card2.default.find({ user: test.tokens.employee1._id }).populate('inventory');

            case 2:
              cards = _context35.sent;
              _context35.next = 5;
              return test.updateInventoryDetails([cards[0].inventory._id], {
                orderNumber: '1000'
              }).then(function () {
                var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(res) {
                  var inventory;
                  return regeneratorRuntime.wrap(function _callee34$(_context34) {
                    while (1) {
                      switch (_context34.prev = _context34.next) {
                        case 0:
                          (0, _chai.expect)(res).to.have.status(200);
                          _context34.next = 3;
                          return _inventory2.default.findById(cards[0].inventory._id);

                        case 3:
                          inventory = _context34.sent;

                          (0, _chai.expect)(inventory.orderNumber).to.be.equal('1000');

                        case 5:
                        case 'end':
                          return _context34.stop();
                      }
                    }
                  }, _callee34, _this9);
                }));

                return function (_x10) {
                  return _ref35.apply(this, arguments);
                };
              }());

            case 5:
            case 'end':
              return _context35.stop();
          }
        }
      }, _callee35, this);
    })));

    it('should not allow the user to update values which are non-mutable', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
      var _this10 = this;

      var cards;
      return regeneratorRuntime.wrap(function _callee37$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              _context37.next = 2;
              return _card2.default.find({ user: test.tokens.employee1._id }).populate('inventory');

            case 2:
              cards = _context37.sent;

              test.updateInventoryDetails([cards[0].inventory._id], {
                hasVerifiedBalance: true
              }).then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
                var inventory;
                return regeneratorRuntime.wrap(function _callee36$(_context36) {
                  while (1) {
                    switch (_context36.prev = _context36.next) {
                      case 0:
                        _context36.next = 2;
                        return _inventory2.default.findById(cards[0].inventory._id);

                      case 2:
                        inventory = _context36.sent;

                        (0, _chai.expect)(inventory.hasVerifiedBalance).to.be.equal(false);

                      case 4:
                      case 'end':
                        return _context36.stop();
                    }
                  }
                }, _callee36, _this10);
              })));

            case 4:
            case 'end':
              return _context37.stop();
          }
        }
      }, _callee37, this);
    })));

    it('should update the liquidationSoldFor value when liquidationRate changes', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39() {
      var _this11 = this;

      var cards;
      return regeneratorRuntime.wrap(function _callee39$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              _context39.next = 2;
              return _card2.default.find({ user: test.tokens.employee1._id }).populate('inventory');

            case 2:
              cards = _context39.sent;

              test.updateInventoryDetails([cards[0].inventory._id], {
                liquidationRate: 0.5
              }).then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
                var inventory;
                return regeneratorRuntime.wrap(function _callee38$(_context38) {
                  while (1) {
                    switch (_context38.prev = _context38.next) {
                      case 0:
                        _context38.next = 2;
                        return _inventory2.default.findById(cards[0].inventory._id);

                      case 2:
                        inventory = _context38.sent;

                        (0, _chai.expect)(inventory.liquidationSoldFor).to.be.equal(10);

                      case 4:
                      case 'end':
                        return _context38.stop();
                    }
                  }
                }, _callee38, _this11);
              })));

            case 4:
            case 'end':
              return _context39.stop();
          }
        }
      }, _callee39, this);
    })));
  });
});
//# sourceMappingURL=card.controller.test.js.map
