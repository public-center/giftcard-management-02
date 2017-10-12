'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rejectCards = exports.setCardValue = exports.addToInventory = exports.deleteCard = exports.editCard = exports.getExistingCards = exports.newCard = exports.updateBalance = exports.checkCardBalance = exports.checkBalance = exports.testBiMockData = undefined;

/**
 * Check a card balance
 */
var checkBalance = exports.checkBalance = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
    var dbRetailer, _req$body, retailer, number, _req$body$pin, pin, _req$body$_id, _id, _req$body$requestId, requestId, params, log, card;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            dbRetailer = void 0;
            _req$body = req.body, retailer = _req$body.retailer, number = _req$body.number, _req$body$pin = _req$body.pin, pin = _req$body$pin === undefined ? '' : _req$body$pin, _req$body$_id = _req$body._id, _id = _req$body$_id === undefined ? null : _req$body$_id, _req$body$requestId = _req$body.requestId, requestId = _req$body$requestId === undefined ? null : _req$body$requestId;
            _context3.prev = 2;

            if (!(_lodash2.default.isPlainObject(retailer) && (retailer.gsId || retailer.aiId))) {
              _context3.next = 12;
              break;
            }

            params = { $or: [] };

            if (typeof retailer.gsId !== 'undefined') {
              params.$or.push({ gsId: retailer.gsId });
            }
            if (typeof retailer.aiId !== 'undefined') {
              params.$or.push({ aiId: retailer.aiId });
            }
            _context3.next = 9;
            return _retailer2.default.findOne(params);

          case 9:
            dbRetailer = _context3.sent;
            _context3.next = 19;
            break;

          case 12:
            if (!(typeof retailer === 'string')) {
              _context3.next = 18;
              break;
            }

            _context3.next = 15;
            return _retailer2.default.findById(retailer);

          case 15:
            dbRetailer = _context3.sent;
            _context3.next = 19;
            break;

          case 18:
            return _context3.abrupt('return', res.status(400).json({ err: 'Retailer not found' }));

          case 19:
            _context3.next = 21;
            return _biRequestLog2.default.findOne({
              number: number, pin: pin, retailer: dbRetailer._id
            });

          case 21:
            log = _context3.sent;

            if (!(log && 'responseCode' in log && (log.responseCode === '000' || log.responseCode === '900011'))) {
              _context3.next = 32;
              break;
            }

            _context3.next = 25;
            return _card3.default.findOne({
              number: number, pin: pin, retailer: dbRetailer
            });

          case 25:
            card = _context3.sent;

            if (log.responseCode === '000' && log.balance) {
              card.verifiedBalance = log.balance;
              card.balanceStatus = 'received';
            } else if (log.responseCode === '900011') {
              card.verifiedBalance = log.balance;
              card.balanceStatus = 'received';
            }
            _context3.next = 29;
            return card.save();

          case 29:
            return _context3.abrupt('return', _context3.sent);

          case 32:
            _context3.next = 34;
            return balanceInquiry(dbRetailer.gsId || dbRetailer.aiId, number, pin, _id, req.user._id, req.user.company, requestId);

          case 34:
            return _context3.abrupt('return', _context3.sent);

          case 35:
            _context3.next = 44;
            break;

          case 37:
            _context3.prev = 37;
            _context3.t0 = _context3['catch'](2);
            _context3.next = 41;
            return _errorLog2.default.create({
              method: 'handleBiResponse',
              controller: 'card.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context3.t0.stack,
              error: _context3.t0,
              user: req.user._id
            });

          case 41:
            console.log('**************CHECK BALANCE ERR**********');
            console.log(_context3.t0);
            res.status(500).json(_context3.t0);

          case 44:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[2, 37]]);
  }));

  return function checkBalance(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Check to see if a BI ID exists for a retailer
 * @param retailer
 */


/**
 * Check to see if a retailer is available for BI
 * @param retailerId
 * @return {Promise.<null|*>}
 */
var checkBiAvailable = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(retailerId) {
    var retailer;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _retailer2.default.findById(retailerId);

          case 2:
            retailer = _context4.sent;

            checkBiIdExists(retailer);
            return _context4.abrupt('return', retailer);

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function checkBiAvailable(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Checks a card balance
 *
 * @param {Object|String} retailer
 * @param {String} number
 * @param {String} pin
 * @param {String} cardId
 * @param {String} requestId
 * @param userId
 * @param companyId
 */


var checkCardBalance = exports.checkCardBalance = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(retailer, number, pin, cardId, requestId, userId, companyId) {
    var retailerToUse;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            retailerToUse = void 0;
            // Plain object retailer

            if (!(_lodash2.default.isPlainObject(retailer) && (retailer.gsId || retailer.aiId))) {
              _context5.next = 6;
              break;
            }

            checkBiIdExists(retailer);
            retailerToUse = retailer;
            _context5.next = 19;
            break;

          case 6:
            if (!(retailer.constructor.name === 'model')) {
              _context5.next = 11;
              break;
            }

            checkBiIdExists(retailer);
            retailerToUse = retailer;
            // Object ID as string or actual object ID
            _context5.next = 19;
            break;

          case 11:
            if (!(typeof retailer === 'string' || retailer.constructor.name === 'ObjectID')) {
              _context5.next = 18;
              break;
            }

            _context5.next = 14;
            return checkBiAvailable(retailer);

          case 14:
            retailerToUse = _context5.sent;

            checkBiIdExists(retailer);
            _context5.next = 19;
            break;

          case 18:
            throw 'biUnavailableThisRetailer';

          case 19:
            return _context5.abrupt('return', balanceInquiry(retailerToUse.gsId || retailerToUse.aiId, number, pin, cardId, userId, companyId, requestId));

          case 20:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function checkCardBalance(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Update card balance
 */


var updateBalance = exports.updateBalance = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var userid, _card, card;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            userid = req.user._id.toString();
            _context6.next = 4;
            return _card3.default.findOne({ _id: req.body._id });

          case 4:
            _card = _context6.sent;

            if (_card) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt('return', res.status(404).json({ err: 'Card does not exist' }));

          case 7:
            if (!(_card.user.toString() !== userid)) {
              _context6.next = 9;
              break;
            }

            return _context6.abrupt('return', res.status(401).json({ err: 'Card does not belong to this customer' }));

          case 9:
            card = req.body;
            _context6.next = 12;
            return _card3.default.findByIdAndUpdate(card._id, {
              $set: {
                balance: card.balance
              }
            });

          case 12:
            return _context6.abrupt('return', res.json({}));

          case 15:
            _context6.prev = 15;
            _context6.t0 = _context6['catch'](0);
            _context6.next = 19;
            return _errorLog2.default.create({
              method: 'updateBalance',
              controller: 'card.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context6.t0.stack,
              error: _context6.t0,
              user: req.user._id
            });

          case 19:
            console.log('**************ERR IN UPDATE BALANCE**********');
            console.log(_context6.t0);
            return _context6.abrupt('return', res.status(500).json(_context6.t0));

          case 22:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 15]]);
  }));

  return function updateBalance(_x13, _x14) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Find cards which already exist in the DB
 * @param retailer
 * @param number
 * @param customer
 * @param pin
 */


/**
 * Input a new card
 */
var newCard = exports.newCard = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(req, res) {
    var _this4 = this;

    var body, user, store, pin, dbCard, dbCustomer;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            body = req.body;
            user = req.user;
            store = body.store || user.store;
            pin = void 0;

            try {
              pin = body.pin;
            } catch (e) {
              pin = null;
            }
            dbCard = void 0, dbCustomer = void 0;
            return _context8.abrupt('return', createDefaultCustomer(body, user).then(function (customer) {
              dbCustomer = customer;
              // See if this card already exists
              return findCards(body.retailer, body.number, null, pin).populate('retailer');
            })
            // If card exists, throw error
            .then(function (card) {
              if (card) {
                // Don't overwrite test card
                if (!isTestCard(card) && !card.inventory) {
                  return card;
                }
                dbCard = card;
                res.status(500).json({ reason: 'cardExists' });
                throw 'cardExists';
              }
            }).then(function (card) {
              if (typeof card === 'undefined') {
                card = new _card3.default(body);
              }
              card.user = user._id;
              card.balanceStatus = 'unchecked';
              // User time when card was created
              var tzOffset = body.userTime.substr(-6);
              card.userTime = _moment2.default.utc().add(parseInt(tzOffset), 'hours').toDate();
              card.created = _moment2.default.utc().add(parseInt(tzOffset), 'hours').toDate();
              card.customer = dbCustomer;
              dbCard = card;
              // Save
              return card.save();
            }).then(function (card) {
              if (!card) {
                return false;
              }
              // Retrieve card with retailer
              return _card3.default.findById(card._id).populate({
                path: 'retailer',
                populate: {
                  path: 'buyRateRelations',
                  model: 'BuyRate'
                }
              }).populate('customer');
            })
            // Return
            .then(function (card) {
              if (!card) {
                return false;
              }
              dbCard = card;
              return _company2.default.findById(user.company).populate({
                path: 'settings',
                populate: {
                  path: 'autoBuyRates',
                  model: 'AutoBuyRate'
                }
              });
            })
            // Get card buy and sell rate
            .then(function (company) {
              if (!company) {
                return false;
              }
              var settings = company.settings ? company.settings : { margin: 0.03 };
              // Populate merch
              var retailer = dbCard.retailer.populateMerchValues(dbCard);
              retailer = (0, _retailer3.retailerSetBuyAndSellRates)(retailer, settings, store, null, dbCard.balance);
              dbCard.buyRate = retailer.buyRate;
              dbCard.sellRate = retailer.sellRate;
              return dbCard.save();
            }).then(function (card) {
              if (card) {
                return res.json(card);
              }
              return res.status(500).json({ error: 'Unable to create card' });
            }).catch(function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return _errorLog2.default.create({
                          method: 'newCard',
                          controller: 'card.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 2:
                        console.log('**************NEW CARD ERR**********');
                        console.log(err);
                        throw err;

                      case 5:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this4);
              }));

              return function (_x17) {
                return _ref8.apply(this, arguments);
              };
            }()));

          case 7:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function newCard(_x15, _x16) {
    return _ref7.apply(this, arguments);
  };
}();

/**
 * Get existing cards
 */


