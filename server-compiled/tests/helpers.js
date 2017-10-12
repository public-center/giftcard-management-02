'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _environment = require('../config/environment');

var _batch = require('../api/batch/batch.model');

var _batch2 = _interopRequireDefault(_batch);

var _biRequestLog = require('../api/biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _buyRate = require('../api/buyRate/buyRate.model');

var _buyRate2 = _interopRequireDefault(_buyRate);

var _callbackLog = require('../api/callbackLog/callbackLog.model');

var _callbackLog2 = _interopRequireDefault(_callbackLog);

var _card = require('../api/card/card.model');

var _card2 = _interopRequireDefault(_card);

var _cardUpdates = require('../api/cardUpdates/cardUpdates.model');

var _cardUpdates2 = _interopRequireDefault(_cardUpdates);

var _company = require('../api/company/company.model');

var _company2 = _interopRequireDefault(_company);

var _customer = require('../api/customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _customerEdit = require('../api/customerEdit/customerEdit.model');

var _customerEdit2 = _interopRequireDefault(_customerEdit);

var _daemonError = require('../api/daemonError/daemonError.model');

var _daemonError2 = _interopRequireDefault(_daemonError);

var _deferredBalanceInquiries = require('../api/deferredBalanceInquiries/deferredBalanceInquiries.model');

var _deferredBalanceInquiries2 = _interopRequireDefault(_deferredBalanceInquiries);

var _denialPayment = require('../api/denialPayment/denialPayment.model');

var _denialPayment2 = _interopRequireDefault(_denialPayment);

var _inventory = require('../api/inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _logs = require('../api/log/logs.model');

var _logs2 = _interopRequireDefault(_logs);

var _receipt = require('../api/receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _reconciliation = require('../api/reconciliation/reconciliation');

var _reconciliation2 = _interopRequireDefault(_reconciliation);

var _reserve = require('../api/reserve/reserve.model');

var _reserve2 = _interopRequireDefault(_reserve);

var _retailer = require('../api/retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _store = require('../api/stores/store.model');

var _store2 = _interopRequireDefault(_store);

var _systemSettings = require('../api/systemSettings/systemSettings.model');

var _systemSettings2 = _interopRequireDefault(_systemSettings);

var _tango = require('../api/tango/tango.model');

var _tango2 = _interopRequireDefault(_tango);

var _user = require('../api/user/user.model');

var _user2 = _interopRequireDefault(_user);

var _app = require('../app');

var _app2 = _interopRequireDefault(_app);

var _requests = require('./requests');

var _requests2 = _interopRequireDefault(_requests);

require('../api/company/autoBuyRate.model');

var _companySettings = require('../api/company/companySettings.model');

var _companySettings2 = _interopRequireDefault(_companySettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TestHelper = function (_Requests) {
  _inherits(TestHelper, _Requests);

  /**
   * Store information on users, companies, stores, and customers
   * @type {{}}
   */
  function TestHelper() {
    _classCallCheck(this, TestHelper);

    var _this = _possibleConstructorReturn(this, (TestHelper.__proto__ || Object.getPrototypeOf(TestHelper)).call(this));

    _this.chaiRequest = null;
    // Created objects
    _this.companies = [];
    _this.users = [];
    _this.stores = [];
    _this.customers = [];
    _this.retailers = [];
    _this.biRequestLogs = [];
    /**
     * Keep reference to all of the above in a single data structure
     */
    _this.references = {};
    /**
     * Credentials used for creating test users
     */
    _this.credentials = _this.resetCredentials();
    /**
     * Store login tokens so we can send them with subsequent requests
     */
    _this.tokens = _this.resetTokens();
    // Current card number (when creating new cards)
    _this.cardNumber = 0;
    return _this;
  }

  /**
   * Request singleton
   * @return {null|*}
   */


  _createClass(TestHelper, [{
    key: 'initDb',


    /**
     * Initialize the DB for testing
     */
    value: function initDb() {
      var _this2 = this;

      before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this2.clearData();

                if (!_mongoose2.default.connection.db) {
                  _context.next = 5;
                  break;
                }

                _context.next = 4;
                return _this2.clearDb();

              case 4:
                return _context.abrupt('return', _context.sent);

              case 5:
                _mongoose2.default.connect(_environment.mongo.uri, done);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      })));
    }

    /**
     * Reset all data
     */

  }, {
    key: 'clearData',
    value: function clearData() {
      this.users = [];
      this.companies = [];
      this.stores = [];
      this.customers = [];
      // Set references to the data
      this.references.companies = this.companies;
      this.references.users = this.users;
      this.references.stores = this.stores;
      this.references.customers = this.customers;
      this.references.retailers = this.retailers;

      this.credentials = this.resetCredentials();
      this.tokens = this.resetTokens();
      // Reset card number for iterating multiple cards
      this.cardNumber = 0;
    }

    /**
     * Clear the DB after each run
     * @return {Promise.<void>}
     */

  }, {
    key: 'clearDb',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _batch2.default.remove();

              case 2:
                _context2.next = 4;
                return _biRequestLog2.default.remove();

              case 4:
                _context2.next = 6;
                return _buyRate2.default.remove();

              case 6:
                _context2.next = 8;
                return _callbackLog2.default.remove();

              case 8:
                _context2.next = 10;
                return _card2.default.remove();

              case 10:
                _context2.next = 12;
                return _cardUpdates2.default.remove();

              case 12:
                _context2.next = 14;
                return _company2.default.remove();

              case 14:
                _context2.next = 16;
                return _customer2.default.remove();

              case 16:
                _context2.next = 18;
                return _customerEdit2.default.remove();

              case 18:
                _context2.next = 20;
                return _daemonError2.default.remove();

              case 20:
                _context2.next = 22;
                return _deferredBalanceInquiries2.default.remove();

              case 22:
                _context2.next = 24;
                return _denialPayment2.default.remove();

              case 24:
                _context2.next = 26;
                return _inventory2.default.remove();

              case 26:
                _context2.next = 28;
                return _logs2.default.remove();

              case 28:
                _context2.next = 30;
                return _receipt2.default.remove();

              case 30:
                _context2.next = 32;
                return _reconciliation2.default.remove();

              case 32:
                _context2.next = 34;
                return _reserve2.default.remove();

              case 34:
                _context2.next = 36;
                return _retailer2.default.remove();

              case 36:
                _context2.next = 38;
                return _store2.default.remove();

              case 38:
                _context2.next = 40;
                return _systemSettings2.default.remove();

              case 40:
                _context2.next = 42;
                return _tango2.default.remove();

              case 42:
                _context2.next = 44;
                return _retailer2.default.remove();

              case 44:
                _context2.next = 46;
                return _user2.default.remove();

              case 46:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function clearDb() {
        return _ref2.apply(this, arguments);
      }

      return clearDb;
    }()

    /**
     * Reset credentials for each new test set
     */

  }, {
    key: 'resetCredentials',
    value: function resetCredentials() {
      return {
        admin1: {
          email: 'admin1@test.com',
          password: 'test'
        },
        admin2: {
          email: 'admin2@test.com',
          password: 'test'
        },
        corporateAdmin1: {
          email: 'corporateadmin1@test.com',
          password: 'test'
        },
        corporateAdmin2: {
          email: 'corporateadmin2@test.com',
          password: 'test'
        },
        manager1: {
          email: 'manager1@test.com',
          password: 'test'
        },
        manager2: {
          email: 'manager2@test.com',
          password: 'test'
        },
        employee1: {
          email: 'employee1@test.com',
          password: 'test'
        },
        employee2: {
          email: 'employee2@test.com',
          password: 'test'
        }
      };
    }

    /**
     * Reset tokens for each test set
     */

  }, {
    key: 'resetTokens',
    value: function resetTokens() {
      return {
        admin1: {
          _id: null,
          token: null
        },
        admin2: {
          _id: null,
          token: null
        },
        corporateAdmin1: {
          _id: null,
          token: null
        },
        corporateAdmin2: {
          _id: null,
          token: null
        },
        manager1: {
          _id: null,
          token: null
        },
        manager2: {
          _id: null,
          token: null
        },
        employee1: {
          _id: null,
          token: null
        },
        employee2: {
          _id: null,
          token: null
        }
      };
    }

    /**
     * Generate a stacktrace
     */

  }, {
    key: 'generateStackTrace',
    value: function generateStackTrace() {
      try {
        throw Error();
      } catch (error) {
        console.log(error.stack);
      }
    }

    /**
     * Get reference ID of a default record (default being the first one in the array of references)
     * @param type
     * @param setNumber Which set of data we're referring to
     */

  }, {
    key: 'getDefaultReferenceId',
    value: function getDefaultReferenceId(type) {
      var setNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      if (!type) {
        this.generateStackTrace();
        throw 'Unable to determine reference type';
      }
      var reference = this.references[type];
      if (!reference) {
        (0, _chai.expect)(true).to.be.equal(false);
      }
      return reference[setNumber - 1]._id;
    }

    /**
     * Create an admin user
     * @param setNumber Which set of data we're referring to
     * @return {Promise.<void>}
     */

  }, {
    key: 'createAdminUser',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var adminUserParams;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                adminUserParams = {
                  'firstName': 'test',
                  'lastName': 'test',
                  'email': this.credentials['admin' + setNumber].email,
                  'password': this.credentials['admin' + setNumber].password,
                  'role': 'admin'
                };
                _context3.next = 3;
                return _user2.default.create(adminUserParams);

              case 3:
                return _context3.abrupt('return', _context3.sent);

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function createAdminUser() {
        return _ref3.apply(this, arguments);
      }

      return createAdminUser;
    }()

    /**
     * Create company and admin user
     * @param setNumber Set number
     * @param companyParams Additional company params
     * @param userParams Additional user params
     * @param settingsParams Additional company settings params
     * @return {Promise.<void>}
     */

  }, {
    key: 'createCompanyAndCorporateAdminUser',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var companyParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var userParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var settingsParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var storeParams, store, company, settings, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref5, _ref6, key, value, user;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                storeParams = {
                  name: 'testStore' + setNumber,
                  address1: 'test',
                  address2: 'test',
                  city: 'test',
                  state: 'TN',
                  zip: '77777',
                  phone: '333333333'
                };
                // Create store

                _context4.next = 3;
                return _store2.default.create(storeParams);

              case 3:
                store = _context4.sent;

                companyParams = Object.assign({
                  'name': 'Test' + setNumber,
                  'address1': 'test',
                  'address2': 'test',
                  'city': 'test',
                  'state': 'TN',
                  'zip': '55555',
                  'stores': [store._id]
                }, companyParams);
                // Create company
                _context4.next = 7;
                return _company2.default.create(companyParams);

              case 7:
                company = _context4.sent;
                _context4.next = 10;
                return company.getSettings();

              case 10:
                settings = _context4.sent;
                _context4.next = 13;
                return _companySettings2.default.findById(settings._id);

              case 13:
                settings = _context4.sent;

                // Update company settings
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context4.prev = 17;
                for (_iterator = Object.entries(settingsParams)[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  _ref5 = _step.value;
                  _ref6 = _slicedToArray(_ref5, 2);
                  key = _ref6[0];
                  value = _ref6[1];

                  settings[key] = value;
                }
                _context4.next = 25;
                break;

              case 21:
                _context4.prev = 21;
                _context4.t0 = _context4['catch'](17);
                _didIteratorError = true;
                _iteratorError = _context4.t0;

              case 25:
                _context4.prev = 25;
                _context4.prev = 26;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 28:
                _context4.prev = 28;

                if (!_didIteratorError) {
                  _context4.next = 31;
                  break;
                }

                throw _iteratorError;

              case 31:
                return _context4.finish(28);

              case 32:
                return _context4.finish(25);

              case 33:
                _context4.next = 35;
                return settings.save();

              case 35:
                userParams = Object.assign({
                  'firstName': 'corporate',
                  'lastName': 'corporate',
                  'email': this.credentials['corporateAdmin' + setNumber].email,
                  'password': this.credentials['corporateAdmin' + setNumber].password,
                  'role': 'corporate-admin',
                  'company': company._id
                }, userParams);
                _context4.next = 38;
                return _user2.default.create(userParams);

              case 38:
                user = _context4.sent;

                // Retrieve records from DB
                this.companies.push(company);
                this.users.push(user);

              case 41:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[17, 21, 25, 33], [26,, 28, 32]]);
      }));

      function createCompanyAndCorporateAdminUser() {
        return _ref4.apply(this, arguments);
      }

      return createCompanyAndCorporateAdminUser;
    }()

    /**
     * Create a store and manager
     * @param setNumber Which set of data we're referring to
     * @param storeParams Addition store parameters
     * @param managerParams Additional manager parameters
     * @return {Promise.<void>}
     */

  }, {
    key: 'createStoreAndManager',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var storeParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var managerParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var companyId, storeData, store, managerData, user;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.getDefaultReferenceId('companies', setNumber);

              case 2:
                companyId = _context5.sent;

                // Create store
                storeData = Object.assign({
                  name: 'Test' + setNumber,
                  companyId: companyId
                }, storeParams);
                _context5.next = 6;
                return _store2.default.create(storeData);

              case 6:
                store = _context5.sent;

                this.stores.push(store);
                // Create store manager
                managerData = Object.assign({
                  'firstName': 'manager',
                  'lastName': 'manager',
                  'email': this.credentials['manager' + setNumber].email,
                  'password': this.credentials['manager' + setNumber].password,
                  'role': 'manager',
                  'company': companyId,
                  'store': store._id
                }, managerParams);
                _context5.next = 11;
                return _user2.default.create(managerData);

              case 11:
                user = _context5.sent;

                this.users.push(user);

              case 13:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createStoreAndManager() {
        return _ref7.apply(this, arguments);
      }

      return createStoreAndManager;
    }()

    /**
     * Create an employee
     * @param setNumber Which set of data we're referencing
     */

  }, {
    key: 'createEmployee',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var storeId, companyId, employeeParams, user;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                storeId = this.getDefaultReferenceId('stores', setNumber);
                companyId = this.getDefaultReferenceId('companies', setNumber);
                // Create employee

                employeeParams = {
                  'firstName': 'employee',
                  'lastName': 'employee',
                  'email': this.credentials['employee' + setNumber].email,
                  'password': this.credentials['employee' + setNumber].password,
                  'role': 'employee',
                  'company': companyId,
                  'store': storeId
                };
                _context6.next = 5;
                return _user2.default.create(employeeParams);

              case 5:
                user = _context6.sent;

                this.users.push(user);

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function createEmployee() {
        return _ref8.apply(this, arguments);
      }

      return createEmployee;
    }()

    /**
     * Create a customer
     * @param setNumber Which set of data we're referring to
     * @return {Promise.<void>}
     */

  }, {
    key: 'createCustomer',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var companyId, storeId, customerJson, customer;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                companyId = this.getDefaultReferenceId('companies', setNumber);
                storeId = this.getDefaultReferenceId('stores', setNumber);
                // Example customer creation JSON

                customerJson = {
                  "state": "IA",
                  "firstName": "test_customer",
                  "middleName": "test_customer",
                  "lastName": "test_customer",
                  "stateId": "test_customer",
                  "phone": "5555555555",
                  "address1": "50 test_customer street",
                  "address2": "",
                  "city": "Cincinnati",
                  "zip": "45243",
                  "systemId": "test_customer",
                  "company": companyId,
                  "store": [storeId]
                };
                _context7.next = 5;
                return _customer2.default.create(customerJson);

              case 5:
                customer = _context7.sent;

                this.customers.push(customer);

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function createCustomer() {
        return _ref9.apply(this, arguments);
      }

      return createCustomer;
    }()

    /**
     * Create a test retailer
     * @param attrs Attributes
     * @return {Promise.<void>}
     */

  }, {
    key: 'createRetailer',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(attrs) {
        var retailerParams, retailer;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                retailerParams = Object.assign({
                  name: 'New Retailer',
                  sellRates: {
                    cardCash: 0.9,
                    cardPool: 0.8,
                    giftcardZen: 0.7
                  },
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
                  smpType: {
                    cardCash: 'electronic',
                    cardPool: 'physical',
                    giftcardZen: 'electronic'
                  }
                }, attrs);
                _context8.next = 3;
                return _retailer2.default.create(retailerParams);

              case 3:
                retailer = _context8.sent;

                this.retailers.push(retailer);

              case 5:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function createRetailer(_x12) {
        return _ref10.apply(this, arguments);
      }

      return createRetailer;
    }()

    /**
     * Create best buy retailer
     * @return {Promise.<void>}
     */

  }, {
    key: 'createBestBuy',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var attrs;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                attrs = Object.assign({
                  "buyRate": 87,
                  "imageOriginal": "best_buy gift card.jpg (https://dl.airtable.com/nInFcIH7TsuDVvSef6Cn_best_buy%20gift%20card.jpg)",
                  "imageUrl": "https://dl.airtable.com/nInFcIH7TsuDVvSef6Cn_best_buy%20gift%20card.jpg",
                  "offerType": "",
                  "name": "Best Buy",
                  "sellRates": {
                    "giftcardZen": 0.9,
                    "cardPool": 0.9075,
                    "best": 0.9,
                    "saveYa": 0,
                    "cardCash": 0.91,
                    "sellTo": "cardcash"
                  },
                  "__v": 1,
                  "imageType": "jpg",
                  "buyRateRelations": [],
                  "verification": {
                    "url": "https://www-ssl.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17043&type=page",
                    "phone": "888-716-7994"
                  },
                  "smpSpelling": {
                    "cardCash": "Best Buy",
                    "saveYa": "Best Buy",
                    "cardPool": "Best Buy"
                  },
                  "smpType": {
                    "giftcardZen": "electronic",
                    "cardPool": "electronic",
                    "saveYa": "disabled",
                    "cardCash": "electronic"
                  },
                  "smpMaxMin": {
                    "saveYa": {
                      "max": 1000,
                      "min": 10
                    },
                    "cardCash": {
                      "max": 2000,
                      "min": 50
                    },
                    "cardPool": {
                      "max": 1000,
                      "min": 25
                    },
                    "giftcardZen": {
                      "min": 5,
                      "max": 2000
                    }
                  },
                  "apiId": {
                    "cardCash": "8",
                    "saveYa": "57007",
                    "cardPool": "0"
                  },
                  "aiId": "7",
                  "sellRatesMerch": {
                    "giftcardZen": 0.9
                  },
                  "smpTypeMerch": {
                    "giftcardZen": "electronic"
                  },
                  "smpMaxMinMerch": {
                    "cardCash": {
                      "min": 50
                    },
                    "cardPool": {
                      "max": 1000
                    },
                    "giftcardZen": {
                      "max": 2000,
                      "min": 5
                    }
                  },
                  "gsId": "5112"
                }, params);
                _context9.next = 3;
                return this.createRetailer(attrs);

              case 3:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function createBestBuy() {
        return _ref11.apply(this, arguments);
      }

      return createBestBuy;
    }()

    /**
     * Create a BI request log entry
     * @param completed BI completed
     * @param attrs Attributed
     * @return {Promise.<void>}
     */

  }, {
    key: 'createBiRequestLog',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var completed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var logParams, log;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                logParams = void 0;

                if (completed) {
                  logParams = Object.assign({
                    pin: '1',
                    number: '1',
                    retailerId: this.getDefaultReferenceId('retailers'),
                    fixed: false,
                    finalized: true,
                    created: new Date(),
                    balance: 50,
                    requestId: "2",
                    responseCode: "000",
                    responseDateTime: (0, _moment2.default)().format('YYYY-MM-DD'),
                    responseMessage: "success",
                    verificationType: "PJVT_BOT"
                  }, attrs);
                } else {
                  logParams = Object.assign({
                    pin: '1',
                    number: '1',
                    retailerId: this.getDefaultReferenceId('retailers')
                  }, attrs);
                }
                _context10.next = 4;
                return _biRequestLog2.default.create(logParams);

              case 4:
                log = _context10.sent;

                this.biRequestLogs.push(log);

              case 6:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function createBiRequestLog() {
        return _ref12.apply(this, arguments);
      }

      return createBiRequestLog;
    }()

    /**
     * Check that all expected properties are returned from an endpoint query
     * @param responseBody API response body (res.body)
     * @param properties Array of properties
     */

  }, {
    key: 'checkResponseProperties',
    value: function checkResponseProperties(responseBody, properties) {
      properties.forEach(function (prop) {
        (0, _chai.expect)(responseBody).to.have.property(prop);
      });
    }

    /**
     * Get the response body of an error response
     * @param err
     */

  }, {
    key: 'getErrBody',
    value: function getErrBody(err) {
      return err.response.res.body;
    }

    /**
     * Check validation error response properties
     * @param err Error response
     * @param errorNames Name of all validation items that should have failed
     */

  }, {
    key: 'checkErrorResponseProperties',
    value: function checkErrorResponseProperties(err, errorNames) {
      (0, _chai.expect)(err).to.have.status(400);
      var body = this.getErrBody(err);
      (0, _chai.expect)(body).to.have.property('error');
      (0, _chai.expect)(body.error).to.have.property('errors');
      var errors = body.error.errors;
      (0, _chai.expect)(errors).to.have.lengthOf(errors.length);
      for (var i = 0; i < errorNames.length; i++) {
        (0, _chai.expect)(errors[i].name).to.be.equal(errorNames[i]);
      }
    }

    /**
     * Create a mock BI response
     * @param setNumber Set number to determine cards and retailers
     * @param params
     * @return {*}
     */

  }, {
    key: 'createMockBiDeferResponse',
    value: function createMockBiDeferResponse() {
      var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return {
        params: Object.assign({
          verificationType: 'PJVT_BOT',
          balance: 'Null',
          response_datetime: (0, _moment2.default)().format(),
          responseMessage: 'Delayed Verification Required',
          requestId: setNumber.toString(),
          responseCode: '010',
          request_id: setNumber.toString(),
          responseDateTime: (0, _moment2.default)().format(),
          recheck: 'True',
          recheckDateTime: (0, _moment2.default)().add(1, 'hours').format()
        }, params),
        response: null
      };
    }

    /**
     * Create a mock BI response to gcmgr as callback
     * @param setNumber Set number to determine cards and retailers
     * @param params
     * @return {*}
     */

  }, {
    key: 'createMockBiSuccessResponseToGcmgr',
    value: function createMockBiSuccessResponseToGcmgr() {
      var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return Object.assign({
        params: {
          "number": setNumber.toString(),
          "pin": setNumber.toString(),
          "retailerId": setNumber.toString(),
          "invalid": 0,
          "balance": 100,
          "fixed": 0
        }
      }, params);
    }

    /**
     * Create a card so it can be sold
     * @param {Number} setNumber Set number to use
     * @param {Object} params Additional params
     * @param {String} userType Type of user making the request
     * @return {Promise.<*>}
     */

  }, {
    key: 'createCard',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var setNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var userType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'employee';
        var retailerId, customerId, storeId, employeeToken;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                retailerId = this.getDefaultReferenceId('retailers', setNumber);
                customerId = this.getDefaultReferenceId('customers', setNumber);
                storeId = this.getDefaultReferenceId('stores', setNumber);
                employeeToken = '' + userType + setNumber;

                params = Object.assign({
                  "retailer": retailerId,
                  "number": "1",
                  "pin": "1",
                  "customer": customerId,
                  "store": storeId,
                  "userTime": new Date(),
                  "balance": 100
                }, params);
                _context11.next = 7;
                return this.request.post('/api/card/newCard').set('Authorization', 'bearer ' + this.tokens[employeeToken].token).send(params);

              case 7:
                return _context11.abrupt('return', _context11.sent);

              case 8:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function createCard() {
        return _ref13.apply(this, arguments);
      }

      return createCard;
    }()
  }, {
    key: 'request',
    get: function get() {
      if (this.chaiRequest) {
        return this.chaiRequest;
      }
      _chai2.default.use(_chaiHttp2.default);
      this.chaiRequest = _chai2.default.request(_app2.default);
      return this.chaiRequest;
    }
  }]);

  return TestHelper;
}(_requests2.default);

exports.default = TestHelper;
//# sourceMappingURL=helpers.js.map
