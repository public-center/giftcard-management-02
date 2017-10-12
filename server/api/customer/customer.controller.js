'use strict';
import mongoose from 'mongoose';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Customer from './customer.model';
import Card from '../card/card.model';
import DenialPayment from '../denialPayment/denialPayment.model';
import Receipt from '../receipt/receipt.model';
import Company from '../company/company.model';
import Store from '../stores/store.model';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';
// Valid objectId
const isValidObjectId = mongoose.Types.ObjectId.isValid;

/**
 * Search customers
 */
export function searchCustomers(req, res) {
  let {name} = req.query;
  let returned = false;
  const company = {
    company: req.user.company
  };

  name = name.replace(' ', '.*');
  // Find all customers who match the input query
  Customer.find(Object.assign({fullName: new RegExp(name, 'i')}, company))
  .populate('store')
  .then(customers => {
    if (customers.length) {
      returned = true;
      res.json(customers);
      return false;
    }
    // Try to search by state id
    return Customer.find(Object.assign({stateId: new RegExp(name, 'i')}, company));
  })
  .then(customers => {
    // Don't perform another search
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by phone
    return Customer.find(Object.assign({phone: new RegExp(name, 'i')}, company));
  })
  .then(customers => {
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by system ID
    return Customer.find(Object.assign({systemId: new RegExp(name, 'i')}, company));
  })
  .then(customers => {
    if (customers === false) {
      return false;
    }
    if (customers.length) {
      returned = true;
      return res.json(customers);
    }
    // Try to search by address
    return Customer.find({
      company: req.user.company,
      $or:[
        {'address1':new RegExp(name, 'i')},
        {'city':new RegExp(name, 'i')},
        {'state':new RegExp(name, 'i')}
      ]});
  })
  .then(customers => {
    if (customers === false) {
      return false;
    }
    if (!returned) {
      return res.json(customers);
    }
  })
  .catch(async err => {
    console.log('**************SEARCH CUSTOMERS ERR**********');
    console.log(err);
    await ErrorLog.create({
      method: 'searchCustomers',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json(err);
  });
}

/**
 * Get customers for this company
 */
export function findCustomersThisCompany(req, res) {
  const companyId = req.params.companyId;
  // Check access
  if (companyId !== req.user.company.toString()) {
    return res.status(401).json();
  }
  Customer.find({
    company: companyId
  })
  .then(customers => res.json(customers))
  .catch(async err => {
    console.log('**************FIND CUSTOMERS BY COMPANY ERROR**********');
    console.log(err);
    await ErrorLog.create({
      method: 'findCustomersThisCompany',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({
      error: 'Could not retrieve customers'
    });
  });
}

/**
 * Retrieve customers for this store
 */
export function getCustomersThisStore(req, res) {
  Customer.find({store: req.params.store})
  .then(customers => res.json({customers}))
  .catch(async err => {
    await ErrorLog.create({
      method: 'getCustomersThisStore',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({});
  });
}

/**
 * Retrieve customer by ID
 * @param req
 * @param res
 */
export async function findCustomerById(req, res) {
  const {customerId} = req.params;
  const validObjectId = isValidObjectId(customerId);
  // Valid customer
  if (validObjectId) {
    Customer.findById(customerId)
      .populate('store')
      .populate({
        path: 'company',
        populate: [
          {
            path: 'settings',
            model: 'CompanySettings'
          }
        ]
      })
      .then(customer => res.json(customer))
      .catch(async err => {
        console.log('**************FIND CUSTOMER BY ID ERROR**********');
        console.log(err);
        await ErrorLog.create({
          method: 'findCustomerById',
          controller: 'customer.controller',
          revision: getGitRev(),
          stack: err.stack,
          error: err,
          user: req.user._id
        });
        return res.status(500).json(err);
      });
  // Default, no customer selected
  } else if (customerId === 'default') {
    return res.json({
      defaultCustomer: true
    });
  } else {
    return res.status(500).json({err: 'Invalid customer ID'});
  }
}

/**
 * Create a new customer
 * @param req
 * @param res
 */
export function newCustomer(req, res) {
  const {company} = req.user;
  let store = req.user.store;
  const customerData = req.body;
  if (customerData.store) {
    store = customerData.store;
  }
  let companySettings;

  return Store.findById(store)
  .then(store => {
    if (!store) {
      res.status(404).json({err: "Store not found"});
      throw 'noStore';
    }
    return Company.findById(company)
  })
  .then(company => {
    return company.getSettings();
  })
  .then(settings => {
    companySettings = settings;

    if (!settings.customerDataRequired) {
      ['firstName', 'lastName', 'address1', 'city', 'state', 'zip', 'phone', 'fullName', 'email'].forEach(attr => {
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

    const customer = new Customer(customerData);
    customer.company = company;
    return customer.save();
  })
  .then(customer => {
    if (!companySettings.customerDataRequired) {
      const newCustomerData = {};
      ['firstName', 'lastName', 'address1', 'city', 'state', 'zip', 'phone', 'fullName', 'email'].forEach(attr => {
        if (!customer[attr].replace(/\s/g, '').length) {
          newCustomerData[attr] = '';
        }
      });

      Customer.update({_id: customer._id}, newCustomerData).then(() => {});
      return Customer.findById(customer._id);
    }

    return customer;
  })
  .then(customer => {
    return res.json(customer);
  })
  .catch(async err => {
    if (err === 'noStore') {
      return;
    }
    if (err.name && err.name === 'ValidationError') {
      return res.status(400).json(err);
    }
    await ErrorLog.create({
      method: 'newCustomer',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });

    console.log('********************ERROR IN NEWCUSTOMER********************');
    console.log(err);
    res.status(500).json(err);
  });
}

/**
 * Update customer
 * @param req
 * @param res
 */
export function updateCustomer(req, res) {
  const {customerId} = req.params;
  const company = req.user.company;
  const body = req.body;

  Customer.findOne({_id: customerId, company})
  .then(customer => {
    if (!customer) {
      return res.status(404);
    }

    const editable = [
      'address1',
      'address2',
      'city',
      'enabled',
      'firstName',
      'lastName',
      'middleName',
      'phone',
      'state',
      'stateId',
      'zip',
      'email'
    ];

    editable.forEach(key => {
      customer[key] = body[key];
    });
    return customer.save();
  })
  .then(() => res.json())
  .catch(async err => {
    console.log('**************ERR IN UPDATE CUSTOMER**********');
    console.log(err);
    await ErrorLog.create({
      method: 'updateCustomer',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json(err);
  })
}

/**
 * Assign a customer to a card
 */
export function assignCustomerToCard(req, res) {
  const {customer, card} = req.body;
  Card.findById(card._id)
  .then(card => {
    card.customer = customer._id;
    return card.save();
  })
  .then(card => {
    return Card.findById(card._id)
      .populate({
        path: 'retailer',
        populate: {
          path: 'buyRateRelations',
          model: 'BuyRate'
        }
      })
      .populate('customer');
  })
  .then(card => res.json(card))
  .catch(async err => {
    console.log('**************ASSIGN CUSTOMER TO CARD ERR**********');
    console.log(err);
    await ErrorLog.create({
      method: 'assignCustomerToCard',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({
      message: 'Could not assign customer to card'
    });
  });
}

/**
 * Find customers with denials
 */
export function findCustomersWithDenials(req, res) {
  return Customer
  .find()
  .sort({rejectionTotal: -1})
  .then(customers => res.json({customers}))
  .catch(async err => {
    console.log('**************ERR FINDING CUSTOMERS WITH DENIALS**********');
    console.log(err);
    await ErrorLog.create({
      method: 'findCustomersWithDenials',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json(err);
  });
}

/**
 * Update customer denial total
 */
export function updateCustomerDenialTotal(req, res) {
  const {_id, newTotal} = req.body;
  Customer.findById(_id)
  .then(customer => {
    if (customer) {
      customer.rejectionTotal = newTotal;
      return customer.save();
    } else {
      throw 'notFound';
    }
  })
  .then(customer => res.json(customer))
  .catch(async err => {
    console.log('**************ERR IN UPDATE CUSTOMER REJECTION TOTAL**********');
    console.log(err);
    await ErrorLog.create({
      method: 'updateCustomerDenialTotal',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({err});
  });
}

/**
 * Get all customers
 */
export function getAllCustomers(req, res) {
  Customer.find()
  .then(customers => res.json(customers))
  .catch(async err => {
    await ErrorLog.create({
      method: 'getAllCustomers',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({});
  });
}

/**
 * Make a cash payment against denials
 */
export function cashPayment(req, res) {
  const {amount, userTime, rejectionTotal, store, company} = req.body;
  const user = req.user;
  Customer.findById(req.params.customerId)
  .then(customer => {
    const previousTotal = customer.rejectionTotal;
    customer.rejectionTotal = previousTotal - parseFloat(amount);
    const denialPayment = new DenialPayment({
      amount,
      userTime,
      customer: customer._id
    });
    const receipt = new Receipt({
      userTime,
      rejectionTotal,
      total: amount,
      appliedTowardsDenials: amount,
      grandTotal: amount,
      company,
      store,
      customer: customer._id,
      user: user._id
    });
    return Promise.all([
      denialPayment.save(),
      customer.save(),
      receipt.save()
    ]);
  })
  .then(models => {
    const [payment, customer, receipt] = models;
    return res.json({data: receipt});
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'cashPayment',
      controller: 'customer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err,
      user: req.user._id
    });
    return res.status(500).json({});
  });
}