var getExistingCards = exports.getExistingCards = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var customerId, userCompany, customer, cards;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            customerId = req.params.customerId;
            userCompany = req.user.company;
            // Make sure that the customer being queried belongs to the company that the user belongs to

            _context9.next = 5;
            return _customer3.default.findOne({ _id: customerId, company: userCompany });

          case 5:
            customer = _context9.sent;

            if (customer) {
              _context9.next = 8;
              break;
            }

            return _context9.abrupt('return', res.status(401).json({ err: 'Customer does not belong to this company' }));

          case 8:
            _context9.next = 10;
            return _card3.default.find({
              customer: customer,
              inventory: { $exists: false }
            }).populate('retailer').sort({ created: -1 });

          case 10:
            cards = _context9.sent;
            return _context9.abrupt('return', res.json({ data: cards }));

          case 14:
            _context9.prev = 14;
            _context9.t0 = _context9['catch'](0);
            _context9.next = 18;
            return _errorLog2.default.create({
              method: 'getExistingCards',
              controller: 'card.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context9.t0.stack,
              error: _context9.t0,
              user: req.user._id
            });

          case 18:
            return _context9.abrupt('return', res.status(500).json({ err: _context9.t0 }));

          case 19:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[0, 14]]);
  }));

  return function getExistingCards(_x18, _x19) {
    return _ref9.apply(this, arguments);
  };
}();

/**
 * Get existing cards for receipt
 */


/**
 * Edit an existing card
 */
var editCard = exports.editCard = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var _this6 = this;

    var _req$body2, _id, number, pin, retailerId, merchandise, userid, _card, dbCard;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _req$body2 = req.body, _id = _req$body2._id, number = _req$body2.number, pin = _req$body2.pin, retailerId = _req$body2.retailer.retailerId, merchandise = _req$body2.merchandise;
            userid = req.user._id.toString();
            _context12.next = 4;
            return _card3.default.findOne({ _id: _id });

          case 4:
            _card = _context12.sent;

            if (_card) {
              _context12.next = 7;
              break;
            }

            return _context12.abrupt('return', res.status(404).json({ err: 'Card does not exist' }));

          case 7:
            if (!(_card.user.toString() !== userid)) {
              _context12.next = 9;
              break;
            }

            return _context12.abrupt('return', res.status(401).json({ err: 'Card does not belong to this customer' }));

          case 9:
            dbCard = void 0;
            // Find and update card

            _context12.next = 12;
            return _card3.default.findById(_id).populate('retailer').then(function (card) {
              dbCard = card;
              dbCard.number = number;
              dbCard.pin = pin;
              dbCard.merchandise = merchandise;
              return dbCard.save();
            })
            // Remove any existing deferred
            .then(function (card) {
              dbCard = card;
              return _deferredBalanceInquiries2.default.remove({ card: _id });
            }).then(function () {
              return _company2.default.findById(req.user.company);
            }).then(function (company) {
              return company.getSettings();
            })
            // Recalculate buy and sell rates
            .then(function (settings) {
              var retailer = (0, _retailer3.retailerSetBuyAndSellRates)(dbCard.retailer, settings, req.user.store, null, dbCard.merchandise);
              dbCard.buyRate = retailer.buyRate;
              dbCard.sellRate = retailer.sellRate;
              return dbCard.save();
            })
            // return response
            .then(function () {
              return res.json(dbCard);
            })
            // Begin balance inquiry
            .then(function () {
              return balanceInquiry(retailerId, number, pin, _id, req.user._id, req.user.company);
            }).catch(function () {
              var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(err) {
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _context11.next = 2;
                        return _errorLog2.default.create({
                          method: 'editCard',
                          controller: 'card.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 2:
                        res.status(500).json(err);

                      case 3:
                      case 'end':
                        return _context11.stop();
                    }
                  }
                }, _callee11, _this6);
              }));

              return function (_x23) {
                return _ref12.apply(this, arguments);
              };
            }());

          case 12:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function editCard(_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}();

/**
 * Remove a card
 * @param cardId Card ID
 * @param user User making the request
 * @returns {*}
 */


var removeCard = function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(cardId, user) {
    var card, cardCompany, cardUser, deferredResponse, cardUpdateResponse;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return _card3.default.findById(cardId);

          case 2:
            card = _context13.sent;

            if (card) {
              _context13.next = 5;
              break;
            }

            return _context13.abrupt('return', 'notFound');

          case 5:
            cardCompany = card.company;

            if (cardCompany) {
              _context13.next = 11;
              break;
            }

            _context13.next = 9;
            return _user2.default.findOne(card.user[0]);

          case 9:
            cardUser = _context13.sent;

            cardCompany = cardUser.company;

          case 11:
            if (!(user.role === 'corporate-admin' && cardCompany.toString() !== user.company.toString())) {
              _context13.next = 15;
              break;
            }

            return _context13.abrupt('return', 'unauthorized');

          case 15:
            if (!(user.role === 'employee' && card.user[0].toString() !== user._id.toString())) {
              _context13.next = 17;
              break;
            }

            return _context13.abrupt('return', 'unauthorized');

          case 17:
            if (!card.inventory) {
              _context13.next = 19;
              break;
            }

            return _context13.abrupt('return', 'inventoryAttached');

          case 19:
            _context13.next = 21;
            return _deferredBalanceInquiries2.default.remove({ card: cardId });

          case 21:
            deferredResponse = _context13.sent;
            _context13.next = 24;
            return _cardUpdates2.default.remove({ card: cardId });

          case 24:
            cardUpdateResponse = _context13.sent;

            if (!(deferredResponse.result.ok && cardUpdateResponse.result.ok)) {
              _context13.next = 27;
              break;
            }

            return _context13.abrupt('return', 'CardRemoved');

          case 27:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function removeCard(_x24, _x25) {
    return _ref13.apply(this, arguments);
  };
}();

/**
 * handle the response from removing a card
 * @param res
 * @param removeValue Return value from remove card
 * @return {*}
 */


/**
 * Delete a card
 */
var deleteCard = exports.deleteCard = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(req, res) {
    var _cardId, removeValue;

    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.prev = 0;

            // Remove card
            _cardId = req.params.cardId;
            _context14.next = 4;
            return removeCard(_cardId, req.user);

          case 4:
            removeValue = _context14.sent;

            if (handleRemoveCardResponse(res, removeValue)) {
              _context14.next = 7;
              break;
            }

            return _context14.abrupt('return', res.status(500).json({ err: 'Unable to handle card removal' }));

          case 7:
            _context14.next = 16;
            break;

          case 9:
            _context14.prev = 9;
            _context14.t0 = _context14['catch'](0);

            console.log('**************DELETE CARD ERR**********');
            console.log(_context14.t0);
            _context14.next = 15;
            return _errorLog2.default.create({
              method: 'deleteCard',
              controller: 'card.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context14.t0.stack,
              error: _context14.t0,
              user: req.user._id
            });

          case 15:
            return _context14.abrupt('return', res.status(500).json(_context14.t0));

          case 16:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, this, [[0, 9]]);
  }));

  return function deleteCard(_x26, _x27) {
    return _ref14.apply(this, arguments);
  };
}();

/**
 * Make sure we have a valid number for inventory props
 * @param input
 */


/**
 * Add to inventory
 */
