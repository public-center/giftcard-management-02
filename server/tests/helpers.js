import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import {expect} from 'chai';
import moment from 'moment';

import {mongo} from '../config/environment'

import Batch from '../api/batch/batch.model';
import BiRequestLog from '../api/biRequestLog/biRequestLog.model';
import BuyRate from '../api/buyRate/buyRate.model';
import CallbackLog from '../api/callbackLog/callbackLog.model';
import Card from '../api/card/card.model';
import CardUpdates from '../api/cardUpdates/cardUpdates.model';
import Company from '../api/company/company.model';
import Customer from '../api/customer/customer.model';
import CustomerEdit from '../api/customerEdit/customerEdit.model';
import DemonError from '../api/daemonError/daemonError.model';
import DeferredBalanceUpdates from '../api/deferredBalanceInquiries/deferredBalanceInquiries.model';
import DenialPayment from '../api/denialPayment/denialPayment.model';
import Inventory from '../api/inventory/inventory.model';
import Log from '../api/log/logs.model';
import Receipt from '../api/receipt/receipt.model';
import Reconciliation from '../api/reconciliation/reconciliation';
import Reserve from '../api/reserve/reserve.model';
import Retailer from '../api/retailer/retailer.model';
import Store from '../api/stores/store.model';
import SystemSettings from '../api/systemSettings/systemSettings.model';
import Tango from '../api/tango/tango.model';
import User from '../api/user/user.model';

import app from '../app';
import Requests from './requests';
import '../api/company/autoBuyRate.model';
import CompanySettings from '../api/company/companySettings.model';

export default class TestHelper extends Requests {
  /**
   * Store information on users, companies, stores, and customers
   * @type {{}}
   */
  constructor() {
    super();
    this.chaiRequest = null;
    // Created objects
    this.companies = [];
    this.users = [];
    this.stores = [];
    this.customers = [];
    this.retailers = [];
    this.biRequestLogs = [];
    /**
     * Keep reference to all of the above in a single data structure
     */
    this.references = {};
    /**
     * Credentials used for creating test users
     */
    this.credentials = this.resetCredentials();
    /**
     * Store login tokens so we can send them with subsequent requests
     */
    this.tokens = this.resetTokens();
    // Current card number (when creating new cards)
    this.cardNumber = 0;
  }

  /**
   * Request singleton
   * @return {null|*}
   */
  get request() {
    if (this.chaiRequest) {
      return this.chaiRequest;
    }
    chai.use(chaiHttp);
    this.chaiRequest = chai.request(app);
    return this.chaiRequest;
  }

  /**
   * Initialize the DB for testing
   */
  initDb() {
    before(async () => {
      this.clearData();
      if (mongoose.connection.db) {
        return await this.clearDb();
      }
      mongoose.connect(mongo.uri, done);
    });
  }

