import {expect} from 'chai';
import moment from 'moment';

import TestHelper from '../../tests/helpers';
const test = new TestHelper();

import BiRequestLog from '../biRequestLog/biRequestLog.model';
import Card from '../card/card.model';
import CallbackLog from '../callbackLog/callbackLog.model';
import Customer from '../customer/customer.model';
import User from '../user/user.model';
import Retailer from '../retailer/retailer.model';
import Inventory from '../inventory/inventory.model';
import Receipt from '../receipt/receipt.model';

import config from '../../config/environment';

import {testBiMockData} from '../card/card.controller';
import {getLastFourCharacters} from '../../helpers';

describe('lq.controller.js', function () {
  test.initDb();

  before(async function () {
    // Create users
    await test.createAdminUser();
    await test.createCompanyAndCorporateAdminUser(1, {}, {}, {callbackUrl: config.testServer});
    await test.createCompanyAndCorporateAdminUser(2);
    await test.createStoreAndManager();
    await test.createStoreAndManager(2);
    // Create employee
    await test.createEmployee();
    await test.createEmployee(2);
    // Create a customer
    await test.createCustomer();
    await test.createCustomer(2);
    // Login users
    await test.loginUserSaveToken('admin');
    await test.loginUserSaveToken('corporateAdmin');
    await test.loginUserSaveToken('employee');
    await test.loginUserSaveToken('employee', 2);
    // Create retailers
    await test.createRetailer({
      gsId: '1'
    });
    await test.createRetailer({
      name: 'PinLovers',
      name: 'PinLovers',
      pinRequired: true
    });
    await test.createBestBuy();
    // Create BI request logs
    await test.createBiRequestLog(true, {"number" : '2',"pin" : "2"}
    );
    await test.createBiRequestLog(true, {"number" : '7', "pin" : "7"}
    );
    await test.createBiRequestLog(false, {"number" : '8', "pin" : "8"});
    await test.createBiRequestLog(false, {
      number: 'a', pin: 'a', user: test.getDefaultReferenceId('users')
    });
  });

  describe('POST api/lq/account/create', function () {
    it('should create a new account', async function () {
      const params = {
          email: 'hnnng@ecks.dee',
          password: 'aightden',
          firstName: 'herewego',
          lastName: 'newuser',
          companyName: 'newcompany'
      };

      return await test.request
        .post('/api/lq/account/create')
        .set('Authorization', `bearer ${test.tokens.admin1.token}`)
        .send(params)
        .then(res => {
          expect(res).to.have.status(200);
          const expectedProps = ['token', 'companyId', 'customerId'];
          test.checkResponseProperties(res.body, expectedProps);
        });
    });
  });

  describe('POST api/lq/account/create/user', function () {
    it('should create a new account under the same company', async function () {
      const companyId = test.getDefaultReferenceId('companies');
      const storeId = test.getDefaultReferenceId('stores');
      const params = {
        email: 'oahsdfiusadhf@ddd.com',
        password: 'wwwwwwwwwwwwwww',
        firstName: 'herewego',
        lastName: 'newuser',
        companyId,
        storeId
      };

      return await test.request
        .post('/api/lq/account/create/user')
        .set('Authorization', `bearer ${test.tokens.corporateAdmin1.token}`)
        .send(params)
        .then(res => {
          expect(res).to.have.status(200);
          const expectedProps = ['token', 'companyId', 'customerId'];
          test.checkResponseProperties(res.body, expectedProps);
          expect(res.body.companyId).to.be.equal(test.getDefaultReferenceId('companies').toString());
        });
    });
  });

  describe('POST api/lq/new', function () {
    it('should require params', async function () {
      return test.lqNew({})
      .catch(err => {
        test.checkErrorResponseProperties(err, ['number', 'retailer', 'userTime', 'balance']);
      })
    });

    it('should add a new card to the system', async function () {
      testBiMockData.push(test.createMockBiDeferResponse(1, {requestId: 'e', request_id: 'e'}));
      const params = {
        number: '1',
        pin: '1',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 40,
        merchandise: false
      };

      return test.lqNew(params)
        .then(async res => {
          expect(res).to.have.status(200);
          test.checkResponseProperties(res.body, ['card']);

          const expectedProps = [
            '_id',
            'sellRate',
            'number',
            'retailer',
            'userTime',
            'merchandise',
            'balance',
            'pin',
            'buyAmount',
            'soldFor',
            'statusCode',
            'status'
          ];

          test.checkResponseProperties(res.body.card, expectedProps);

          const card = res.body.card;

          for (const key of Object.keys(params)) {
            if (key === 'retailer') {
              expect(card.retailer).to.be.equal(test.retailers[0].name);
            } else if (key === 'userTime') {
              const expected = moment(params.userTime);
              // MongoDb forces time to be saved in UTC, so we have to pretend
              // the current local time is in UTC
              expected.add(expected.utcOffset(), 'minutes').utc();
              const actual = moment(card.userTime);

              expect(actual.unix()).to.be.closeTo(expected.unix(), 2); // Tolerate 2 second difference
            } else {
              expect(card[key]).to.be.equal(params[key]);
            }
          }
        });
    });

    it('should create a customer if none is specified and default customer does not exist', async function () {
      // Only one card
      const cards = await Card.find({});
      expect(cards.length).to.be.equal(1);
      const thisCard = cards[0];
      const thisCustomer = await Customer.findById(thisCard.customer);
      const user = await User.findById(thisCard.user[0]);
      expect(user.company.toString()).to.be.equal(thisCustomer.company.toString());
      expect(thisCustomer.stateId).to.be.equal('API_Customer');
    });

    it('should add additional cards to the same customer if none specified', async function () {
      const params = {
        number: '2',
        pin: '2',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 100,
        merchandise: false
      };

      return await test.lqNew(params)
      .then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findById(res.body.card._id);
        const thisCustomer = await Customer.findById(card.customer);
        // Get all cards this customer
        const cardsThisCustomer = await Card.find({customer: thisCustomer._id});
        expect(cardsThisCustomer.length).to.be.equal(2);
      });
    });

    it('should have specified a verified balance since a completed BI request log exists', async function () {
      const card = await Card.findOne({number: '2', pin: '2'}).populate('inventory');
      expect(card.verifiedBalance).to.be.equal(50);
      expect(card.inventory.verifiedBalance).to.be.equal(50);
    });

    it('should reject duplicate cards', async function () {
      const params = {
        number: '1',
        pin: '1',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 40,
        merchandise: false
      };

      return await test.lqNew(params)
        .catch(err => {
          expect(err).to.have.status(400);
          const body = test.getErrBody(err);
          expect(body).to.have.property('invalid');
          expect(body.invalid).to.be.equal('Card has already been inserted into the database');
        });
    });

    it('should reject cards with no matching SMPs', async function () {
      const params = {
        number: '3',
        pin: '3',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 250,
        merchandise: false
      };

      return await test.lqNew(params)
        .catch(err => {
          expect(err).to.have.status(400);
          const body = test.getErrBody(err);
          expect(body).to.have.property('invalid');
        });
    });

    it('should select lower sell rate with higher limit', async function () {
      const params = {
        number: '4',
        pin: '4',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 60,
        merchandise: false
      };

      return await test.lqNew(params)
        .then(async res => {
          expect(res.body.card.sellRate).to.be.closeTo(0.77, 0.001);
        });
    });

    it('should accept electronic cards with no PIN if the retailer does not require a PIN code', async function () {
      const params = {
        number: '5',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 30,
        merchandise: false
      };

      return await test.lqNew(params)
        .then(res => {
          expect(res).to.have.status(200);
        })
    });

    it('should reject cards without a PIN code if a PIN is required', async function () {
      const retailer = test.references.retailers.filter(r => r.name === 'PinLovers')[0];
      const params = {
        number: '6',
        retailer: retailer._id,
        userTime: moment().format(),
        balance: 30,
        merchandise: false
      };

      return await test.lqNew(params)
      .catch(err => {
        const body = test.getErrBody(err);
        expect(err).to.have.status(400);
        expect(body).to.have.property('invalid');
        expect(body.invalid).to.be.equal(`A PIN is required for ${retailer.name}`);
      });
    });

    it('should complete cards when a BI response is received', async function () {
      const cardParams = {number: '4', pin: '4'};
      return await test.completeBiLog(cardParams)
      .then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findOne(cardParams).populate('inventory');
        const log = await BiRequestLog.findOne({card: card._id});
        expect(log.balance).to.be.equal(100);
        expect(card.verifiedBalance).to.be.equal(100);
        expect(card.inventory.verifiedBalance).to.be.equal(100);
      });
    });

    it('should have the store attached when a receipt is generated', async function () {
      const params = {
        number: '7',
        pin: '7',
        retailer: test.getDefaultReferenceId('retailers'),
        userTime: moment().format(),
        balance: 100,
        merchandise: false
      };

      return await test.lqNew(params)
        .then(async res => {
          expect(res).to.have.status(200);
          const card = await Card.findById(res.body.card._id);
          const receipt = await Receipt.findOne({inventories: [card.inventory]});
          expect(receipt).to.have.property('store');
        });
    });
  });

  describe('POST /lq/bi', function () {
    it('should respond to fake cards for customer testing purposes', async function () {
      await test.createBiLog({
        number: '1000',
        pin: '1a',
        retailer: '5668fbff37226093139b912c'
      })
      .then(res => {
        const body = res.body;
        expect(body.responseCode).to.be.equal('000');
        expect(body.request_id).to.be.equal('11502131554644889807');
        expect(body.balance).to.be.equal(100);
        expect(body.responseMessage).to.be.equal('success');
      })
    });
    it('should accept a card to initiate a balance inquiry', async function () {
      testBiMockData.push(test.createMockBiDeferResponse(1, {requestId: '1b', request_id: '1b'}));
      await test.createBiLog({
        number: '1b',
        pin: '1b',
        prefix: '1b'
      })
      .then(res => {
        const expectedProps = ['balance', 'response_datetime', 'responseMessage', 'requestId', 'responseCode',
         'responseDateTime', 'recheckDateTime'];
        test.checkResponseProperties(res.body, expectedProps);
        const body = res.body;
        expect(body.balance).to.be.equal(null);
        expect(body.requestId).to.be.equal('1b');
        expect(body.responseCode).to.be.equal('010');
      });
    });

    it('should not initiate multiple balance inquiries on the same card within a 12 hour period', async function () {
      await test.createBiLog({
        number: '1c',
        pin: '1b',
        prefix: '1b'
      })
      .then(res => {
        const body = res.body;
        expect(body.balance).to.be.equal(null);
        expect(body.requestId).to.be.equal('1b');
        expect(body.responseCode).to.be.equal('010');
      });
    });

    it('should reject a card for BI if the retailer does not support BI', async function () {

    });
  });

  describe('POST /lq/bi/:requestId', function () {
    it('should return a 400 if any params are missing for completing ', async function () {
      return await test.completeBiLog(null)
      .catch(err => {
        expect(err).to.have.status(400);
        const body = test.getErrBody(err);
        expect(body.error).to.have.property('errors');
        expect(body.error.errors).to.have.lengthOf(3);
        test.checkErrorResponseProperties(err, ['retailerId', 'number', 'balance']);
      })
    });

    it('should create a log if none exists', async function () {
      const params = {number: 'nope', pin: 'nope'};
      return await test.completeBiLog(params, 'nope')
      .then(async res => {
        const log = await BiRequestLog.findOne(params);
        expect(log).to.be.ok;
        expect(log.balance).to.be.equal(100);
      });
    });

    it('should return 404 if a retailer does not exist', async function () {
      const params = {number: 'nope', pin: 'nope', retailerId: test.getDefaultReferenceId('companies')};
      return await test.completeBiLog(params)
      .catch(err => {
        expect(err).to.have.status(404);
        const errBody = test.getErrBody(err);
        expect(errBody).to.have.property('err');
        expect(errBody.err).to.be.equal('Retailer not found');
      })
    });

    it('should create a new BiRequestLog if one does not exist', async function () {
      await test.completeBiLog({number: '100', pin: '100'}, 'b')
      .then(async () => {
        const log = await BiRequestLog.findOne({requestId: 'b'});
        expect(log).to.be.ok;
        expect(log.number).to.be.equal('100');
        expect(log.pin).to.be.equal('100');
        expect(log.balance).to.be.equal(100);
        expect(log.finalized).to.be.ok;
      });
    });

    it('should create a new BiRequestLog if the value of the card changes', async function () {
      await test.completeBiLog({number: '100', pin: '100', balance: 0}, 'b')
      .then(async () => {
        const logs = await BiRequestLog.find({requestId: 'b'}).sort({created: -1});
        expect(logs).to.have.lengthOf(2);
        const newLog = logs[0];
        expect(newLog.number).to.be.equal('100');
        expect(newLog.pin).to.be.equal('100');
        expect(newLog.balance).to.be.equal(0);
        expect(newLog.finalized).to.be.ok;
      });
    });

    it('should complete an existing BiRequestLog', async function () {
      testBiMockData.push(test.createMockBiDeferResponse(1, {requestId: 'c', request_id: 'c'}));
      // Create a card
      await test.createBiLog({
        number: 'c',
        pin: 'c',
        prefix: 'c'
      });
      await test.completeBiLog({number: 'c', pin: 'c', balance: '50'}, 'c')
      .then(async () => {
        const logs = await BiRequestLog.find({requestId: 'c'}).sort({created: -1});
        expect(logs).to.have.lengthOf(1);
        const newLog = logs[0];
        expect(newLog.number).to.be.equal('c');
        expect(newLog.pin).to.be.equal('c');
        expect(newLog.balance).to.be.equal(50);
        expect(newLog.finalized).to.be.ok;
      });
    });

    it('should have sent a callback if callbackUrl was specified in BiRequestLog', async function () {
      const callbacks = await CallbackLog.find();
      expect(callbacks).to.have.lengthOf(1);
      const callback = callbacks[0];
      expect(callback.callbackType).to.be.equal('balanceCB');
      expect(callback.prefix).to.be.equal('c');
      expect(callback.verifiedBalance).to.be.equal(50);
      expect(callback.number).to.be.equal('****c');
      expect(callback.pin).to.be.equal('c');
    });

    it('should create a BI request and then transaction for the same card', async function () {
      const bestBuySetNumber = 3;
      const number = '6119735259158091';
      const truncatedNumber = getLastFourCharacters(number);
      testBiMockData.push(test.createMockBiDeferResponse(1, {requestId: 'd', request_id: 'd'}));
      try {
        await test.createBiLog({
          "number" : "6119735259158091",
          "pin" : "1244",
          "prefix" : 582394,
          "retailer" : test.getDefaultReferenceId('retailers', bestBuySetNumber)
        });
        await test.createCardFromTransaction({
          "customer" : test.getDefaultReferenceId('customers'),
          "transactionId" : 1503970810,
          "vmMemo1" : "a_111627",
          "callbackUrl" : "http://ob1epin.herokuapp.com/api/nbc/callback",
          "storeId" : test.getDefaultReferenceId('stores'),
          "customerId" : test.getDefaultReferenceId('customers'),
          "transactionTotal" : 200,
          "userTime" : "2017-08-29 01:40:10",
          "ip_address" : "103.248.173.218",
          "prefix" : "582394",
          "brandname" : "Best Buy",
          "memo" : "2028560424-1",
          "balance" : 200,
          "retailer" : test.getDefaultReferenceId('retailers', bestBuySetNumber),
          "pin" : "1244",
          "number" : "6119735259158091"
        });
        await test.completeBiLog({
          "fixed" : 0,
          "invalid" : 0,
          "number" : "6119735259158091",
          "pin" : "1244",
          "balance" : "200",
          "retailerId" : test.getDefaultReferenceId('retailers', bestBuySetNumber)
        });
        const callbackLog = await CallbackLog.findOne({number: new RegExp(truncatedNumber)});
        console.log('**************LOG**********');
        console.log(callbackLog);
      } catch (err) {
        console.log('**************ERR**********');
        console.log(test.getErrBody(err));
      }
    });

    it('should gracefully handle errors in running the BI PHP script', async function () {

    });
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
    it(
      'should require number, retailer, userTime, balance, transaction, transactionTotal, customerId, and storeId in the request body',
      async function () {
        return await test.lqTransactions(null)
        .catch(err => {
          expect(err).to.have.status(400);
          test.checkErrorResponseProperties(err, ['number', 'retailer', 'userTime', 'balance', 'transactionId', 'transactionTotal', 'transactionTotal', 'customerId', 'storeId']);
        });
      });

    /**
     * When a card is submitted, it is sent to the balance inquiry system, which will attempt to determine the balance. When this happens, a BiRequestLog entry is created in the DB. When a response is received from BI, it is completed, and the balance returned from BI is recorded as the "verifiedBalance" in both the card and inventory. The balance that users enter when submitting a card is called the claimed balance, and it is recorded in the property "balance" in both the card and inventory.
     * In this test, create a BiRequestLog for the card being submitted, and test that the verified balance is recorded on both the card and inventory.
     */
    it(
      'should set the verifiedBalance on both card and inventory for cards for which BI is already completed',
      async function () {
        // Make request
        return await test.lqTransactions({number: '7', pin: '7', callbackUrl: config.testServer})
        .then(async res => {
          expect(res).to.have.status(200);
          // Get BI log
          const biLog = await BiRequestLog.findOne({number: '7'});
          expect(biLog).to.be.ok;
          // Get card
          const card = await Card.findById(res.body.card._id).populate('inventory');
          expect(biLog.card.toString()).to.be.equal(card._id.toString());
          expect(card.verifiedBalance).to.be.equal(50);
          expect(card.inventory.verifiedBalance).to.be.equal(50);
        });
      });

    it('should set no verifiedBalance on the record if balance inquiry has not finished yet', async function () {
      return await test.lqTransactions({number: '8', pin: '8'})
      .then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findById(res.body.card._id).populate('inventory');
        expect(card.verifiedBalance).to.be.undefined;
        expect(card.inventory.verifiedBalance).to.be.null;
      });
    });

    it('should reject duplicate cards', async function () {
      return await test.lqTransactions({number: '8', pin: '8'})
      .catch(err => {
        expect(err).to.have.status(400);
        const body = test.getErrBody(err);
        expect(body).to.have.property('invalid');
        expect(body.invalid).to.be.equal('Card already exists in database');
      });
    });

    it('should create a new BiRequestLog entry for a card which has not had BI started before', async function () {
      return await test.lqTransactions({number: '9', pin: '9'})
      .then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findById(res.body.card._id).populate('inventory');
        const log = await BiRequestLog.findOne({card: card._id});
        expect(log).not.to.be.undefined;
        expect(log.card.toString()).to.be.equal(card._id.toString());
      });
    });

    it('should populate the verifiedBalance of a card when BI completes', async function () {
      const cardParams = {number: '9', pin: '9'};
      return await test.completeBiLog({number: '9', pin: '9'})
      .then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findOne(cardParams).populate('inventory');
        const log = await BiRequestLog.findOne({card: card._id});
        expect(log.balance).to.be.equal(100);
        expect(card.verifiedBalance).to.be.equal(100);
        expect(card.inventory.verifiedBalance).to.be.equal(100);
      });
    });

    it('should have made a callback when BI was completed', async function () {
      const cardParams = {number: '9', pin: '9'};
      const card = await Card.findOne(cardParams).populate('inventory');
      expect(card.inventory.transaction.callbacks).to.have.members(['biComplete']);
    });

    it('should return 404 status code if the customer does not exist', async function () {
      return await test.lqTransactions({number: '9', pin: '9', customerId: test.getDefaultReferenceId('stores')})
      .catch(async err => {
        expect(err).to.have.status(404);
        const body = test.getErrBody(err);
        expect(body).to.be.equal('Customer not found');
      });
    });

    it('should send a cqPaymentInitiated callback after a cqAch number is set', async function () {
      let card = await Card.findOne({number: '9'}).populate('inventory');
      card.inventory.cqAch = '1';
      await card.inventory.save();
      return await test.sendTransactionCallback('cqPaymentInitiated', [card.inventory._id])
      .then(async res => {
        expect(res).to.have.status(200);
        card = await Card.findOne({number: '9'}).populate('inventory');
        expect(card.inventory.transaction.callbacks).to.have.members(['biComplete', 'cqPaymentInitiated']);
      });
    });

    it(
      'should return a 404 status code if the combination of store and company is not correct',
      async function () {
        const _storeId = test.getDefaultReferenceId('stores', '2');
        return await test.lqTransactions({storeId: _storeId})
          .catch(async err => {
            expect(err).to.have.status(404)
            expect(JSON.parse(err.response.text)).to.be.equal("Customer not found");
          });

      });

    it('should return a 404 status code if the store specified in the request body does not exist or is not part of the company that the user making the request belogs to',
      async function () {
        const _storeId = test.getDefaultReferenceId('stores', '2');
        return await test.lqTransactions({storeId: _storeId})
          .catch(async err => {
            console.log('**************ERR**********');
            console.log(test.getErrBody(err));
            //expect(err).to.have.status(404)
            //expect(JSON.parse(err.response.text)).to.be.equal("store not found");
          });

      });

    it('should return a 400 status code if the card specified in the request body already exists in the DB',
      async function () {
        testBiMockData.push(test.createMockBiDeferResponse(1, {requestId: 'f', request_id: 'f'}));
        return await test.lqTransactions()
          .catch(async err => {
            expect(err).to.have.status(400);
            //console.log("error message is"+err.response.text);
            var parsedResponse = JSON.parse(err.response.text);
            expect(parsedResponse.invalid).to.be.equal("Card already exists in database");
          });
      });


    it('should specify inventory.transaction.amountDue as 45 if the transaction total is 100 and card balance is 50 if the retailer pays out 0.9 for the card',
      async function () {

        const retailerData = await Retailer.findOne({"sellRates.cardCash":"0.9"});

        console.log("retailer value is:"+retailerData._id);
        // Update the maxSpending for the store being used to allow for the full value of the card to be used
        const thisStore = test.references.stores[0];
        thisStore.maxSpending = 100;
        await thisStore.save();
        test.references.stores[0] = thisStore;

        return await test.lqTransactions({
          transactionTotal: 100,
          balance: 50,
          retailer: retailerData._id,
          storeId: thisStore._id
        })
          .then(async res => {
            expect(res).to.have.status(200);

             const parsedText = res.body;

            let amountDue = parsedText.card.transaction.amountDue;

            expect(amountDue).to.be.equal(45);

          });

      });

    it('should specify inventory.transaction.amountDue as 0 if the transaction total is 50 and the card balance is 100',
      async function () {

        return await test.lqTransactions({
          transactionTotal: '50',
          balance: '100'
        })
        .then(async res => {
          expect(res).to.have.status(200);

          const parsedText = res.body;

          let amountDue = parsedText.card.transaction.amountDue;

          expect(amountDue).to.be.equal(0);
        });
      });
    //
    it(
      'should specify inventory.transaction.nccCardValue as 0 if the transaction total is 100 and the card balance is 50',
      async function () {
        return await test.lqTransactions({
          transactionTotal: '100',
          balance: '50'
        })
        .then(async res => {
          expect(res).to.have.status(200);
          const parsedText = res.body;
          let nccCardValue = parsedText.card.transaction.nccCardValue;
          expect(nccCardValue).to.be.equal(0);
        });
      });
    //
    it(
      'should specify inventory.transaction.nccCardValue as 60 if the transaction total is 50 and the card balance is 100',
      async function () {
        return await test.lqTransactions({
          transactionTotal: '50',
          balance: '100'
        })
        .then(async res => {
          expect(res).to.have.status(200);
          const parsedText = res.body;
          let nccCardValue = parsedText.card.transaction.nccCardValue;
          expect(nccCardValue).to.be.equal(60);
        });
      });
    //
    it(
      'should specify inventory.transaction.merchantPayoutAmount as 25 if the transaction total is 50 and the card balance is 100',
      async function () {
        return await test.lqTransactions({
          transactionTotal: '50',
          balance: '100'
        })
        .then(async res => {
          expect(res).to.have.status(200);
          const parsedText         = res.body;
          let merchantPayoutAmount = parsedText.card.transaction.merchantPayoutAmount;
          expect(merchantPayoutAmount).to.be.equal(25);
        });
      });

    it(
      'should specify inventory.transaqction.merchantPayoutAmount as 27.5 if the transaction total is 100 and the card balance is 50',
      async function () {
        return await test.lqTransactions({
          transactionTotal: '100',
          balance: '50'
        })
        .then(async res => {
          expect(res).to.have.status(200);
          const parsedText         = res.body;
          let merchantPayoutAmount = parsedText.card.transaction.merchantPayoutAmount;
          expect(merchantPayoutAmount).to.be.equal(27.5);
        });
      });

    it('should still work if the customer has rejection', async function () {
      const customer = await Customer.findById(test.getDefaultReferenceId('customers'));
      customer.rejectionTotal = 200;
      const originalRejectionTotal = customer.rejectionTotal;
      await customer.save();

      return await test.lqTransactions({
        transactionTotal: '100',
        balance: '50'
      }).then(async res => {
        expect(res).to.have.status(200);
        const card = await Card.findById(res.body.card._id);
        const customer = await Customer.findById(test.getDefaultReferenceId('customers'));
        console.log(card.buyAmount, card.balance);
        expect(customer.rejectionTotal).to.be.closeTo(originalRejectionTotal - card.buyAmount, 0.001);
      });
    });
  });
});