var addToInventory = exports.addToInventory = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(req, res) {
    var dbCards, dbInventories, _req$body3, userTime, modifiedDenials, store, _req$body3$transactio, transaction, _req$body3$callbackUr, callbackUrl, user, cards, rejectionTotal, thisOrderPurchaseAmount, tzOffset, realUserTime, company, noSmpCards, dbCompanySettings, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, thisCard, $set, dbCard, continueSale, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _thisCard, customer, denialPayment, paidTowardsRejection, cardIds, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, inventory, receipt, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _inventory;

    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            dbCards = [];
            dbInventories = [];
            _context15.prev = 2;
            _req$body3 = req.body, userTime = _req$body3.userTime, modifiedDenials = _req$body3.modifiedDenials, store = _req$body3.store, _req$body3$transactio = _req$body3.transaction, transaction = _req$body3$transactio === undefined ? null : _req$body3$transactio, _req$body3$callbackUr = _req$body3.callbackUrl, callbackUrl = _req$body3$callbackUr === undefined ? null : _req$body3$callbackUr;
            user = req.user;
            cards = req.body.cards;
            rejectionTotal = 0, thisOrderPurchaseAmount = 0;
            tzOffset = userTime.substr(-6);
            realUserTime = _moment2.default.utc().add(parseInt(tzOffset), 'hours').toDate();
            company = void 0;
            noSmpCards = [];
            _context15.next = 13;
            return _company2.default.findById(user.company);

          case 13:
            company = _context15.sent;
            _context15.next = 16;
            return company.getSettings();

          case 16:
            dbCompanySettings = _context15.sent;

            // Set buyAmount and balance for each card
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context15.prev = 20;
            _iterator = cards[Symbol.iterator]();

          case 22:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context15.next = 37;
              break;
            }

            thisCard = _step.value;
            $set = {
              balance: parseFloat(thisCard.balance)
            };

            if (thisCard.buyAmount) {
              $set.buyAmount = parseFloat(thisCard.buyAmount);
            }
            _context15.next = 28;
            return _card3.default.findByIdAndUpdate(thisCard._id, {
              $set: $set
            }).populate('retailer');

          case 28:
            dbCard = _context15.sent;
            _context15.t0 = dbCards;
            _context15.next = 32;
            return dbCard.save();

          case 32:
            _context15.t1 = _context15.sent;

            _context15.t0.push.call(_context15.t0, _context15.t1);

          case 34:
            _iteratorNormalCompletion = true;
            _context15.next = 22;
            break;

          case 37:
            _context15.next = 43;
            break;

          case 39:
            _context15.prev = 39;
            _context15.t2 = _context15['catch'](20);
            _didIteratorError = true;
            _iteratorError = _context15.t2;

          case 43:
            _context15.prev = 43;
            _context15.prev = 44;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 46:
            _context15.prev = 46;

            if (!_didIteratorError) {
              _context15.next = 49;
              break;
            }

            throw _iteratorError;

          case 49:
            return _context15.finish(46);

          case 50:
            return _context15.finish(43);

          case 51:
            continueSale = true;
            // Check to make sure we can sell all cards

            dbCards.forEach(function (card) {
              // Assign merch values, assume default if not set
              var retailer = card.retailer.populateMerchValues(card);
              var sellTo = (0, _card4.determineSellTo)(retailer, card.balance, dbCompanySettings);
              if (!sellTo) {
                continueSale = false;
                noSmpCards.push(card);
              }
            });
            // Don't continue

            if (continueSale) {
              _context15.next = 55;
              break;
            }

            return _context15.abrupt('return', res.status(400).json({ reason: 'noSmp', cards: noSmpCards }));

          case 55:
            // Remove any inventories which might exist for whatever reason
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context15.prev = 58;
            _iterator2 = dbCards[Symbol.iterator]();

          case 60:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context15.next = 68;
              break;
            }

            _thisCard = _step2.value;

            if (!_thisCard.inventory) {
              _context15.next = 65;
              break;
            }

            _context15.next = 65;
            return _inventory4.default
            // Find cards in inventory that have not been reconciled
            .remove({
              card: _thisCard._id
            });

          case 65:
            _iteratorNormalCompletion2 = true;
            _context15.next = 60;
            break;

          case 68:
            _context15.next = 74;
            break;

          case 70:
            _context15.prev = 70;
            _context15.t3 = _context15['catch'](58);
            _didIteratorError2 = true;
            _iteratorError2 = _context15.t3;

          case 74:
            _context15.prev = 74;
            _context15.prev = 75;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 77:
            _context15.prev = 77;

            if (!_didIteratorError2) {
              _context15.next = 80;
              break;
            }

            throw _iteratorError2;

          case 80:
            return _context15.finish(77);

          case 81:
            return _context15.finish(74);

          case 82:
            _context15.next = 84;
            return _customer3.default.findOne({ _id: cards[0].customer });

          case 84:
            customer = _context15.sent;

            rejectionTotal = parseFloat(customer.rejectionTotal);
            // Only subtract a specified amount from this sale if we have modified
            thisOrderPurchaseAmount = cards.reduce(determineOrderTotal, 0);
            // If we have a pending denial amount

            if (!(customer && typeof modifiedDenials === 'number' && modifiedDenials < rejectionTotal || !isNaN(rejectionTotal) && rejectionTotal)) {
              _context15.next = 97;
              break;
            }

            denialPayment = void 0;
            // This amount is still owed

            if (rejectionTotal > thisOrderPurchaseAmount || modifiedDenials) {
              // Modified denials
              paidTowardsRejection = typeof modifiedDenials === 'number' && modifiedDenials ? modifiedDenials : thisOrderPurchaseAmount;

              customer.rejectionTotal = rejectionTotal - paidTowardsRejection;
              denialPayment = new _denialPayment2.default({
                amount: paidTowardsRejection,
                userTime: userTime,
                customer: customer._id
              });
              // No further amount owed
            } else {
              customer.rejectionTotal = 0;
            }
            // Make sure we didn't screw up here
            customer.rejectionTotal = customer.rejectionTotal < 0 ? 0 : customer.rejectionTotal;

            if (!denialPayment) {
              _context15.next = 95;
              break;
            }

            _context15.next = 94;
            return denialPayment.save();

          case 94:
            denialPayment = _context15.sent;

          case 95:
            _context15.next = 97;
            return Promise.all([customer.save(), denialPayment ? denialPayment.save() : null]);

          case 97:
            _context15.next = 99;
            return createInventory(dbCards, userTime, req.user, dbCompanySettings, tzOffset, store, realUserTime, transaction, callbackUrl);

          case 99:
            dbInventories = _context15.sent;

            // Requery updated cards
            cardIds = [];
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context15.prev = 104;

            for (_iterator3 = dbInventories[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              inventory = _step3.value;

              cardIds.push(inventory.card);
            }
            _context15.next = 112;
            break;

          case 108:
            _context15.prev = 108;
            _context15.t4 = _context15['catch'](104);
            _didIteratorError3 = true;
            _iteratorError3 = _context15.t4;

          case 112:
            _context15.prev = 112;
            _context15.prev = 113;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 115:
            _context15.prev = 115;

            if (!_didIteratorError3) {
              _context15.next = 118;
              break;
            }

            throw _iteratorError3;

          case 118:
            return _context15.finish(115);

          case 119:
            return _context15.finish(112);

          case 120:
            _context15.next = 122;
            return _card3.default.find({
              '_id': { $in: cardIds }
            });

          case 122:
            dbCards = _context15.sent;
            _context15.next = 125;
            return addInventoryToCards(dbCards, dbInventories);

          case 125:
            receipt = new _receipt2.default();
            // Create receipts

            dbInventories.forEach(function (inventory, key) {
              if (!key) {
                receipt.customer = inventory.customer;
                receipt.userTime = realUserTime;
                receipt.user = user._id;
                receipt.store = store || req.user.store;
                receipt.company = req.user.company;
                // Amount of pending denials
                receipt.rejectionTotal = rejectionTotal;
                // Total amount of receipt
                receipt.total = thisOrderPurchaseAmount;
                // Applied towards denials
                receipt.appliedTowardsDenials = 0;
                // Grand total
                receipt.grandTotal = 0;
                // Amount remaining
                receipt.remainingDenials = 0;
                // Modified denial amount if we have one
                if (typeof modifiedDenials === 'number') {
                  receipt.modifiedDenialAmount = modifiedDenials;
                }
                // Determine amount applied towards denials
                if (rejectionTotal) {
                  // Apply modified amount
                  if (modifiedDenials) {
                    receipt.appliedTowardsDenials = modifiedDenials;
                    // Apply full amount
                  } else if (rejectionTotal >= thisOrderPurchaseAmount) {
                    receipt.appliedTowardsDenials = thisOrderPurchaseAmount;
                    // All denials paid, but receipt is higher value
                  } else {
                    receipt.appliedTowardsDenials = rejectionTotal;
                  }
                  receipt.grandTotal = thisOrderPurchaseAmount - receipt.appliedTowardsDenials;
                  // No denials, all cash
                } else {
                  receipt.grandTotal = thisOrderPurchaseAmount;
                }
              }
              receipt.inventories.push(inventory._id);
            });
            _context15.next = 129;
            return receipt.save();

          case 129:
            receipt = _context15.sent;

            // Add receipt to inventories
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            _context15.prev = 133;
            _iterator4 = dbInventories[Symbol.iterator]();

          case 135:
            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
              _context15.next = 143;
              break;
            }

            _inventory = _step4.value;

            _inventory.receipt = receipt._id;
            _context15.next = 140;
            return _inventory.save();

          case 140:
            _iteratorNormalCompletion4 = true;
            _context15.next = 135;
            break;

          case 143:
            _context15.next = 149;
            break;

          case 145:
            _context15.prev = 145;
            _context15.t5 = _context15['catch'](133);
            _didIteratorError4 = true;
            _iteratorError4 = _context15.t5;

          case 149:
            _context15.prev = 149;
            _context15.prev = 150;

            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }

          case 152:
            _context15.prev = 152;

            if (!_didIteratorError4) {
              _context15.next = 155;
              break;
            }

            throw _iteratorError4;

          case 155:
            return _context15.finish(152);

          case 156:
            return _context15.finish(149);

          case 157:
            return _context15.abrupt('return', res.json(receipt));

          case 160:
            _context15.prev = 160;
            _context15.t6 = _context15['catch'](2);
            _context15.next = 164;
            return _errorLog2.default.create({
              method: 'addToInventory',
              controller: 'card.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context15.t6.stack,
              error: _context15.t6,
              user: req.user._id
            });

          case 164:
            console.log('**************ADD TO INVENTORY ERR**********');
            console.log(_context15.t6);
            // Roll back inventory actions
            _context15.next = 168;
            return rollBackInventory(dbCards, dbInventories);

          case 168:
            res.status(500).json(_context15.t6);

          case 169:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this, [[2, 160], [20, 39, 43, 51], [44,, 46, 50], [58, 70, 74, 82], [75,, 77, 81], [104, 108, 112, 120], [113,, 115, 119], [133, 145, 149, 157], [150,, 152, 156]]);
  }));

  return function addToInventory(_x30, _x31) {
    return _ref15.apply(this, arguments);
  };
}();

/**
 * Modify an inventory item (admin)
 */


/**
 * Get inventory fr
 * @param cardId
 * @return {Promise.<void>}
 */
var getInventoryFromCard = function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(cardId) {
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            return _context22.abrupt('return', _card3.default.findById(cardId).populate('inventory'));

          case 1:
          case 'end':
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));

  return function getInventoryFromCard(_x38) {
    return _ref22.apply(this, arguments);
  };
}();

/**
 * Set inventory ship status
 */


var setCardValue = exports.setCardValue = function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(req, res) {
    var _this11 = this;

    var _req$body7, status, type, transaction, cardId, inventoryId, companyId, card;

    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            _req$body7 = req.body, status = _req$body7.status, type = _req$body7.type, transaction = _req$body7.transaction, cardId = _req$body7.cardId;
            inventoryId = req.body.inventoryId;
            companyId = req.params.companyId;
            // Staging testing

            if (!_environment2.default.isStaging) {
              _context24.next = 8;
              break;
            }

            _context24.next = 6;
            return getInventoryFromCard(cardId);

          case 6:
            card = _context24.sent;

            if (card) {
              try {
                inventoryId = card.inventory._id.toString();
              } catch (e) {
                console.log('**************IGNORE**********');
              }
            }

          case 8:
            return _context24.abrupt('return', new Promise(function (resolve, reject) {
              // Corporate
              if (companyId) {
                _inventory4.default.findById(inventoryId).populate('company').then(function (inventory) {
                  if (inventory.company._id.toString() !== companyId) {
                    return reject();
                  }
                  // Modify transaction
                  if (transaction) {
                    inventory.transaction[type] = status;
                  } else {
                    inventory[type] = status;
                  }
                  resolve(inventory.save());
                });
                // Admin
              } else {
                var promises = [];
                Promise.all(promises).then(function () {
                  _inventory4.default.findById(inventoryId).then(function (inventory) {
                    inventory[type] = status;
                    resolve(inventory.save());
                  });
                });
              }
            }).then(function () {
              if (type === 'activityStatus' && status === 'sentToSmp') {
                _card3.default.findOne({ inventory: inventoryId }).populate('inventory').then(function (card) {
                  if (card) {
                    new _callback2.default().sendCallback(card, 'cardFinalized');
                  }
                });
              }

              res.json();
            }).catch(function () {
              var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(err) {
                return regeneratorRuntime.wrap(function _callee23$(_context23) {
                  while (1) {
                    switch (_context23.prev = _context23.next) {
                      case 0:
                        _context23.next = 2;
                        return _errorLog2.default.create({
                          method: 'setCardValue',
                          controller: 'card.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 2:
                        console.log('**************UNABLE TO SET SHIP STATUS**********');
                        console.log(err);
                        return _context23.abrupt('return', res.status(500).json(err));

                      case 5:
                      case 'end':
                        return _context23.stop();
                    }
                  }
                }, _callee23, _this11);
              }));

              return function (_x41) {
                return _ref24.apply(this, arguments);
              };
            }()));

          case 9:
          case 'end':
            return _context24.stop();
        }
      }
    }, _callee24, this);
  }));

  return function setCardValue(_x39, _x40) {
    return _ref23.apply(this, arguments);
  };
}();

