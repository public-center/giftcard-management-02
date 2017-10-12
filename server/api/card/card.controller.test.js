import {expect} from 'chai';
import Card from './card.model';
import Inventory from '../inventory/inventory.model';
import {sellCardsInLiquidation} from '../deferredBalanceInquiries/runDefers';

import TestHelper from '../../tests/helpers';

const test = new TestHelper();

describe('card.controller.js', function () {
  // Init DB for card controller
  test.initDb();
  // Init company and admin user
  before(async function () {
    // Create admin
    await test.createAdminUser();
    // Company and corporate admin
    await test.createCompanyAndCorporateAdminUser();
    // Create store
    await test.createStoreAndManager();
    // Create employee
    await test.createEmployee();
    // Create a customer
    await test.createCustomer();
    // Create a retailer
    await test.createRetailer({name: 'Test Retailer'});
    // Login users
    await test.loginUserSaveToken('employee');
    await test.loginUserSaveToken('admin');
  });

  it('should have set up the tests properly', function () {
    // Check to see if records were created
    expect(test.references.companies).to.have.lengthOf(1);
    expect(test.references.users).to.have.lengthOf(3);
    expect(test.references.stores).to.have.lengthOf(1);
    expect(test.references.customers).to.have.lengthOf(1);
    expect(test.references.retailers).to.have.lengthOf(1);
  });

  it("should allow us to login as an employee", async function () {
    await test.loginUserSaveToken('employee');
  });

  describe('POST api/cards/newCard', function () {
    it('should allow us to create a new card', async function () {
      const retailerId = test.getDefaultReferenceId('retailers');
      const customerId = test.getDefaultReferenceId('customers');
      const storeId    = test.getDefaultReferenceId('stores');
      const params     = {
        "retailer": retailerId,
        "number"  : "1",
        "pin"     : "1",
        "customer": customerId,
        "store"   : storeId,
        "userTime": new Date(),
        "balance" : 100
      };
      return await test.request
      .post('/api/card/newCard')
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .send(params)
      .then(async res => {
        expect(res).to.have.status(200);
        // Make sure we have all expected props in the response
        const expectedProps = ['_id', 'sellRate', 'buyRate', 'balanceStatus', 'retailer', 'number', 'pin', 'customer',
                               'userTime', 'balance', 'merchandise', 'user', 'updates', 'valid', 'created'];
        const body          = res.body;
        test.checkResponseProperties(body, expectedProps);
      });
    });

    it('should have the correct references to other objects on the newly created card', async function () {
      // Check that card created is correct
      const card = await Card.findOne({});
      expect(card.retailer.toString()).to.be.equal(test.getDefaultReferenceId('retailers').toString());
      expect(card.user[0].toString()).to.be.equal(test.tokens.employee1._id);
      expect(card.customer.toString()).to.be.equal(test.getDefaultReferenceId('customers').toString());
    });

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
    it('should have sold to cardPool and have a sellRate of 0.03 less than cardPools rate', async function () {
      const card = await Card.findOne({});
      expect(card.balance).to.be.equal(100);
      expect(card.sellRate).to.be.equal(0.77);
    });
  });

  describe('GET api/cards/:customerId', function () {
    // Create another company and customer, so we can verify that users cannot query customers that do not belong to the same company as they do
    before(async function () {
      await test.createCompanyAndCorporateAdminUser(2);
      // Create store
      await test.createStoreAndManager(2);
      // Create employee
      await test.createEmployee(2);
      // Create a customer
      await test.createCustomer(2);
      // Login new employee
      await test.loginUserSaveToken('employee', 2);
    });

    it('should retrieve the cards for the existing employee user', async function () {
      const customerId = test.getDefaultReferenceId('customers');
      return await test.request
      .get('/api/card/' + customerId)
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .then(async res => {
        expect(res).to.have.status(200);
        expect(res.text).to.not.be.empty;

        let cardsData = res.body;
        expect(cardsData).to.have.property('data');
        expect(cardsData.data).to.be.instanceof(Array);
        // Make sure that we go the right number of cards
        const dbCards = await Card.find({user: test.tokens.employee1._id});
        expect(cardsData.data.length).to.be.equal(dbCards.length);
      });
    });

    it('should return a 401 status code when a user tries to query cards that do not belong to them',
      async function () {
        const customerId = test.getDefaultReferenceId('customers', 2);
        return await test.request
        .get('/api/card/' + customerId)
        .set('Authorization', `bearer ${test.tokens.employee1.token}`)
        .catch(async function (err) {
          expect(err).to.have.status(401);
        });
      });

    it('should return an empty array when a customer with no cards is queried', async function () {
      const customerId = test.getDefaultReferenceId('customers', 2);
      return await test.request
      .get('/api/card/' + customerId)
      .set('Authorization', `bearer ${test.tokens.employee2.token}`)
      .then(async res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.be.instanceOf(Array);
        expect(res.body.data.length).to.be.equal(0);
        // Check DB to confirm that the right number of cards was returned
        const dbCards = await Card.find({customer: customerId});
        expect(dbCards.length).to.be.equal(res.body.data.length);
      });
    });
  });

  describe('POST api/cards/balance/update', function () {

    // const exampleBody = {
    //   _id: card,
    //    balance: 90
    // };

    it('should update the balance on existing cards', async function () {

      const card        = await Card.findOne({user: test.tokens.employee1._id});
      const newBalance  = 20;
      const requestBody = {
        _id    : card._id,
        balance: newBalance
      }
      await test.request
      .post('/api/card/balance/update')
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .send(requestBody)
      .then(async res => {
        //console.log("response: " + JSON.stringify(res))
        expect(res).to.have.status(200);
      });

      const updatedCard = await Card.findOne({'_id': card._id});
      expect(updatedCard.balance).to.be.equal(newBalance);
    });

    it('should return a 401 status code if user tries to update a card which does not belong to them',
      async function () {
        const card        = await Card.findOne({user: test.tokens.employee1._id});
        const newBalance  = 20;
        const requestBody = {
          _id    : card._id,
          balance: newBalance
        }
        await test.request
        .post('/api/card/balance/update')
        .set('Authorization', `bearer ${test.tokens.employee2.token}`)
        .send(requestBody)
        .then(async res => {
        })
        .catch(err => {
          expect(err).to.have.status(401);
          expect(err.response.res.statusMessage).to.be.equals("Unauthorized");
          expect(err.response.res.body.err).to.be.equals("Card does not belong to this customer");
        });
      });

    it('should return a 404 status code if the user tries to update a card which does not exist', async function () {
      const requestBody = {
        _id    : test.tokens.employee1._id,
        balance: 0
      };
      await test.request
      .post('/api/card/balance/update')
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .send(requestBody)
      .catch(err => {
        expect(err.status).to.be.equal(404);
      });
    });
  });

  describe('POST api/cards/edit', function () {
    // const exampleBody = {
    //   _id: <cardId>,
    //   number: <new number>,
    //   pin: <new pin>,
    //   merchandise: true
    // };

    it(
      'should allow for an existing card to have the number, pin, and whether the card is a merchandise card to be updated',
      async function () {
        const card        = await Card.findOne({user: test.tokens.employee1._id});
        const retailer    = test.getDefaultReferenceId('retailers');
        const requestBody = {
          _id        : card._id,
          number     : "4",
          pin        : "6",
          merchandise: true,
          retailer   : retailer
        };

        await test.request
        .post('/api/card/edit')
        .set('Authorization', `bearer ${test.tokens.employee1.token}`)
        .send(requestBody)
        .then(async res => {
          expect(res).to.have.status(200);
          const updatedCard = res.body;
          expect(updatedCard.number).to.be.equals(requestBody.number);
          expect(updatedCard.pin).to.be.equals(requestBody.pin);
          expect(updatedCard.merchandise).to.be.equals(requestBody.merchandise);

        });
      });

    it('should return a 401 status code if user tries to update a card which does not belong to them',
      async function () {
        const card        = await Card.findOne({user: test.tokens.employee1._id});
        const retailer    = test.getDefaultReferenceId('retailers');
        const requestBody = {
          _id        : card._id,
          number     : "4",
          pin        : "6",
          merchandise: true,
          retailer   : retailer
        };

        await test.request
        .post('/api/card/edit')
        .set('Authorization', `bearer ${test.tokens.employee2.token}`)
        .send(requestBody)
        .catch(err => {
          expect(err).to.have.status(401);
          expect(err.response.res.statusMessage).to.be.equals("Unauthorized");
          expect(err.response.res.body.err).to.be.equals("Card does not belong to this customer");
        });
      });

    it('should return a 404 status code if a card which does not exist is queried', async function () {
      const requestBody = {
        _id        : test.tokens.employee1._id,
        number     : "4",
        pin        : "6",
        merchandise: true,
        retailer   : "Fake"
      };

      await test.request
      .post('/api/card/edit')
      .set('Authorization', `bearer ${test.tokens.employee2.token}`)
      .send(requestBody)
      .catch(err => {
        expect(err.status).to.be.equal(404);
      });
    });
  });

  describe('DELETE api/cards/:cardId', function () {
    it('should allow an existing card to be deleted', async function () {
      const card   = await Card.findOne({user: test.tokens.employee1._id});
      const cardId = card._id;
      return await test.request
      .delete('/api/card/' + cardId)
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .then(async res => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.equal('Card successfully removed');
      });
    });

    it('should return a 401 status code if user tries to delete a card which does not belong to them',
      async function () {

        const card   = await Card.findOne({user: test.tokens.employee1._id});
        const cardId = card._id;
        return await test.request
        .delete('/api/card/' + cardId)
        .set('Authorization', `bearer ${test.tokens.employee2.token}`)
        .catch(err => {
          expect(err).to.have.status(401);
          expect(err.response.res.statusMessage).to.be.equals("Unauthorized");
        });
      });

    it('should return a 404 status code if a card is deleted which does not exist', async function () {
      const card   = await Card.findOne({user: test.tokens.employee1._id});
      const cardId = test.tokens.employee1._id;
      return await test.request
      .delete('/api/card/' + cardId)
      .set('Authorization', `bearer ${test.tokens.employee1.token}`)
      .catch(err => {
        expect(err).to.have.status(404);
        expect(err.response.res.statusMessage).to.be.equals("Not Found");
      });

    });
  });

  describe('POST api/cards/addToInventory', function () {
    it('should return a 200 status code when the existing card ID is passed in', async function () {
      await test.addCardsToInventory(1)
      .then(async res => {
        expect(res).to.have.status(200);
        // Get cards
        const cards = await Card.find({user: test.tokens.employee1._id})
        .populate({
          path: 'inventory',
          populate: {
            path: 'receipt',
            model: 'Receipt'
          }
        });
        const receipt = cards[0].inventory.receipt;
        const bodyReceipt = res.body;
        expect(receipt).to.be.ok;
        expect(bodyReceipt._id.toString()).to.be.equal(receipt._id.toString());
      });
    });

    it('should create an inventory object attached', async function () {
      const card = Card.findOne({}).populate('inventory');
      //console.log("inventory: "+JSON.stringify(card))
      //expect(card).to.have.property('inventory');
    });

    it('should have created a relationship between the card and the inventory', async function () {
      const inventory = Inventory.findOne({}).populate('card');
      //expect(inventory).to.have.property('card');
    });

    it('should have the SMP value defined as cardPool (3)', async function () {
      const inventory = await Inventory.findOne({});
      //expect(inventory.smp).to.be.equal(config.smpIds.CARDPOOL);
    });

    it('should have the created a receipt for the inventory', async function () {
      const inventory = await Inventory.findOne({});
      //expect(inventory).to.have.property('receipt');
    });
  });

  describe('POST api/cards/updateDetails', function () {
    before(async function () {
      await sellCardsInLiquidation();
    });
    it('should allow the user to modify details about a card', async function () {
      let cards = await Card.find({user: test.tokens.employee1._id}).populate('inventory');
      await test.updateInventoryDetails([cards[0].inventory._id], {
        orderNumber: '1000'
      })
      .then(async res => {
        expect(res).to.have.status(200);
        const inventory = await Inventory.findById(cards[0].inventory._id);
        expect(inventory.orderNumber).to.be.equal('1000');
      })
    });

    it('should not allow the user to update values which are non-mutable', async function () {
      let cards = await Card.find({user: test.tokens.employee1._id}).populate('inventory');
      test.updateInventoryDetails([cards[0].inventory._id], {
        hasVerifiedBalance: true
      })
      .then(async () => {
        const inventory = await Inventory.findById(cards[0].inventory._id);
        expect(inventory.hasVerifiedBalance).to.be.equal(false);
      })
    });

    it('should update the liquidationSoldFor value when liquidationRate changes', async function () {
      let cards = await Card.find({user: test.tokens.employee1._id}).populate('inventory');
      test.updateInventoryDetails([cards[0].inventory._id], {
        liquidationRate: 0.5
      })
      .then(async () => {
        const inventory = await Inventory.findById(cards[0].inventory._id);
        expect(inventory.liquidationSoldFor).to.be.equal(10);
      })
    });
  });
});
