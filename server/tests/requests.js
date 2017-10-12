import {expect} from 'chai';
import moment from 'moment';

import Card from '../api/card/card.model';
import config from '../config/environment';
import Retailer from '../api/retailer/retailer.model';

export default class Requests {
  /**
   * Login as a user of any type
   * @param type Type of user
   * @param setNumber Which set of data we're referring to
   */
  async loginUserSaveToken(type, setNumber = 1) {
    return await this.request
    .post('/api/auth/local')
    .send({
      email   : this.credentials[`${type}${setNumber}`].email,
      password: this.credentials[`${type}${setNumber}`].password
    })
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.token).to.not.be.empty;
      this.tokens[`${type}${setNumber}`].token = res.body.token;
      this.tokens[`${type}${setNumber}`]._id   = res.body.user._id.toString();
    })
    .catch(() => {
      expect(false).to.be.equal(true)
    });
  }

  /**
   * Create a card from UI interaction
   * @param setNumber
   * @return {Promise.<void>}
   */
  async createCardFromUi(setNumber = 1) {
    const retailerId = this.getDefaultReferenceId('retailers', setNumber);
    const customerId = this.getDefaultReferenceId('customers', setNumber);
    const storeId    = this.getDefaultReferenceId('stores', setNumber);
    this.cardNumber  = this.cardNumber + 1;
    const balance    = 50 * setNumber;
    const tokenType  = `employee${setNumber}`;
    const params     = {
      "retailer": retailerId,
      "number"  : this.cardNumber,
      "pin"     : this.cardNumber,
      "customer": customerId,
      "store"   : storeId,
      "userTime": new Date(),
      "balance" : balance
    };
    await this.request
    .post('/api/card/newCard')
    .set('Authorization', `bearer ${this.tokens[tokenType].token}`)
    .send(params)
    .then(async res => {
      expect(res).to.have.status(200);
      return res;
    });
  }

  /**
   * Create a card from lq/new
   * @param setNumber
   * @return {Promise.<TResult>}
   */
  async createCardFromLqNew(setNumber = 1) {
    this.cardNumber = this.cardNumber + 1;
    const balance   = 50 * setNumber;
    const tokenType = `employee${setNumber}`;
    const params    = {
      number  : this.cardNumber,
      pin     : this.cardNumber,
      retailer: this.getDefaultReferenceId('retailers', setNumber),
      customer: this.getDefaultReferenceId('customers', setNumber),
      userTime: moment().format(),
      balance : balance
    };

    return await this.request
    .post('/api/lq/new')
    .set('Authorization', `bearer ${this.tokens[tokenType].token}`)
    .send(params)
    .then(async res => {
      expect(res).to.have.status(200);
      return res;
    });
  }

  /**
   * Create a card from a transaction
   * @param params Additional params
   * @param setNumber
   * @return {Promise.<TResult>}
   */
  async createCardFromTransaction(params, setNumber = 1) {
    this.cardNumber = this.cardNumber + 1;
    const balance   = 50 * setNumber;
    const tokenType = `employee${setNumber}`;
    params    = Object.assign({
      number            : this.cardNumber,
      pin               : this.cardNumber,
      retailer          : this.getDefaultReferenceId('retailers', setNumber),
      "userTime"        : moment().format(),
      "balance"         : balance,
      "memo"            : `memo${setNumber}`,
      "merchandise"     : false,
      "transactionTotal": 50,
      "transactionId"   : 12345,
      "customerId"      : this.getDefaultReferenceId('customers', setNumber),
      "storeId"         : this.getDefaultReferenceId('stores', setNumber),
      "prefix"          : `prefix${setNumber}`,
      "vmMemo1"         : "a",
      "vmMemo2"         : "b",
      "vmMemo3"         : "c",
      "vmMemo4"         : "d"
    }, params);

    return await this.request
    .post('/api/lq/transactions')
    .set('Authorization', `bearer ${this.tokens[tokenType].token}`)
    .send(params)
    .then(async res => {
      expect(res).to.have.status(200);
      return res;
    });
  }

  /**
   * Add card to inventory from UI
   * @param setNumber
   * @return {Promise.<TResult>}
   */
  async addCardsToInventory(setNumber = 1) {
    const tokenType   = `employee${setNumber}`;
    const cards       = await Card.find({user: this.tokens[tokenType]._id});
    const requestBody = {
      "cards"          : cards,
      "userTime"       : new Date(),
      "receipt"        : false,
      "modifiedDenials": 0,
    };
    return await this.request
    .post('/api/card/addToInventory')
    .set('Authorization', `bearer ${this.tokens[tokenType].token}`)
    .send(requestBody)
    .then(async res => {
      expect(res).to.have.status(200);
      return res;
    });
  }

  /**
   * Request /lq/new
   * @param params Request body
   * @param userType Type of user making request
   * @param setNumber Set of cards, users, etc
   * @return {Promise.<*>}
   */
  async lqNew(params, userType = 'corporateAdmin', setNumber = 1) {
    if (!params) {
      this.cardNumber = this.cardNumber + 1;
      params          = {
        number     : this.cardNumber,
        pin        : this.cardNumber,
        retailer   : this.getDefaultReferenceId('retailers', setNumber),
        userTime   : moment().format(),
        balance    : 40,
        merchandise: false
      };
    }

    return await this.request
    .post('/api/lq/new')
    .set('Authorization', `bearer ${this.tokens[`${userType}${setNumber}`].token}`)
    .send(params);
  }

  /**
   * Request /lq/transactions
   * @param params Request body
   * @param userType Type of user making request
   * @param setNumber Set of cards, users, etc
   * @return {Promise.<*>}
   */
  async lqTransactions(params = {}, userType = 'corporateAdmin', setNumber = 1) {
    this.cardNumber = this.cardNumber + 1;
    const balance   = 50 * setNumber;
    if (params === null) {
      params = {};
    } else {
      params = Object.assign({
        number          : this.cardNumber,
        pin             : this.cardNumber,
        retailer        : this.getDefaultReferenceId('retailers', setNumber),
        userTime        : new Date(),
        balance         : balance,
        memo            : "Match example",
        merchandise     : false,
        transactionTotal: 50,
        transactionId   : 12345,
        customerId      : this.getDefaultReferenceId('customers', setNumber),
        storeId         : this.getDefaultReferenceId('stores', setNumber),
        prefix          : "xyz",
        vmMemo1         : "a",
        vmMemo2         : "b",
        vmMemo3         : "c",
        vmMemo4         : "d"
      }, params);
    }

    return await this.request
    .post('/api/lq/transactions')
    .set('Authorization', `bearer ${this.tokens[`${userType}${setNumber}`].token}`)
    .send(params);
  }

  /**
   * Create a BI request log
   * @param params Additional params for log
   * @return {Promise.<void>}
   */
  async createBiLog(params = {}) {
    const biLogParams = Object.assign({
      number   : '1',
      pin      : '1',
      retailer : this.getDefaultReferenceId('retailers'),
      requestId: '1',
      prefix   : '1'
    }, params);
    return await this.request
    .post('/api/lq/bi')
    .set('Authorization', `bearer ${this.tokens.employee1.token}`)
    .send(biLogParams);
  }

  /**
   * Send callbacks for transaction
   * @param callbackType Callback type
   * @param inventories Inventories to send callbacks for
   * @return {Promise.<*>}
   */
  async sendTransactionCallback(callbackType, inventories) {
    return this.request.put(`/api/admin/callbacks/${callbackType}`)
    .set('Authorization', `bearer ${this.tokens.admin1.token}`)
    .send({
      inventories,
      type : callbackType,
      force: true
    });
  }

  /**
   * Complete a BI log
   * @param params
   * @param requestId BI request ID
   * @return {Promise.<void>}
   */
  async completeBiLog(params = {}, requestId = '1') {
    if (params === null) {
      params = {};
    } else {
      params            = Object.assign({
        "number"    : 1,
        "pin"       : 1,
        "retailerId": this.getDefaultReferenceId('retailers'),
        "invalid"   : 0,
        "balance"   : 100,
        "fixed"     : 0
      }, params);
    }
    const retailer = await Retailer.findById(params.retailerId);
    if (retailer) {
      // Set the BI value for retailer
      params.retailerId = retailer.gsId || retailer.aiId;
    }
    return this.request.post(`/api/lq/bi/${requestId}`)
    .set(config.biCallbackKeyHeader, config.biCallbackKey)
    .send(params);
  }

  /**
   * Update inventory details
   * @param {Array} inventories Selected inventories
   * @param {Object} params
   */
  async updateInventoryDetails(inventories, params = {}) {
    return this.request.post(`/api/card/updateDetails`)
    .set('Authorization', `bearer ${this.tokens.admin1.token}`)
    .send(Object.assign({
      ids: inventories
    }, params));
  }

  /**
   * Reject card
   */
  async rejectCard(inventories) {
    return this.request.post(`/api/card/reject`)
    .set('Authorization', `bearer ${this.tokens.admin1.token}`)
    .send({
      inventories: inventories
    });
  }
}