/**
 * Mass update inventories
 */


/**
 * Handle rejection of inventory
 * @param inventory Inventory record
 * @param customerUpdates Customer updates to make
 * @return {Promise.<*>}
 */
var handleInventoryReject = function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(inventory, customerUpdates) {
    var customerId, buyAmount, buyRate, realBuyAmount, deltaAmount;
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            customerId = inventory.customer._id;

            if (!customerUpdates[customerId]) {
              customerUpdates[customerId] = {
                credits: Array.isArray(inventory.customer.credits) ? inventory.customer.credits : [],
                rejections: Array.isArray(inventory.customer.rejections) ? inventory.customer.rejections : [],
                amount: typeof inventory.customer.rejectionTotal === 'number' ? inventory.customer.rejectionTotal : 0
              };
            }
            // Set rejection amount based on difference between paid and what should have been paid

            if (!(inventory.verifiedBalance !== 'undefined')) {
              _context26.next = 23;
              break;
            }

            // Original buy amount
            buyAmount = inventory.buyAmount;
            // Assume 10% for API, which has a bug until recently which didn't set buyAmount

            if (!buyAmount) {
              buyAmount = inventory.balance * 0.9;
            }
            buyRate = inventory.buyRate > 1 ? inventory.buyRate / 100 : inventory.buyRate;


            if (inventory.isApi) {
              buyRate = inventory.card.sellRate - 0.1;
            }

            // Buy amount after adjustment
            realBuyAmount = buyRate * inventory.verifiedBalance;

            if (!(realBuyAmount !== buyAmount)) {
              _context26.next = 23;
              break;
            }

            // Reset amount of previous rejection
            if (inventory.rejected && inventory.rejectAmount) {
              customerUpdates[customerId].amount = customerUpdates[customerId].amount - inventory.rejectAmount;
            }

            // Reset amount of previous credit
            if (inventory.credited && inventory.creditAmount) {
              customerUpdates[customerId].amount = customerUpdates[customerId].amount + inventory.creditAmount;
            }

            deltaAmount = buyAmount - realBuyAmount;

            customerUpdates[customerId].amount += deltaAmount;

            if (deltaAmount > 0) {
              // Add to rejection list
              if (customerUpdates[customerId].rejections.indexOf(inventory._id) === -1) {
                customerUpdates[customerId].rejections.push(inventory._id);
              }

              // Remove from credit list
              if (customerUpdates[customerId].credits.indexOf(inventory._id) !== -1) {
                customerUpdates[customerId].credits.splice(customerUpdates[customerId].credits.indexOf(inventory._id), 1);
              }
            } else {
              // Add to credit list
              if (customerUpdates[customerId].credits.indexOf(inventory._id) === -1) {
                customerUpdates[customerId].credits.push(inventory._id);
              }

              // Remove from rejection list
              if (customerUpdates[customerId].rejections.indexOf(inventory._id) !== -1) {
                customerUpdates[customerId].rejections.splice(customerUpdates[customerId].rejections.indexOf(inventory._id), 1);
              }
            }

            inventory.rejected = deltaAmount > 0;
            inventory.rejectedDate = inventory.rejected ? Date.now() : null;
            inventory.rejectAmount = inventory.rejected ? deltaAmount : null;
            inventory.credited = deltaAmount < 0;
            inventory.creditedDate = inventory.credited ? Date.now() : null;
            inventory.creditAmount = inventory.credited ? Math.abs(deltaAmount) : null;
            _context26.next = 22;
            return inventory.save();

          case 22:
            return _context26.abrupt('return', _context26.sent);

          case 23:
            Promise.resolve(false);

          case 24:
          case 'end':
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));

  return function handleInventoryReject(_x43, _x44) {
    return _ref26.apply(this, arguments);
  };
}();

/**
 * Reject selected inventories
 */


var rejectCards = exports.rejectCards = function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(req, res) {
    var _this13 = this;

    var ids, customerUpdates;
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            ids = req.body.inventories;
            customerUpdates = {};

            _inventory4.default.find({
              _id: {
                $in: ids
              }
            }).populate('customer').populate('card').populate('retailer').then(function () {
              var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(inventories) {
                var inventoriesFinal, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, inventory, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _inventory2, promises;

                return regeneratorRuntime.wrap(function _callee27$(_context27) {
                  while (1) {
                    switch (_context27.prev = _context27.next) {
                      case 0:
                        inventoriesFinal = [];
                        // Handle reject on each inventory

                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context27.prev = 4;
                        _iterator7 = inventories[Symbol.iterator]();

                      case 6:
                        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                          _context27.next = 15;
                          break;
                        }

                        inventory = _step7.value;
                        _context27.next = 10;
                        return handleInventoryReject(inventory, customerUpdates);

                      case 10:
                        inventory = _context27.sent;

                        if (inventory === false) {
                          res.status(400).json({ err: 'Unable to find inventory to reject' });
                        } else {
                          inventoriesFinal.push(inventory);
                        }

                      case 12:
                        _iteratorNormalCompletion7 = true;
                        _context27.next = 6;
                        break;

                      case 15:
                        _context27.next = 21;
                        break;

                      case 17:
                        _context27.prev = 17;
                        _context27.t0 = _context27['catch'](4);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context27.t0;

                      case 21:
                        _context27.prev = 21;
                        _context27.prev = 22;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                          _iterator7.return();
                        }

                      case 24:
                        _context27.prev = 24;

                        if (!_didIteratorError7) {
                          _context27.next = 27;
                          break;
                        }

                        throw _iteratorError7;

                      case 27:
                        return _context27.finish(24);

                      case 28:
                        return _context27.finish(21);

                      case 29:
                        // Send callbacks for credit/rejection
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context27.prev = 32;
                        _iterator8 = inventories[Symbol.iterator]();

                      case 34:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                          _context27.next = 42;
                          break;
                        }

                        _inventory2 = _step8.value;

                        if (!(_inventory2.card && _inventory2.isTransaction)) {
                          _context27.next = 39;
                          break;
                        }

                        _context27.next = 39;
                        return (0, _card4.recalculateTransactionAndReserve)(_inventory2);

                      case 39:
                        _iteratorNormalCompletion8 = true;
                        _context27.next = 34;
                        break;

                      case 42:
                        _context27.next = 48;
                        break;

                      case 44:
                        _context27.prev = 44;
                        _context27.t1 = _context27['catch'](32);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context27.t1;

                      case 48:
                        _context27.prev = 48;
                        _context27.prev = 49;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                          _iterator8.return();
                        }

                      case 51:
                        _context27.prev = 51;

                        if (!_didIteratorError8) {
                          _context27.next = 54;
                          break;
                        }

                        throw _iteratorError8;

                      case 54:
                        return _context27.finish(51);

                      case 55:
                        return _context27.finish(48);

                      case 56:
                        promises = [];

                        _lodash2.default.forEach(customerUpdates, function (update, id) {
                          promises.push(_customer3.default.update({
                            _id: id
                          }, {
                            $set: {
                              rejectionTotal: update.amount,
                              rejections: update.rejections,
                              credits: update.credits
                            }
                          }).then(function () {
                            return {};
                          }));
                        });

                      case 58:
                      case 'end':
                        return _context27.stop();
                    }
                  }
                }, _callee27, _this13, [[4, 17, 21, 29], [22,, 24, 28], [32, 44, 48, 56], [49,, 51, 55]]);
              }));

              return function (_x47) {
                return _ref28.apply(this, arguments);
              };
            }()).then(function () {
              res.json();
            }).catch(function () {
              var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(err) {
                return regeneratorRuntime.wrap(function _callee28$(_context28) {
                  while (1) {
                    switch (_context28.prev = _context28.next) {
                      case 0:
                        _context28.next = 2;
                        return _errorLog2.default.create({
                          method: 'rejectCards',
                          controller: 'card.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 2:
                        console.log('**************ERR ADDING REJECTIONS**********');
                        console.log(err);
                        return _context28.abrupt('return', res.status(500).json({}));

                      case 5:
                      case 'end':
                        return _context28.stop();
                    }
                  }
                }, _callee28, _this13);
              }));

              return function (_x48) {
                return _ref29.apply(this, arguments);
              };
            }());

          case 3:
          case 'end':
            return _context29.stop();
        }
      }
    }, _callee29, this);
  }));

  return function rejectCards(_x45, _x46) {
    return _ref27.apply(this, arguments);
  };
}();

/**
 * Resell cards which have not already been sent to an SMP to determine new best rates
 */


exports.balanceInquiry = balanceInquiry;
exports.getExistingCardsReceipt = getExistingCardsReceipt;
exports.modifyInventory = modifyInventory;
exports.updateDetails = updateDetails;
exports.createFakeCards = createFakeCards;
exports.uploadCards = uploadCards;
exports.uploadFixes = uploadFixes;
exports.runBi = runBi;
exports.moveForSale = moveForSale;
exports.editBalance = editBalance;
exports.massUpdate = massUpdate;
exports.resellCards = resellCards;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fastCsv = require('fast-csv');

var _fastCsv2 = _interopRequireDefault(_fastCsv);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

