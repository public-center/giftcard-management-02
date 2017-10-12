'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findCustomerById = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Retrieve customer by ID
 * @param req
 * @param res
 */
var findCustomerById = exports.findCustomerById = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var _this4 = this;

    var customerId, validObjectId;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            customerId = req.params.customerId;
            validObjectId = isValidObjectId(customerId);
            // Valid customer

            if (!validObjectId) {
              _context5.next = 6;
              break;
            }

            _customer2.default.findById(customerId).populate('store').populate({
              path: 'company',
              populate: [{
                path: 'settings',
                model: 'CompanySettings'
              }]
            }).then(function (customer) {
              return res.json(customer);
            }).catch(function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        console.log('**************FIND CUSTOMER BY ID ERROR**********');
                        console.log(err);
                        _context4.next = 4;
                        return _errorLog2.default.create({
                          method: 'findCustomerById',
                          controller: 'customer.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 4:
                        return _context4.abrupt('return', res.status(500).json(err));

                      case 5:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, _this4);
              }));

              return function (_x6) {
                return _ref5.apply(this, arguments);
              };
            }());
            // Default, no customer selected
            _context5.next = 11;
            break;

          case 6:
            if (!(customerId === 'default')) {
              _context5.next = 10;
              break;
            }

            return _context5.abrupt('return', res.json({
              defaultCustomer: true
            }));

          case 10:
            return _context5.abrupt('return', res.status(500).json({ err: 'Invalid customer ID' }));

          case 11:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function findCustomerById(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Create a new customer
 * @param req
 * @param res
 */


exports.searchCustomers = searchCustomers;
exports.findCustomersThisCompany = findCustomersThisCompany;
exports.getCustomersThisStore = getCustomersThisStore;
exports.newCustomer = newCustomer;
exports.updateCustomer = updateCustomer;
exports.assignCustomerToCard = assignCustomerToCard;
exports.findCustomersWithDenials = findCustomersWithDenials;
exports.updateCustomerDenialTotal = updateCustomerDenialTotal;
exports.getAllCustomers = getAllCustomers;
exports.cashPayment = cashPayment;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

var _store = require('../stores/store.model');

var _store2 = _interopRequireDefault(_store);

require('../reserve/reserve.model');

var _customer = require('./customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _denialPayment = require('../denialPayment/denialPayment.model');

var _denialPayment2 = _interopRequireDefault(_denialPayment);

var _receipt = require('../receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Valid objectId
var isValidObjectId = _mongoose2.default.Types.ObjectId.isValid;

/**
 * Search customers
 */
function searchCustomers(req, res) {
  var _this = this;

  var name = req.query.name;

  var returned = false;
  var company = {
    company: req.user.company
  };

  name = name.replace(' ', '.*');
  // Find all customers who match the input query
  _customer2.default.find(Object.assign({ fullName: new RegExp(name, 'i') }, company)).populate('store').then(function (customers) {
    if (customers.length) {
      returned = true;
      res.json(customers);
      return false;
    }
    // Try to search by state id
    return _customer2.default.find(Object.assign({ stateId: new RegExp(name, 'i') }, company));
  }).then(function (customers) {
    // Don't perform another search
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by phone
    return _customer2.default.find(Object.assign({ phone: new RegExp(name, 'i') }, company));
  }).then(function (customers) {
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by system ID
    return _customer2.default.find(Object.assign({ systemId: new RegExp(name, 'i') }, company));
  }).then(function (customers) {
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by address
    return _customer2.default.find({
      company: req.user.company,
      $or: [{ 'address1': new RegExp(name, 'i') }, { 'city': new RegExp(name, 'i') }, { 'state': new RegExp(name, 'i') }] });
  }).then(function (customers) {
    if (customers === false) {
      return false;
    }
    if (!returned) {
      return res.json(customers);
    }
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log('**************SEARCH CUSTOMERS ERR**********');
              console.log(err);
              _context.next = 4;
              return _errorLog2.default.create({
                method: 'searchCustomers',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
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

/**
 * Get customers for this company
 */
function findCustomersThisCompany(req, res) {
  var _this2 = this;

  var companyId = req.params.companyId;
  // Check access
  if (companyId !== req.user.company.toString()) {
    return res.status(401).json();
  }
  _customer2.default.find({
    company: companyId
  }).then(function (customers) {
    return res.json(customers);
  }).catch(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log('**************FIND CUSTOMERS BY COMPANY ERROR**********');
              console.log(err);
              _context2.next = 4;
              return _errorLog2.default.create({
                method: 'findCustomersThisCompany',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context2.abrupt('return', res.status(500).json({
                error: 'Could not retrieve customers'
              }));

            case 5:
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
 * Retrieve customers for this store
 */
function getCustomersThisStore(req, res) {
  var _this3 = this;

  _customer2.default.find({ store: req.params.store }).then(function (customers) {
    return res.json({ customers: customers });
  }).catch(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _errorLog2.default.create({
                method: 'getCustomersThisStore',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              return _context3.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
}function newCustomer(req, res) {
  var _this5 = this;

  var company = req.user.company;

  var store = req.user.store;
  var customerData = req.body;
  if (customerData.store) {
    store = customerData.store;
  }
  var companySettings = void 0;

  return _store2.default.findById(store).then(function (store) {
    if (!store) {
      res.status(404).json({ err: "Store not found" });
      throw 'noStore';
    }
    return _company2.default.findById(company);
  }).then(function (company) {
    return company.getSettings();
  }).then(function (settings) {
    companySettings = settings;

    if (!settings.customerDataRequired) {
      ['firstName', 'lastName', 'address1', 'city', 'state', 'zip', 'phone', 'fullName', 'email'].forEach(function (attr) {
        if (typeof customerData[attr] === 'undefined') {
          customerData[attr] = ' ';
        }
      });

      // Front-end likes to push an object when no state is selected.
      // Just ignore whatever it is that's not a string.
      if (typeof customerData.state !== 'string') {
        customerData.state = ' ';
      }
    }

    var customer = new _customer2.default(customerData);
    customer.company = company;
    return customer.save();
  }).then(function (customer) {
    if (!companySettings.customerDataRequired) {
      var newCustomerData = {};
      ['firstName', 'lastName', 'address1', 'city', 'state', 'zip', 'phone', 'fullName', 'email'].forEach(function (attr) {
        if (!customer[attr].replace(/\s/g, '').length) {
          newCustomerData[attr] = '';
        }
      });

      _customer2.default.update({ _id: customer._id }, newCustomerData).then(function () {});
      return _customer2.default.findById(customer._id);
    }

    return customer;
  }).then(function (customer) {
    return res.json(customer);
  }).catch(function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(err) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (!(err === 'noStore')) {
                _context6.next = 2;
                break;
              }

              return _context6.abrupt('return');

            case 2:
              if (!(err.name && err.name === 'ValidationError')) {
                _context6.next = 4;
                break;
              }

              return _context6.abrupt('return', res.status(400).json(err));

            case 4:
              _context6.next = 6;
              return _errorLog2.default.create({
                method: 'newCustomer',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 6:

              console.log('********************ERROR IN NEWCUSTOMER********************');
              console.log(err);
              res.status(500).json(err);

            case 9:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this5);
    }));

    return function (_x7) {
      return _ref6.apply(this, arguments);
    };
  }());
}

/**
 * Update customer
 * @param req
 * @param res
 */
function updateCustomer(req, res) {
  var _this6 = this;

  var customerId = req.params.customerId;

  var company = req.user.company;
  var body = req.body;

  _customer2.default.findOne({ _id: customerId, company: company }).then(function (customer) {
    if (!customer) {
      return res.status(404);
    }

    var editable = ['address1', 'address2', 'city', 'enabled', 'firstName', 'lastName', 'middleName', 'phone', 'state', 'stateId', 'zip', 'email'];

    editable.forEach(function (key) {
      customer[key] = body[key];
    });
    return customer.save();
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              console.log('**************ERR IN UPDATE CUSTOMER**********');
              console.log(err);
              _context7.next = 4;
              return _errorLog2.default.create({
                method: 'updateCustomer',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context7.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this6);
    }));

    return function (_x8) {
      return _ref7.apply(this, arguments);
    };
  }());
}

/**
 * Assign a customer to a card
 */
function assignCustomerToCard(req, res) {
  var _this7 = this;

  var _req$body = req.body,
      customer = _req$body.customer,
      card = _req$body.card;

  _card2.default.findById(card._id).then(function (card) {
    card.customer = customer._id;
    return card.save();
  }).then(function (card) {
    return _card2.default.findById(card._id).populate({
      path: 'retailer',
      populate: {
        path: 'buyRateRelations',
        model: 'BuyRate'
      }
    }).populate('customer');
  }).then(function (card) {
    return res.json(card);
  }).catch(function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(err) {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              console.log('**************ASSIGN CUSTOMER TO CARD ERR**********');
              console.log(err);
              _context8.next = 4;
              return _errorLog2.default.create({
                method: 'assignCustomerToCard',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context8.abrupt('return', res.status(500).json({
                message: 'Could not assign customer to card'
              }));

            case 5:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this7);
    }));

    return function (_x9) {
      return _ref8.apply(this, arguments);
    };
  }());
}

/**
 * Find customers with denials
 */
function findCustomersWithDenials(req, res) {
  var _this8 = this;

  return _customer2.default.find().sort({ rejectionTotal: -1 }).then(function (customers) {
    return res.json({ customers: customers });
  }).catch(function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(err) {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              console.log('**************ERR FINDING CUSTOMERS WITH DENIALS**********');
              console.log(err);
              _context9.next = 4;
              return _errorLog2.default.create({
                method: 'findCustomersWithDenials',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context9.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this8);
    }));

    return function (_x10) {
      return _ref9.apply(this, arguments);
    };
  }());
}

/**
 * Update customer denial total
 */
function updateCustomerDenialTotal(req, res) {
  var _this9 = this;

  var _req$body2 = req.body,
      _id = _req$body2._id,
      newTotal = _req$body2.newTotal;

  _customer2.default.findById(_id).then(function (customer) {
    if (customer) {
      customer.rejectionTotal = newTotal;
      return customer.save();
    } else {
      throw 'notFound';
    }
  }).then(function (customer) {
    return res.json(customer);
  }).catch(function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              console.log('**************ERR IN UPDATE CUSTOMER REJECTION TOTAL**********');
              console.log(err);
              _context10.next = 4;
              return _errorLog2.default.create({
                method: 'updateCustomerDenialTotal',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context10.abrupt('return', res.status(500).json({ err: err }));

            case 5:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this9);
    }));

    return function (_x11) {
      return _ref10.apply(this, arguments);
    };
  }());
}

/**
 * Get all customers
 */
function getAllCustomers(req, res) {
  var _this10 = this;

  _customer2.default.find().then(function (customers) {
    return res.json(customers);
  }).catch(function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(err) {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _errorLog2.default.create({
                method: 'getAllCustomers',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              return _context11.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this10);
    }));

    return function (_x12) {
      return _ref11.apply(this, arguments);
    };
  }());
}

/**
 * Make a cash payment against denials
 */
function cashPayment(req, res) {
  var _this11 = this;

  var _req$body3 = req.body,
      amount = _req$body3.amount,
      userTime = _req$body3.userTime,
      rejectionTotal = _req$body3.rejectionTotal,
      store = _req$body3.store,
      company = _req$body3.company;

  var user = req.user;
  _customer2.default.findById(req.params.customerId).then(function (customer) {
    var previousTotal = customer.rejectionTotal;
    customer.rejectionTotal = previousTotal - parseFloat(amount);
    var denialPayment = new _denialPayment2.default({
      amount: amount,
      userTime: userTime,
      customer: customer._id
    });
    var receipt = new _receipt2.default({
      userTime: userTime,
      rejectionTotal: rejectionTotal,
      total: amount,
      appliedTowardsDenials: amount,
      grandTotal: amount,
      company: company,
      store: store,
      customer: customer._id,
      user: user._id
    });
    return Promise.all([denialPayment.save(), customer.save(), receipt.save()]);
  }).then(function (models) {
    var _models = _slicedToArray(models, 3),
        payment = _models[0],
        customer = _models[1],
        receipt = _models[2];

    return res.json({ data: receipt });
  }).catch(function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(err) {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _errorLog2.default.create({
                method: 'cashPayment',
                controller: 'customer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              return _context12.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this11);
    }));

    return function (_x13) {
      return _ref12.apply(this, arguments);
    };
  }());
}
//# sourceMappingURL=customer.controller.js.map