  /**
   * Reset all data
   */
  clearData() {
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
  async clearDb() {
    await Batch.remove();
    await BiRequestLog.remove();
    await BuyRate.remove();
    await CallbackLog.remove();
    await Card.remove();
    await CardUpdates.remove();
    await Company.remove();
    await Customer.remove();
    await CustomerEdit.remove();
    await DemonError.remove();
    await DeferredBalanceUpdates.remove();
    await DenialPayment.remove();
    await Inventory.remove();
    await Log.remove();
    await Receipt.remove();
    await Reconciliation.remove();
    await Reserve.remove();
    await Retailer.remove();
    await Store.remove();
    await SystemSettings.remove();
    await Tango.remove();
    await Retailer.remove();
    await User.remove();
  }

  /**
   * Reset credentials for each new test set
   */
  resetCredentials() {
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
  resetTokens() {
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
  generateStackTrace() {
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
  getDefaultReferenceId(type, setNumber = 1) {
    if (!type) {
      this.generateStackTrace();
      throw 'Unable to determine reference type';
    }
    const reference = this.references[type];
    if (!reference) {
      expect(true).to.be.equal(false);
    }
    return reference[setNumber - 1]._id;
  }

  /**
   * Create an admin user
   * @param setNumber Which set of data we're referring to
   * @return {Promise.<void>}
   */
  async createAdminUser(setNumber = 1) {
    const adminUserParams = {
      'firstName': 'test',
      'lastName' : 'test',
      'email'    : this.credentials[`admin${setNumber}`].email,
      'password' : this.credentials[`admin${setNumber}`].password,
      'role'     : 'admin'
    };
    return await User.create(adminUserParams);
  }

  /**
   * Create company and admin user
   * @param setNumber Set number
   * @param companyParams Additional company params
   * @param userParams Additional user params
   * @param settingsParams Additional company settings params
   * @return {Promise.<void>}
   */
  async createCompanyAndCorporateAdminUser(setNumber = 1, companyParams = {}, userParams = {}, settingsParams = {}) {
    const storeParams = {
      name: `testStore${setNumber}`,
      address1: 'test',
      address2: 'test',
      city: 'test',
      state: 'TN',
      zip: '77777',
      phone: '333333333'
    };
    // Create store
    const store = await Store.create(storeParams);
    companyParams = Object.assign({
      'name'       : `Test${setNumber}`,
      'address1'   : 'test',
      'address2'   : 'test',
      'city'       : 'test',
      'state'      : 'TN',
      'zip'        : '55555',
      'stores'      : [store._id]
    }, companyParams);
    // Create company
    let company = await Company.create(companyParams);
    let settings = await company.getSettings();
    settings = await CompanySettings.findById(settings._id);
    // Update company settings
    for (const [key, value] of Object.entries(settingsParams)) {
      settings[key] = value;
    }
    await settings.save();
    userParams = Object.assign({
      'firstName': 'corporate',
      'lastName' : 'corporate',
      'email'    : this.credentials[`corporateAdmin${setNumber}`].email,
      'password' : this.credentials[`corporateAdmin${setNumber}`].password,
      'role'     : 'corporate-admin',
      'company'  : company._id,
    }, userParams);
    const user = await User.create(userParams);
    // Retrieve records from DB
    this.companies.push(company);
    this.users.push(user);
  }

  /**
   * Create a store and manager
   * @param setNumber Which set of data we're referring to
   * @param storeParams Addition store parameters
   * @param managerParams Additional manager parameters
   * @return {Promise.<void>}
   */
  async createStoreAndManager(setNumber = 1, storeParams = {}, managerParams = {}) {
    // Default to first company
    const companyId = await this.getDefaultReferenceId('companies', setNumber);
    // Create store
    const storeData = Object.assign({
      name: `Test${setNumber}`,
      companyId: companyId
    }, storeParams);
    const store = await Store.create(storeData);
    this.stores.push(store);
    // Create store manager
    const managerData = Object.assign({
      'firstName': 'manager',
      'lastName' : 'manager',
      'email'    : this.credentials[`manager${setNumber}`].email,
      'password' : this.credentials[`manager${setNumber}`].password,
      'role'     : 'manager',
      'company'  : companyId,
      'store'    : store._id
    }, managerParams);
    const user = await User.create(managerData);
    this.users.push(user);
  }

  /**
   * Create an employee
   * @param setNumber Which set of data we're referencing
   */
  async createEmployee(setNumber = 1) {
    const storeId = this.getDefaultReferenceId('stores', setNumber);
    const companyId = this.getDefaultReferenceId('companies', setNumber);
    // Create employee
    const employeeParams = {
      'firstName': 'employee',
      'lastName' : 'employee',
      'email'    : this.credentials[`employee${setNumber}`].email,
      'password' : this.credentials[`employee${setNumber}`].password,
      'role'     : 'employee',
      'company'  : companyId,
      'store'    : storeId
    };
    const user = await User.create(employeeParams);
    this.users.push(user);
  }

  /**
   * Create a customer
   * @param setNumber Which set of data we're referring to
   * @return {Promise.<void>}
   */
  async createCustomer(setNumber = 1) {
    const companyId = this.getDefaultReferenceId('companies', setNumber);
    const storeId = this.getDefaultReferenceId('stores', setNumber);
    // Example customer creation JSON
    const customerJson = {
      "state"     : "IA",
      "firstName" : "test_customer",
      "middleName": "test_customer",
      "lastName"  : "test_customer",
      "stateId"   : "test_customer",
      "phone"     : "5555555555",
      "address1"  : "50 test_customer street",
      "address2"  : "",
      "city"      : "Cincinnati",
      "zip"       : "45243",
      "systemId"  : "test_customer",
      "company"   : companyId,
      "store"     : [storeId]
    };
    const customer = await Customer.create(customerJson);
    this.customers.push(customer);
  }

  /**
   * Create a test retailer
   * @param attrs Attributes
   * @return {Promise.<void>}
   */
  async createRetailer(attrs) {
    const retailerParams = Object.assign({
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
      },
    }, attrs);

    const retailer = await Retailer.create(retailerParams);
    this.retailers.push(retailer);
  }

  /**
   * Create best buy retailer
   * @return {Promise.<void>}
   */
  async createBestBuy(params = {}) {
    const attrs = Object.assign({
      "buyRate" : 87,
      "imageOriginal" : "best_buy gift card.jpg (https://dl.airtable.com/nInFcIH7TsuDVvSef6Cn_best_buy%20gift%20card.jpg)",
      "imageUrl" : "https://dl.airtable.com/nInFcIH7TsuDVvSef6Cn_best_buy%20gift%20card.jpg",
      "offerType" : "",
      "name" : "Best Buy",
      "sellRates" : {
        "giftcardZen" : 0.9,
        "cardPool" : 0.9075,
        "best" : 0.9,
        "saveYa" : 0,
        "cardCash" : 0.91,
        "sellTo" : "cardcash"
      },
      "__v" : 1,
      "imageType" : "jpg",
      "buyRateRelations" : [ ],
      "verification" : {
        "url" : "https://www-ssl.bestbuy.com/site/olstemplatemapper.jsp?id=pcat17043&type=page",
        "phone" : "888-716-7994"
      },
      "smpSpelling" : {
        "cardCash" : "Best Buy",
        "saveYa" : "Best Buy",
        "cardPool" : "Best Buy"
      },
      "smpType" : {
        "giftcardZen" : "electronic",
        "cardPool" : "electronic",
        "saveYa" : "disabled",
        "cardCash" : "electronic"
      },
      "smpMaxMin" : {
        "saveYa" : {
          "max" : 1000,
          "min" : 10
        },
        "cardCash" : {
          "max" : 2000,
          "min" : 50
        },
        "cardPool" : {
          "max" : 1000,
          "min" : 25
        },
        "giftcardZen" : {
          "min" : 5,
          "max" : 2000
        }
      },
      "apiId" : {
        "cardCash" : "8",
        "saveYa" : "57007",
        "cardPool" : "0"
      },
      "aiId" : "7",
      "sellRatesMerch" : {
        "giftcardZen" : 0.9
      },
      "smpTypeMerch" : {
        "giftcardZen" : "electronic"
      },
      "smpMaxMinMerch" : {
        "cardCash" : {
          "min" : 50
        },
        "cardPool" : {
          "max" : 1000
        },
        "giftcardZen" : {
          "max" : 2000,
          "min" : 5
        }
      },
      "gsId" : "5112"
    }, params);
    await this.createRetailer(attrs);
  }

  /**
   * Create a BI request log entry
   * @param completed BI completed
   * @param attrs Attributed
   * @return {Promise.<void>}
   */
  async createBiRequestLog(completed = false, attrs = {}) {
    let logParams;
    if (completed) {
      logParams = Object.assign({
        pin: '1',
        number: '1',
        retailerId: this.getDefaultReferenceId('retailers'),
        fixed : false,
        finalized : true,
        created : new Date(),
        balance : 50,
        requestId : "2",
        responseCode : "000",
        responseDateTime : moment().format('YYYY-MM-DD'),
        responseMessage : "success",
        verificationType : "PJVT_BOT"
      }, attrs);
    } else {
      logParams = Object.assign({
        pin: '1',
        number: '1',
        retailerId: this.getDefaultReferenceId('retailers')
      }, attrs);
    }
    const log = await BiRequestLog.create(logParams);
    this.biRequestLogs.push(log);
  }

  /**
   * Check that all expected properties are returned from an endpoint query
   * @param responseBody API response body (res.body)
   * @param properties Array of properties
   */
  checkResponseProperties(responseBody, properties) {
    properties.forEach(prop => {
      expect(responseBody).to.have.property(prop);
    });
  }

  /**
   * Get the response body of an error response
   * @param err
   */
  getErrBody(err) {
    return err.response.res.body;
  }

  /**
   * Check validation error response properties
   * @param err Error response
   * @param errorNames Name of all validation items that should have failed
   */
  checkErrorResponseProperties(err, errorNames) {
    expect(err).to.have.status(400);
    const body = this.getErrBody(err);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('errors');
    const errors = body.error.errors;
    expect(errors).to.have.lengthOf(errors.length);
    for (let i = 0; i < errorNames.length; i++) {
      expect(errors[i].name).to.be.equal(errorNames[i]);
    }
  }

  /**
   * Create a mock BI response
   * @param setNumber Set number to determine cards and retailers
   * @param params
   * @return {*}
   */
  createMockBiDeferResponse(setNumber = 1, params = {}) {
    return {
      params  : Object.assign({
        verificationType : 'PJVT_BOT',
        balance          : 'Null',
        response_datetime: moment().format(),
        responseMessage  : 'Delayed Verification Required',
        requestId        : setNumber.toString(),
        responseCode     : '010',
        request_id       : setNumber.toString(),
        responseDateTime : moment().format(),
        recheck          : 'True',
        recheckDateTime  : moment().add(1, 'hours').format()
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
  createMockBiSuccessResponseToGcmgr(setNumber = 1, params = {}) {
    return Object.assign({
      params  : {
        "number": setNumber.toString(),
        "pin": setNumber.toString(),
        "retailerId": setNumber.toString(),
        "invalid": 0,
        "balance": 100,
        "fixed": 0
      },
    }, params);
  }

  /**
   * Create a card so it can be sold
   * @param {Number} setNumber Set number to use
   * @param {Object} params Additional params
   * @param {String} userType Type of user making the request
   * @return {Promise.<*>}
   */
  async createCard(setNumber = 1, params = {}, userType = 'employee') {
    const retailerId = this.getDefaultReferenceId('retailers', setNumber);
    const customerId = this.getDefaultReferenceId('customers', setNumber);
    const storeId    = this.getDefaultReferenceId('stores', setNumber);
    const employeeToken = `${userType}${setNumber}`;
    params     = Object.assign({
      "retailer": retailerId,
      "number"  : "1",
      "pin"     : "1",
      "customer": customerId,
      "store"   : storeId,
      "userTime": new Date(),
      "balance" : 100
    }, params);
    return await this.request
    .post('/api/card/newCard')
    .set('Authorization', `bearer ${this.tokens[employeeToken].token}`)
    .send(params)
  }
}