var _card2 = require('./card.model');

var _card3 = _interopRequireDefault(_card2);

var _cardUpdates = require('../cardUpdates/cardUpdates.model');

var _cardUpdates2 = _interopRequireDefault(_cardUpdates);

var _deferredBalanceInquiries = require('../deferredBalanceInquiries/deferredBalanceInquiries.model');

var _deferredBalanceInquiries2 = _interopRequireDefault(_deferredBalanceInquiries);

var _inventory3 = require('../inventory/inventory.model');

var _inventory4 = _interopRequireDefault(_inventory3);

var _customer2 = require('../customer/customer.model');

var _customer3 = _interopRequireDefault(_customer2);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _receipt = require('../receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _batch = require('../batch/batch.model');

var _batch2 = _interopRequireDefault(_batch);

var _denialPayment = require('../denialPayment/denialPayment.model');

var _denialPayment2 = _interopRequireDefault(_denialPayment);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _biRequestLog = require('../biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _callback = require('../callbackLog/callback');

var _callback2 = _interopRequireDefault(_callback);

var _retailer3 = require('../retailer/retailer.controller');

var _card4 = require('../card/card.helpers');

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Default user name
var defaultName = '__default__';

/**
 * Test cards
 */
var testRetailerIds = ['952', '1045'];
var testNumbers = ['55555', '44444', '33333', '22222'];
var allowTest = true;

// Output BI results for testing
var testBiMockData = exports.testBiMockData = [];

/**
 * Create an update record when a card is updated
 * @param userId User ID of the user making the request
 * @param biResponse Response from balance inquiry service
 * @param card Card document
 * @param balance Card balance
 * @returns {*}
 */
function createCardUpdate(userId, biResponse, card, balance) {
  // Create update record
  var update = new _cardUpdates2.default();
  update.card = card._id;
  update.user = [userId];
  var manualCodes = [_environment2.default.biCodes.timeout, _environment2.default.biCodes.headerError, _environment2.default.biCodes.authenticationError, _environment2.default.biCodes.invalid, _environment2.default.biCodes.retailerNotSupported, _environment2.default.biCodes.retailerDisabled, _environment2.default.biCodes.inStoreBalanceOnly, _environment2.default.biCodes.phoneBalanceOnly, _environment2.default.biCodes.systemDown];
  // Retailer not supported
  if (manualCodes.indexOf(biResponse.responseCode) !== -1 || /error/i.test(biResponse)) {
    update.balanceStatus = 'manual';
    // Success
  } else if (biResponse.responseCode === _environment2.default.biCodes.success) {
    update.balanceStatus = 'received';
    update.balance = balance;
    // Default to defer
  } else {
    update.balanceStatus = 'deferred';
  }
  return update.save();
}

/**
 * Update BI log
 * @param log BI log
 * @param biResponse Response from BI
 * @param balance Balance
 * @return {*}
 */
function updateBiLog(log, biResponse, balance) {
  if (typeof balance !== 'undefined') {
    log.balance = balance;
  }
  // Update unless unknown, auth error, or system problems
  if ([_environment2.default.biCodes.unknownRequest, _environment2.default.biCodes.headerError, _environment2.default.biCodes.systemDown].indexOf(log.responseCode) === -1) {
    log.verificationType = biResponse.verificationType;
    log.responseDateTime = biResponse.responseDateTime;
    // Insert request ID
    if (typeof log.requestId === 'undefined') {
      log.requestId = biResponse.requestId;
    }
    log.responseCode = biResponse.responseCode;
    log.responseMessage = biResponse.responseMessage;
    if ([_environment2.default.biCodes.success, _environment2.default.biCodes.invalid, _environment2.default.biCodes.retailerNotSupported, _environment2.default.biCodes.inStoreBalanceOnly, _environment2.default.biCodes.phoneBalanceOnly].indexOf(log.responseCode) > -1) {
      log.finalized = true;
    }
  }
  return log;
}

/**
 * Update a card during a balance inquiry
 * @param dbCard Card document
 * @param update Update document
 * @param balance Card balance
 * @param biResponse Exact response from BI
 * @returns {*}
 */
function updateCardDuringBalanceInquiry(dbCard, update, balance, biResponse) {
  var _this = this;

  if (_environment2.default.debug) {
    console.log('**************UPDATE CARD DURING BALANCE INQUIRY**********');
    console.log(dbCard);
    console.log(update);
    console.log(balance);
    console.log(biResponse);
  }
  // Push update onto card
  dbCard.updates.push(update._id);
  // Update card info
  dbCard.balanceStatus = update.balanceStatus;
  // Bad card
  if (dbCard.balanceStatus === 'bad' || dbCard.balanceStatus === 'manual') {
    // Set invalid
    if (dbCard.balanceStatus === 'bad') {
      dbCard.valid = false;
    }
    return dbCard.save();
  }
  // Successful balance
  var hasBalance = typeof balance !== 'undefined';
  // For when we don't have a card
  var biSearchParams = {
    number: dbCard.number,
    retailerId: dbCard.retailer._id
  };
  if (dbCard.pin) {
    biSearchParams.pin = dbCard.pin;
  }

  // Update log if we have one
  _biRequestLog2.default.findOne({
    $or: [{
      card: dbCard._id
    }, biSearchParams]
  }).then(function (log) {
    if (log) {
      // Update BI log
      log = updateBiLog(log, biResponse, balance);
      return log.save();
    } else {
      return false;
    }
  })
  // Create log if we don't have one
  .then(function (log) {
    // Create BiLog
    if (log === false) {
      var biParams = {
        number: dbCard.number,
        retailerId: dbCard.retailer._id,
        card: dbCard._id,
        responseDateTime: biResponse.response_datetime,
        requestId: biResponse.requestId,
        responseCode: biResponse.responseCode,
        responseMessage: update.balanceStatus
      };
      if (dbCard.pin) {
        biParams.pin = dbCard.pin;
      }
      if (hasBalance) {
        biParams.balance = balance;
      }
      log = new _biRequestLog2.default(biParams);
      return log.save();
    }
  })
  // Update card and inventory
  .then(function () {
    // Have inventory, update it
    if (hasBalance && dbCard.inventory) {
      dbCard.inventory.verifiedBalance = balance;
      dbCard.inventory.save().then(function () {});
      // No inventory, set VB on card
    } else if (hasBalance) {
      dbCard.verifiedBalance = balance;
    }

    return dbCard.save();
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _errorLog2.default.create({
                method: 'updateCardDuringBalanceInquiry',
                controller: 'card.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              console.log('**************ERR IN updateCardDuringBalanceInquiry**********');
              console.log(e);

            case 4:
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

/**
 * Handle BI response
 * @param resolve
 * @param reject
 * @param _id
 * @param userId
 * @param error
 * @param stdout Example: { verificationType: 'PJVT_BOT',
                            balance: 'Null',
                            response_datetime: '2017-08-17 12:06:30.343142',
                            responseMessage: 'Delayed Verification Required',
                            requestId: '2085642553683708326',
                            responseCode: '010',
                            request_id: '2085642553683708326',
                            responseDateTime: '2017-08-17 12:06:30.343142',
                            recheck: 'True',
                            recheckDateTime: '2017-08-17 13:06:31.230734' }
 * @param stderr
 * @return {*}
 */
function handleBiResponse(resolve, reject, _id, userId, error, stdout, stderr) {
  var _this2 = this;

  console.log('**************HANDLE BI RES**********');
  console.log(arguments);
  console.log(stdout);
  console.log(stderr);
  var biResponse = void 0;
  if (_environment2.default.debug) {
    console.log('**************BI STDOUT**********');
    console.log(stdout);
  }
  if (stderr) {
    // No card
    if (_id === null) {
      return resolve({ response: 'Unable to retrieve balance' });
    }
    return reject(stderr);
  }

  try {
    // BI response output
    biResponse = JSON.parse(stdout);
  } catch (err) {
    if (err.constructor.name === 'SyntaxError') {
      return null;
    }
  }
  // Check response
  if (_environment2.default.debug) {
    console.log('**************BI RESPONSE**********');
    console.log(biResponse);
  }
  // Ignore BI errors
  if (typeof biResponse === 'string') {
    return resolve(biResponse);
  }
  var success = void 0;
  // Success or failure of BI request
  if (biResponse.responseMessage) {
    success = biResponse.responseMessage === 'success';
  }
  var balance = null;
  // Parse successful response
  if (success) {
    // Balance
    balance = parseFloat(biResponse.balance);
    // Balance is null
    if (isNaN(balance)) {
      balance = null;
    }
    // No card ID, just return balance, don't update card
    if (_id === null) {
      var final = Object.assign(biResponse, { balance: balance });
      return resolve(final);
    }
  } else {
    // No card ID, just return balance, don't update card
    if (_id === null) {
      if (typeof biResponse === 'string') {
        biResponse = { error: biResponse };
      }
      return resolve(biResponse);
    }
  }
  // Existing card
  var dbCard = {};
  // Find card
  return _card3.default.findById(_id).populate('retailer').populate('inventory')
  // Update record
  .then(function (card) {
    dbCard = card;
    // Create update record
    return createCardUpdate(userId, biResponse, card, balance);
  })
  // Update card
  .then(function (update) {
    return updateCardDuringBalanceInquiry(dbCard, update, balance, biResponse);
  }).then(function () {
    // Attach request ID
    if (!_lodash2.default.isPlainObject(dbCard)) {
      dbCard = dbCard.toObject();
      dbCard.requestId = biResponse.requestId;
    }
    resolve(dbCard);
  }).catch(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _errorLog2.default.create({
                method: 'handleBiResponse',
                controller: 'card.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: userId
              });

            case 2:
              reject(err);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
}

/**
 * Perform the actual balance inquiry
 * @param retailerId Retailer ID
 * @param number Card number
 * @param pin Card pin
 * @param _id Card record ID
 * @param userId User ID making request
 * @param companyId Company ID
 * @param requestId Request ID for deferred checks
 */
function balanceInquiry(retailerId, number, pin, _id, userId, companyId, requestId) {
  var _this3 = this;

  var helpersPath = _path2.default.resolve(__dirname, '../../../helpers');
  var exec = void 0;
  var env = void 0;
  // If vista, use vista
  var script = companyId && Array.isArray(_environment2.default.vistaBiUser) && _environment2.default.vistaBiUser.indexOf(companyId.toString()) > -1 ? 'balanceInquiry-vista.php' : 'balanceInquiry.php';
  if (_environment2.default.env === 'development' || _environment2.default.env === 'test') {
    env = 'development=true staging=false';
  } else if (_environment2.default.isStaging === 'true') {
    env = 'development=false staging=true';
  } else {
    env = 'development=false staging=false';
  }
  if (requestId) {
    exec = env + ' php -f ' + helpersPath + '/' + script + ' ' + requestId;
  } else {
    if (pin) {
      exec = env + ' php -f ' + helpersPath + '/' + script + ' ' + retailerId + ' ' + number + ' ' + pin;
    } else {
      exec = env + ' php -f ' + helpersPath + '/' + script + ' ' + retailerId + ' ' + number;
    }
  }
  // Separate out the BI response for testing purposes
  if (_environment2.default.env === 'test') {
    return new Promise(function (resolve, reject) {
      var handleBiResponseBound = handleBiResponse.bind(_this3, resolve, reject, _id, userId);
      handleBiResponseBound(null, JSON.stringify(testBiMockData[testBiMockData.length - 1].params), null);
    });
  } else {
    console.log('**************EXEC**********');
    console.log(exec);
  }
  return new Promise(function (resolve, reject) {
    var handleBiResponseBound = handleBiResponse.bind(_this3, resolve, reject, _id, userId);
    _child_process2.default.exec(exec, handleBiResponseBound);
  });
}function checkBiIdExists(retailer) {
  if (!(retailer.gsId || retailer.aiId)) {
    throw 'biUnavailableThisRetailer';
  }
}function findCards(retailer, number, customer, pin) {
  if (retailer && number && customer) {
    return _card3.default.findOne({
      retailer: retailer,
      number: number,
      customer: customer
    });
  } else if (typeof retailer !== 'undefined' && typeof number !== 'undefined') {
    if (pin) {
      return _card3.default.findOne({
        retailer: retailer,
        number: number,
        pin: pin
      });
    } else {
      return _card3.default.findOne({
        retailer: retailer,
        number: number
      });
    }
  }
}

/**
 * Create a default user if necessary
 * @param body Request body
 * @param reqUser Current user
 * @returns {Promise}
 */
function createDefaultCustomer(body, reqUser) {
  return new Promise(function (resolve) {
    if (body.customer === 'default') {
      // Find default user this company
      _customer3.default.findOne({
        company: reqUser.company,
        firstName: defaultName,
        lastName: defaultName
      }).then(function (customer) {
        // No default customer, create one
        if (!customer) {
          var _customer = new _customer3.default({
            firstName: defaultName,
            lastName: defaultName,
            stateId: defaultName,
            address1: defaultName,
            city: defaultName,
            state: defaultName,
            zip: defaultName,
            phone: defaultName,
            company: reqUser.company
          });
          _customer.save().then(function (customer) {
            resolve(customer._id);
          });
        } else {
          // Default user exists
          resolve(customer._id);
        }
      });
    } else {
      resolve(body.customer);
    }
  });
}

/**
 * Check if this is a test card
 * @param card
 * @returns {boolean}
 */
function isTestCard(card) {
  return allowTest && testRetailerIds.indexOf(card.uid) !== -1 && testNumbers.indexOf(card.number) !== -1;
}function getExistingCardsReceipt(req, res) {
  var _this5 = this;

  var customer = req.params.customerId;
  // Find inventories for the default customer for this store
  if (customer === 'default') {} else {
    _inventory4.default.find({
      reconciliation: { $exists: false },
      customer: customer
    }).sort({ created: -1 }).populate('retailer').populate('card').then(function (inventories) {
      return res.json({ data: inventories });
    }).catch(function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return _errorLog2.default.create({
                  method: 'getExistingCardsReceipt',
                  controller: 'card.controller',
                  revision: (0, _errors.getGitRev)(),
                  stack: err.stack,
                  error: err,
                  user: req.user._id
                });

              case 2:
                return _context10.abrupt('return', res.status(500).json(err));

              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, _this5);
      }));

      return function (_x20) {
        return _ref10.apply(this, arguments);
      };
    }());
  }
}function handleRemoveCardResponse(res, removeValue) {
  if (removeValue) {
    switch (removeValue) {
      case 'notFound':
        res.status(404).send('');
        return true;
      case 'unauthorized':
        res.status(401).send('');
        return true;
      case 'inventoryAttached':
        res.status(400).json({ err: 'Cannot remove a card with an inventory attached' });
        return true;
      case 'CardRemoved':
        res.status(200).send('Card successfully removed');
        return true;
    }
  }
  return false;
}function ensureValidInventoryNumber(input) {
  if (isNaN(input)) {
    return 0;
  }
  if (typeof input !== 'number') {
    return 0;
  }
  return input;
}

/**
 * Create inventories
 * @param cards
 * @param userTime
 * @param user
 * @param companySettings
 * @param tzOffset Timezone offset
 * @param store Store override
 * @param realUserTime Calculated userTime
 * @param transaction Transaction data, if transaction
 * @param callbackUrl Callback URL for when verified balance is retrieved
 */
function createInventory(cards, userTime, user, companySettings, tzOffset) {
  var store = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var realUserTime = arguments[6];
  var transaction = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var callbackUrl = arguments[8];

  var inventoryPromises = [];
  _lodash2.default.forEach(cards, function (card) {
    var inventory = new _inventory4.default();
    // Save the local time that the user created this inventory
    inventory.userTime = userTime;
    var balance = parseFloat(card.balance);
    var buyRate = parseFloat(card.buyRate);
    var buyAmount = parseFloat(card.buyAmount);
    inventory.card = card._id;
    inventory.user = user._id;
    inventory.store = store || user.store;
    inventory.company = user.company;
    inventory.balance = ensureValidInventoryNumber(balance);
    inventory.buyRate = ensureValidInventoryNumber(buyRate);
    inventory.buyAmount = ensureValidInventoryNumber(buyAmount);
    inventory.customer = card.customer;
    inventory.retailer = card.retailer._id;
    // Auto-sell
    inventory.proceedWithSale = companySettings ? companySettings.autoSell : true;
    // Margin
    inventory.margin = companySettings ? companySettings.margin : 0.03;
    // Merchandise
    inventory.merchandise = card.merchandise;
    // Transaction
    inventory.isTransaction = !!transaction;
    inventory.transaction = transaction;
    inventory.callbackUrl = callbackUrl;
    inventory.serviceFee = typeof companySettings.serviceFee === 'number' ? companySettings.serviceFee : _environment2.default.serviceFee;
    // Card is already populated with merch values
    var sellTo = (0, _card4.determineSellTo)(card.retailer, inventory.balance, companySettings);
    if (sellTo) {
      // Rate at the time of purchase
      inventory.sellRateAtPurchase = sellTo.rate;
      // Timezone offset
      inventory.tzOffset = tzOffset;
      inventory.created = realUserTime;
      inventory.userTime = realUserTime;
      inventoryPromises.push(inventory.save());
    }
  });
  return Promise.all(inventoryPromises);
}

/**
 * Add inventory records to cards after inventory is created
 * @param cards
 * @param dbInventories
 */
function addInventoryToCards(cards, dbInventories) {
  var cardPromises = [];
  // Iterate cards
  cards.forEach(function (card) {
    // iterate inventories and find the corresponding inventory for each card
    dbInventories.forEach(function (dbInventory) {
      if (card._id.toString() === dbInventory.card.toString()) {
        card.inventory = dbInventory._id;
        cardPromises.push(card.save());
      }
    });
  });
  return Promise.all(cardPromises);
}

/**
 * Roll back additions to inventory
 * @param dbCards
 * @param dbInventories
 */
function rollBackInventory(dbCards, dbInventories) {
  var errorPromises = [];
  // Roll back cards
  dbCards.forEach(function (card) {
    delete card.inventory;
    errorPromises.push(card.save());
  });
  // Remove inventories
  dbInventories.forEach(function (inventory) {
    errorPromises.push(inventory.remove());
  });
  return Promise.all(errorPromises);
}

/**
 * Determine sale total for display on receipt (reducer)
 * @returns Number
 */
function determineOrderTotal(curr, next) {
  // Use buy amount explicitly set
  if (typeof next.buyAmount === 'number') {
    return curr + next.buyAmount;
  }
  var balance = parseFloat(next.balance);
  var buyRate = parseFloat(next.buyRate);
  // No balance, ain't worth it
  if (!balance || !buyRate || isNaN(balance) || isNaN(buyRate)) {
    return curr + 0;
  }
  // Use buy rate and balance
  if (next.buyRate) {
    return curr + buyRate * balance;
  }
  // Give up on life, your hopes, your dreams
  return curr + 0;
}function modifyInventory(req, res) {
  var _this7 = this;

  var body = req.body;
  // Find the current inventory
  _inventory4.default.findById(body.inventory._id).then(function (inventory) {
    switch (body.value) {
      case 'notAddedToLiquidation':
        inventory.addedToLiquidation = false;
        inventory.soldToLiquidation = false;
        break;
      case 'addedToLiquidation':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'rateVerified':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'rateVerifiedNotAcceptable':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = false;
        break;
      case 'soldToLiquidation':
        inventory.addedToLiquidation = true;
        inventory.soldToLiquidation = true;
        break;
    }
    inventory.save();
  }).then(function (inventory) {
    return res.json(inventory);
  }).catch(function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(err) {
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _errorLog2.default.create({
                method: 'modifyInventory',
                controller: 'card.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              console.log('**************MODIFY INVENTORY ERROR**********');
              console.log(err);
              return _context16.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, _this7);
    }));

    return function (_x32) {
      return _ref16.apply(this, arguments);
    };
  }());
}

/**
 * Update specific value on an inventory
 * @param inventory Inventory
 * @param key Key
 * @param value Value
 */
function updateInventoryValue(inventory, key, value) {
  if (typeof value !== 'undefined') {
    switch (key) {
      case 'created':
        inventory.created = new Date(value);
        inventory.userTime = new Date(value);
        break;
      // Update SMP rate and SMP paid
      case 'liquidationRate':
        value = parseFloat(value);
        value = value > 1 ? value / 100 : value;
        var balance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : inventory.balance;
        inventory.liquidationRate = value;
        inventory.liquidationSoldFor = balance * value;
        break;
      default:
        inventory[key] = value;
        inventory.card[key] = value;
    }
  }
  return inventory;
}

/**
 * Change SMP, PIN, or number for a card
 * @param req
 * @param res
 */
function updateDetails(req, res) {
  var _this8 = this;

  var ids = req.body.ids;
  var _req$body4 = req.body,
      smp = _req$body4.smp,
      activityStatus = _req$body4.activityStatus,
      cqAch = _req$body4.cqAch,
      batch = _req$body4.batch;

  var body = req.body;
  // SMPs
  var smps = _environment.smpIds;
  _inventory4.default.find({
    _id: {
      $in: ids
    }
  }).populate('card').populate('batch').then(function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(inventories) {
      var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, inventory, mutable, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, key, oldBatch, callback;

      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context17.prev = 3;
              _iterator5 = inventories[Symbol.iterator]();

            case 5:
              if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                _context17.next = 42;
                break;
              }

              inventory = _step5.value;

              // I have no idea why there are multiple values for liquidationSoldFor
              mutable = ['activityStatus', 'orderNumber', 'smpAch', 'cqAch', 'liquidationSoldFor', 'liquidationSoldFor2', 'liquidationRate', 'customer', 'number', 'pin', 'created', 'user', 'store', 'margin', 'serviceFee', 'retailer'];
              // Update mutable values

              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context17.prev = 11;
              for (_iterator6 = mutable[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                key = _step6.value;

                inventory = updateInventoryValue(inventory, key, body[key]);
              }
              _context17.next = 19;
              break;

            case 15:
              _context17.prev = 15;
              _context17.t0 = _context17['catch'](11);
              _didIteratorError6 = true;
              _iteratorError6 = _context17.t0;

            case 19:
              _context17.prev = 19;
              _context17.prev = 20;

              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }

            case 22:
              _context17.prev = 22;

              if (!_didIteratorError6) {
                _context17.next = 25;
                break;
              }

              throw _iteratorError6;

            case 25:
              return _context17.finish(22);

            case 26:
              return _context17.finish(19);

            case 27:
              if (smp) {
                inventory.smp = smps[smp.toUpperCase()];
              }

              if (!batch) {
                _context17.next = 35;
                break;
              }

              oldBatch = inventory.batch;
              // Remove from old batch

              _context17.next = 32;
              return oldBatch.update({
                $pull: {
                  inventories: inventory._id
                }
              });

            case 32:
              _context17.next = 34;
              return _batch2.default.update({ _id: batch }, {
                $addToSet: {
                  inventories: inventory._id
                }
              });

            case 34:
              // Update inventory batch
              inventory.batch = batch;

            case 35:
              _context17.next = 37;
              return inventory.card.save();

            case 37:
              _context17.next = 39;
              return inventory.save();

            case 39:
              _iteratorNormalCompletion5 = true;
              _context17.next = 5;
              break;

            case 42:
              _context17.next = 48;
              break;

            case 44:
              _context17.prev = 44;
              _context17.t1 = _context17['catch'](3);
              _didIteratorError5 = true;
              _iteratorError5 = _context17.t1;

            case 48:
              _context17.prev = 48;
              _context17.prev = 49;

              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }

            case 51:
              _context17.prev = 51;

              if (!_didIteratorError5) {
                _context17.next = 54;
                break;
              }

              throw _iteratorError5;

            case 54:
              return _context17.finish(51);

            case 55:
              return _context17.finish(48);

            case 56:
              // Send notification
              if (typeof cqAch !== 'undefined' || activityStatus === 'sentToSmp') {
                callback = new _callback2.default();

                ids.map(function (id) {
                  _card3.default.findOne({ inventory: id }).populate('inventory').then(function (card) {
                    if (!card || !card.inventory) {
                      return;
                    }
                    callback.sendCallback(card, card.inventory.cqAch ? 'cqPaymentInitiated' : 'cardFinalized');
                  });
                });
              }
              res.json();

            case 58:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, _this8, [[3, 44, 48, 56], [11, 15, 19, 27], [20,, 22, 26], [49,, 51, 55]]);
    }));

    return function (_x33) {
      return _ref17.apply(this, arguments);
    };
  }()).catch(function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(err) {
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return _errorLog2.default.create({
                method: 'updateDetails',
                controller: 'card.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              console.log('**************ERR IN CHANGE SMP**********');
              console.log(err);
              return _context18.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, _this8);
    }));

    return function (_x34) {
      return _ref18.apply(this, arguments);
    };
  }());
}

