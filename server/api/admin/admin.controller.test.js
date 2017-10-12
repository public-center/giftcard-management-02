import {expect} from 'chai';
import moment from 'moment';

import TestHelper from '../../tests/helpers';
const test = new TestHelper();
import {sellCardsInLiquidation, completeTransactions} from '../deferredBalanceInquiries/runDefers';
import Card from '../card/card.model';
import Inventory from '../inventory/inventory.model';

describe('admin.controller.js', function () {
  // Init DB for card controller
  test.initDb();
  // Init company and admin user
  before(async function () {
    // Create admin
    await test.createAdminUser();
    // Company and corporate admin
    await test.createCompanyAndCorporateAdminUser();
    await test.createCompanyAndCorporateAdminUser(2);
    // Create store
    await test.createStoreAndManager();
    await test.createStoreAndManager(2);
    // Create employees
    await test.createEmployee();
    await test.createEmployee(2);
    // Create customers
    await test.createCustomer();
    await test.createCustomer(2);

    const smpMaxMin = {
      cardCash: {
        max: 50,
        min: 0
      },
      cardPool: {
        max: 100,
        min: 10
      },
      giftcardZen: {
        max: null,
        min: 100
      }
    };
    // Create 2 retailers
    await test.createRetailer({name: 'Retailer1', smpMaxMin});
    await test.createRetailer({name: 'Retailer2', smpMaxMin});
    // Login employees to sell cards
    await test.loginUserSaveToken('employee');
    await test.loginUserSaveToken('employee', 2);
    // Login as admin
    await test.loginUserSaveToken('admin');

    // Sell cards for each retailer
    await test.createCard(1, {});
    await test.createCard(1, {number: '2', pin: '2'});
    await test.createCard(2, {number: '3', pin: '3'});
    await test.createCard(2, {number: '4', pin: '4'});
    await test.createCard(2, {number: '5', pin: '5'});
    // Add cards to inventory
    await test.addCardsToInventory(1);
    await test.addCardsToInventory(2);
    // Reject some cards for each retailer
    for (const retailer of test.retailers) {
      let cards = await Card.find({retailer: retailer._id});
      cards = cards.slice(0, cards.length - 1);
      const inventories = cards.map(card => card.inventory);
      await Inventory.update({_id: {'$in': inventories}}, {$set: {verifiedBalance: 0}}, {multi: true});
      await test.rejectCard(inventories);
    }
    // Complete inventories
    await sellCardsInLiquidation();
  });

  describe('GET /denials/begin/:begin/end/:end/:pageSize/:page', function () {
    // inventory.rejected === true
    it('should return array of retailers paginated with percentage of denials', async function () {
      return await test.request
        .get(`/api/admin/denials/begin/2015-01-01/end/${moment(new Date()).add(2, 'days').format('YYYY-MM-DD')}/10/0`)
        .set('Authorization', `bearer ${test.tokens.admin1.token}`)
        .then(async res => {
          const body = res.body;
          expect(body.data).to.be.an('array');
          expect(body.data.length).to.be.equal(2);
          expect(body.total).to.be.an('number');
          // Test that denials are correct
          expect(body.data[0].percentOfDenials).to.be.equal(50);
          expect(parseFloat(body.data[1].percentOfDenials.toFixed(2))).to.be.equal(66.67);
        });
    });

    // inventory.rejected === true && inventory.company === companyId
    it('should return array of retailers paginated with percentage of denials from a selected company', async function () {
      return await test.request
        .get(`/api/admin/denials/begin/2015-01-01/end/${moment(new Date()).add(2, 'days').format('YYYY-MM-DD')}/10/0?companyId=${test.companies[0].id}`)
        .set('Authorization', `bearer ${test.tokens.admin1.token}`)
        .then(async res => {
          const data = res.body.data;
          expect(data).to.be.an('array');
          expect(data.length).to.be.equal(2);
          expect(res.body.total).to.be.an('number');

          expect(data[0].percentOfDenials).to.be.equal(50);
          expect(data[1].percentOfDenials).to.be.equal(0);
        });
    });

    // inventory.rejected === true && inventory.store === storeId
    it('should return array of retailers paginated with percentage of denials from a selected store', async function () {
      return await test.request
        .get(`/api/admin/denials/begin/2015-01-01/end/${moment(new Date()).add(2, 'days').format('YYYY-MM-DD')}/10/0?storeId=${test.stores[0].id}`)
        .set('Authorization', `bearer ${test.tokens.admin1.token}`)
        .then(async res => {
          const data = res.body.data;
          // const a = { store: ObjectId('59c1acf8d133a349e99425bb'), retailer: ObjectId('59c1acf8d133a349e99425c3') };
          expect(data).to.be.an('array');
          expect(data.length).to.be.equal(2);
          expect(res.body.total).to.be.an('number');

          expect(data[0].percentOfDenials).to.be.equal(50);
          expect(data[1].percentOfDenials).to.be.equal(0);
        });
    });
  });
});
