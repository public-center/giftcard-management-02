const request = require('request');
const fs = require('fs');
const path = require('path');

const certContent = fs.readFileSync(path.join(__dirname, 'ca_cert', 'digicert_chain.pem'));

export default function (options) {
  const token = new Buffer(options.username + ':' + options.password).toString('base64'), domain = options.domain ||
                                                                                          'https://api.tangocard.com';

  const _request = function (method, uri, payload, callback) {
    if ('undefined' === typeof callback) {
      callback = payload;
      payload = null;
    }

    method = method.toUpperCase() || 'GET';

    const options = {
      uri: domain + uri,
      method: method,
      qs: 'GET' === method ? payload : null,
      headers: {'Authorization': 'Basic ' + token},
      json: true,
      body: 'GET' !== method ? payload : null,
      agentOptions: {ca: certContent}
    };

    return request(options, function (err, req, body) {
      if (err) {
        return callback(err);
      }

      if (!body) {
        return callback(new Error('API Response is empty'));
      }

      if (false === body.success && 'string' === typeof body.error_message) {
        return callback(new Error(body.error_message));
      }

      return callback(null, body);
    });
  };

  return {
    createAccount: function (customerId, payload, callback) {
      return _request('POST', `customers/${customerId}/accounts`, payload, callback);
    },

    registerCreditCard: function (payload, callback) {
      return _request('POST', 'cc_register', payload, callback);
    },

    fundAccount: function (payload, callback) {
      return _request('POST', 'cc_fund', payload, callback);
    },

    deleteCreditCard: function (payload, callback) {
      return _request('POST', 'cc_unregister', payload, callback);
    },

    getRewards: function (callback) {
      return _request('GET', 'rewards', callback);
    },

    placeOrder: function (payload, callback) {
      return _request('POST', 'orders', payload, callback);
    },

    getOrderInfo: function (orderId, callback) {
      return _request('GET', 'orders/' + orderId, callback);
    },

    getOrderHistory: function (qs, callback) {
      return _request('GET', 'orders', qs, callback);
    },

    getCustomers: function (qs, callback) {
      return _request('GET', 'customers', qs, callback);
    },

    /**
     * Create a new customer
     * @param payload
     *    {
            "createdAt": "string",
            "customerIdentifier": "string",
            "displayName": "string",
            "status": "string"
          }
     * @param callback
     */
    newCustomer: (payload, callback) => {
      return _request('POST', 'customers', payload, callback);
    },
    /**
     * Get accounts
     */
    getAccounts: callback => {
      return _request('GET', 'accounts', callback);
    },
    /**
     * Get an account by ID
     * @param id
     * @param callback
     */
    getAccountById: (id, callback) => {
      return _request('GET', `accounts/${id}`, callback);
    },
    /**
     * Get a customer's accounts
     * @param {Number} customerId
     * @param {Function} callback
     */
    getCustomerAccounts: (customerId, callback) => {
      return _request('GET', `customers/${customerId}/accounts`, callback);
    },
    /**
     * Get catalogs
     */
    getCatalogs: callback => {
      return _request('GET', 'catalogs', {verbose: false}, callback);
    },
    /**
     * Add a new card
     */
    newCard: (payload, callback) => {
      return _request('POST', 'creditCards', payload, callback);
    },
    /**
     * Fund via a card
     */
    fund: (payload, callback) => {
      return _request('POST', 'creditCardDeposits', payload, callback);
    }
  }
};