/**
 * Create fake cards
 */
function createFakeCards(req, res) {
  var _req$body5 = req.body,
      count = _req$body5.count,
      customer = _req$body5.customer;

  var dbCustomer = void 0,
      dbRetailer = void 0;
  var cards = [];
  var promise = void 0;
  if (customer) {
    promise = _customer3.default.findById(customer);
  } else {
    promise = _customer3.default.findOne();
  }
  promise.then(function (customer) {
    dbCustomer = customer;
    return _retailer2.default.find().limit(20);
  }).then(function (retailers) {
    retailers.forEach(function (retailer) {
      if (retailer.sellRates.sellTo !== 'saveya') {
        dbRetailer = retailer;
      }
    });
  }).then(function () {
    for (var i = 0; i < count; i++) {
      cards.push(createNewFakeCard(req.user, {
        number: i,
        retailer: dbRetailer._id,
        uid: 1,
        pin: i,
        customer: dbCustomer._id,
        userTime: new Date(),
        balance: '1111'
      }));
    }
    return Promise.all(cards);
  }).then(function (cards) {
    return res.json({ cards: cards });
  }).catch(function (err) {
    console.log('**************FAKE CARD ERR**********');
    console.log(err);
    return res.status(500).json();
  });
}

/**
 * Create a fake card record
 * @param user
 * @param body
 */
function createNewFakeCard(user, body) {
  var _this9 = this;

  var dbCustomer = void 0,
      dbCard = void 0;
  return createDefaultCustomer(body, user).then(function (customer) {
    dbCustomer = customer;
    // See if this card already exists
    return findCards(body.retailer, body.number).populate('retailer');
  })
  // If card exists, throw error
  .then(function () {
    var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(card) {
      var removeValue;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              if (!card) {
                _context19.next = 8;
                break;
              }

              if (!(!isTestCard(card) && !card.inventory)) {
                _context19.next = 6;
                break;
              }

              _context19.next = 4;
              return removeCard(req.params.cardId);

            case 4:
              removeValue = _context19.sent;

              // In this case, we don't care about the response, since this is only dealing with fake cards, so errors can be ignored
              handleRemoveCardResponse(res, removeValue);

            case 6:
              dbCard = card;
              throw Error('Card has already been added to system');

            case 8:
            case 'end':
              return _context19.stop();
          }
        }
      }, _callee19, _this9);
    }));

    return function (_x35) {
      return _ref19.apply(this, arguments);
    };
  }()).then(function () {
    var card = new _card3.default(body);
    card.user = user._id;
    card.balanceStatus = 'unchecked';
    // User time when card was created
    card.userTime = body.userTime;
    card.customer = dbCustomer;
    // Save
    return card.save();
  }).then(function (card) {
    // Retrieve card with retailer
    return _card3.default.findById(card._id).populate({
      path: 'retailer',
      populate: {
        path: 'buyRateRelations',
        model: 'BuyRate'
      }
    }).populate('customer');
  })
  // Return
  .then(function (card) {
    dbCard = card;
    return _company2.default.findById(user.company).populate({
      path: 'settings',
      populate: {
        path: 'autoBuyRates',
        model: 'AutoBuyRate'
      }
    });
  })
  // Get card buy and sell rate
  .then(function (company) {
    var settings = company.settings || { margin: 0.03 };
    var retailer = (0, _retailer3.retailerSetBuyAndSellRates)(dbCard.retailer, settings, user.store, null, dbCard.merchandise);
    dbCard.buyRate = retailer.buyRate;
    dbCard.sellRate = retailer.sellRate;
    return dbCard.save();
  }).catch(function (err) {
    return res.status(500).json(err);
  });
}

/**
 * Upload cards
 */
function uploadCards(req, res) {
  var file = req.files[0];
  var cards = [];
  var body = req.body;
  var dbCustomer = void 0,
      dbCard = void 0;
  var fileName = __dirname + '/uploads/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var user = req.user;
  var cardCount = 0;
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    if (cardCount === 0) {
      cardCount++;
      return;
    }
    /**
     * Fields:
     * 1) Retailer ID (either BI, GS, or GCMGR)
     * 2) Merchant name
     * 3) Card number
     * 4) Card pin
     * 5) Balance
     */
    // Create record
    var thisRecord = {
      retailerId: record[0],
      retailerName: record[1],
      number: record[2]
    };
    if (typeof record[3] !== 'undefined' && record[3]) {
      thisRecord['pin'] = record[3];
    }
    if (typeof record[4] !== 'undefined' && record[4]) {
      thisRecord['balance'] = record[4];
    }
    cards.push(thisRecord);
    cardCount++;
  }).on('end', function () {
    var promises = [];
    cards.forEach(function (thisCard) {
      promises.push( // let dbRetailer;
      new Promise(function (resolve) {
        // Find retailer by ID
        if (/^[0-9a-fA-F]{24}$/.test(thisCard.retailerId)) {
          return resolve(_retailer2.default.findById(thisCard.retailerId));
        } else {
          return resolve(_retailer2.default.findOne({
            $or: [{ gsId: thisCard.retailerId }, { retailerId: thisCard.retailerId }]
          }));
        }
      }).then(function (retailer) {
        return new Promise(function (resolve) {
          createDefaultCustomer(body, user).then(function (customer) {
            resolve({
              retailer: retailer,
              customer: customer
            });
          });
        });
      }).then(function (data) {
        return new Promise(function (resolve) {
          findCards(data.retailer._id, thisCard.number).populate('retailer').then(function (card) {
            // dbCustomer = data.customer;
            resolve({
              card: card,
              customer: data.customer,
              retailer: data.retailer
            });
          });
        });
      }).then(function (data) {
        if (data.card) {
          console.log('**************CARD ALREADY EXISTS DURING UPLOAD**********');
          console.log(data.card);
        } else {
          return data;
        }
      }).then(function (data) {
        if (!data) {
          return;
        }
        var newCard = new _card3.default(thisCard);
        newCard.user = user._id;
        newCard.balanceStatus = 'unchecked';
        // User time when newCard was created
        newCard.userTime = Date.now();
        newCard.customer = data.customer;
        newCard.retailer = data.retailer._id;
        newCard.uid = data.retailer.uid;
        // Save
        return newCard.save();
      }).then(function (newCard) {
        if (!newCard) {
          return;
        }
        // Retrieve card with retailer
        return _card3.default.findById(newCard._id).populate({
          path: 'retailer',
          populate: {
            path: 'buyRateRelations',
            model: 'BuyRate'
          }
        }).populate('customer');
      })
      // Return
      .then(function (newCard) {
        if (!newCard) {
          return;
        }
        return new Promise(function (resolve) {
          _company2.default.findById(user.company).populate({
            path: 'settings',
            populate: {
              path: 'autoBuyRates',
              model: 'AutoBuyRate'
            }
          }).then(function (company) {
            resolve({
              company: company,
              card: newCard
            });
          });
        });
      })
      // Get card buy and sell rate
      .then(function (data) {
        if (!data) {
          return;
        }
        var retailer = (0, _retailer3.retailerSetBuyAndSellRates)(data.card.retailer, data.company.settings, user.store, null, data.card.merchandise);
        data.card.buyRate = retailer.buyRate;
        data.card.sellRate = retailer.sellRate;
        return data.card.save();
      }).catch(function (err) {
        console.log('**************UPLOAD ERR**********');
        console.log(err);
      }));
    });
    Promise.all(promises).then(function () {
      return res.json();
    });
  });

  stream.pipe(csvStream);
}

function findRetailerFix(retailerName) {
  return _retailer2.default.findOne({
    name: new RegExp(retailerName, 'i')
  });
}

/**
 * Find card, or else create it
 * @param params DB search params
 * @param input Input from CSV
 * @param user Current user
 */
function findCardToFix(params, input, user) {
  var foundCard = void 0;
  return _card3.default.find(params).then(function (dbCards) {
    if (dbCards.length === 0) {
      return findRetailerFix(input.retailerName);
      // Multiple values (there are none)
    } else if (dbCards.length > 1) {
      console.log('**************FOUND MULTIPLE**********');
      console.log(params);
      console.log(input);
      return false;
    } else {
      foundCard = dbCards[0];
      return findRetailerFix(input.retailerName);
    }
  }).then(function (retailer) {
    if (!retailer) {
      return;
    }
    // Update retailer name
    if (foundCard) {
      foundCard.retailer = retailer._id;
      return foundCard.save();
    }
    var newCardValues = {
      retailer: retailer._id,
      number: input.number,
      uid: retailer.uid,
      buyRate: retailer.sellRates.best - 0.1,
      sellRate: retailer.sellRates.best - 0.03,
      user: user._id,
      customer: '575a44043c01e9134aa2a558'
    };
    if (input.pin) {
      newCardValues.pin = input.pin;
    }
    if (input.balance) {
      newCardValues.balance = input.balance;
    }
    // Create new card
    var newCard = new _card3.default(newCardValues);
    return newCard.save();
  });
}

/**
 * Upload fixes
 */
function uploadFixes(req, res) {
  var file = req.files[0];
  var cards = [];
  var fileName = __dirname + '/uploads/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    /**
     * Fields:
     * 1) Retailer ID (either BI, GS, or GCMGR)
     * 2) Merchant name
     * 3) Card number
     * 4) Card pin
     * 5) Balance
     */
    // Create record
    var thisRecord = {
      retailerName: record[1],
      number: record[2]
    };
    if (typeof record[3] !== 'undefined' && record[3]) {
      thisRecord['pin'] = record[3];
    }
    if (typeof record[4] !== 'undefined' && record[4]) {
      thisRecord.balance = record[4].replace(/[^\d.]/g, '');
    }
    cards.push(thisRecord);
  }).on('end', function () {
    var promises = [];
    // Run cards
    cards.forEach(function (card) {
      // Find card
      var cardParams = {
        number: new RegExp(card.number, 'i')
      };
      if (card.pin) {
        cardParams.pin = new RegExp(card.pin, 'i');
      }
      if (card.balance) {
        cardParams.balance = card.balance;
      }
      promises.push(findCardToFix(cardParams, card, req.user));
    });
    Promise.all(promises).then(function () {
      return res.json();
    });
  });

  stream.pipe(csvStream);
}

/**
 * Run BI
 */
function runBi(req, res) {
  var cards = req.body.cards;
  var dbCards = [];
  cards.forEach(function (card) {
    dbCards.push(_card3.default.findById(card).populate('retailer'));
  });
  Promise.all(dbCards).then(function (foundCards) {
    var currentCard = 0;
    var thisInt = setInterval(function () {
      var dbCard = foundCards[currentCard];
      currentCard++;
      if (!dbCard) {
        clearInterval(thisInt);
        return res.json();
      }
      var retailer = void 0;
      if (dbCard.retailer.gsId) {
        retailer = dbCard.retailer.gsId;
      }
      if (retailer) {
        balanceInquiry(retailer, dbCard.number, dbCard.pin, dbCard._id, req.user._id, req.user.company);
      }
    }, 500);
  });
}

/**
 * Move cards over to Upload Sales for sale
 */
function moveForSale(req, res) {
  var dbCustomer = void 0;
  _customer3.default.findById('5764baef5f244aff7abe6160').then(function (customer) {
    if (!customer) {
      throw 'noCustomer';
    }
    dbCustomer = customer;
    return _card3.default.find({
      balance: { $exists: true },
      customer: req.body.customerId
    }).populate('retailer');
  }).then(function (cards) {
    var cardPromises = [];
    cards.forEach(function (card) {
      var sellRate = void 0,
          buyRate = void 0;
      try {
        if (card.sellRate) {
          sellRate = card.sellRate;
        } else {
          sellRate = card.retailer.sellRates.best - 0.03;
        }
        if (card.buyRate) {
          buyRate = card.buyRate;
        } else {
          buyRate = card.retailer.sellRates.best - 0.1;
        }
      } catch (e) {
        throw 'noSellRate';
      }
      cardPromises.push(card.update({
        sellRate: sellRate,
        buyRate: buyRate,
        customer: dbCustomer._id
      }));
    });
    return Promise.all(cardPromises);
  }).then(function () {
    return res.json();
  }).catch(function (err) {
    console.log('**************ERR**********');
    console.log(err);
    if (err === 'noCustomer') {
      return res.status(500).json({ customer: false });
    }
    if (err === 'noSellRate') {
      return res.status(500).json({ sellRate: false });
    }
  });
}

/**
 * Perform balance update for a single card
 * @param cardId
 * @param balance
 * @param userRole
 */
function updateInventoryBalance(cardId, balance) {
  return _inventory4.default.findById(cardId).populate('card').then(function (inventory) {
    inventory.balance = balance;
    return inventory.save();
  }).then(function (inventory) {
    return _card3.default.update({
      _id: inventory.card._id
    }, {
      $set: {
        balance: balance
      }
    });
  });
}

/**
 * Edit card balance (admin)
 */
function editBalance(req, res) {
  var _this10 = this;

  var _req$body6 = req.body,
      cardId = _req$body6.cardId,
      balance = _req$body6.balance,
      ids = _req$body6.ids;

  if (cardId) {
    return updateInventoryBalance(cardId._id, balance, req.user.role).then(function () {
      return res.json();
    }).catch(function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(err) {
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return _errorLog2.default.create({
                  method: 'editBalance',
                  controller: 'card.controller',
                  revision: (0, _errors.getGitRev)(),
                  stack: err.stack,
                  error: err,
                  user: req.user._id
                });

              case 2:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, _this10);
      }));

      return function (_x36) {
        return _ref20.apply(this, arguments);
      };
    }());
  } else if (ids) {
    var promises = [];
    ids.forEach(function (id) {
      promises.push(updateInventoryBalance(id, balance, req.user.role));
    });
    Promise.all(promises).then(function () {
      return res.json();
    }).catch(function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(err) {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return _errorLog2.default.create({
                  method: 'editBalance',
                  controller: 'card.controller',
                  revision: (0, _errors.getGitRev)(),
                  stack: err.stack,
                  error: err,
                  user: req.user._id
                });

              case 2:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, _this10);
      }));

      return function (_x37) {
        return _ref21.apply(this, arguments);
      };
    }());
  }
}function massUpdate(req, res) {
  var _this12 = this;

  var _req$body8 = req.body,
      ids = _req$body8.ids,
      values = _req$body8.values;
  var companyId = req.params.companyId;

  var updateParams = {
    '_id': { $in: ids }
  };
  if (companyId) {
    updateParams.company = companyId;
  }
  _inventory4.default.update(updateParams, {
    $set: values
  }, { multi: true }).then(function (inventories) {
    return res.json(inventories);
  }).catch(function () {
    var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(err) {
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return _errorLog2.default.create({
                method: 'massUpdate',
                controller: 'card.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              console.log('**************ERR IN MASS UPDATE**********');
              console.log(err);
              return _context25.abrupt('return', res.status(err).json(err));

            case 5:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, _this12);
    }));

    return function (_x42) {
      return _ref25.apply(this, arguments);
    };
  }());
}function resellCards(req, res) {
  var inventories = req.body.inventories;
  // Find inventories not sent to SMP, and without a transaction ID

  _inventory4.default.find({
    _id: { $in: inventories }
  }).populate('card').then(function (inventories) {
    var promises = [];
    inventories.forEach(function (inventory) {
      // Don't resell already sold cards
      if (inventory.smp !== '1' && inventory.smp !== 'saveya' && ['sentToSmp', 'receivedSmp', 'rejected'].indexOf(inventory.activityStatus) === -1 && inventory.card) {
        inventory.soldToLiquidation = false;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  }).then(function () {
    return res.json();
  }).catch(function (err) {
    console.log('**************ERR IN RESELL CARDS**********');
    console.log(err);
    return res.status(500).json();
  });
}
//# sourceMappingURL=card.controller.js.map
