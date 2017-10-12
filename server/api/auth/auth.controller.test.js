import {expect} from 'chai';

import TestHelper from '../../tests/helpers';
const test = new TestHelper();

describe('auth.controller.js', function () {
  // Clear out DB
  test.initDb();
  // Init test users
  before(async function () {
    // Create admin
    await test.createAdminUser();
    // Company and corporate admin
    await test.createCompanyAndCorporateAdminUser();
    // Create store and manager
    await test.createStoreAndManager();
    // Create an employee
    await test.createEmployee();
  });

  it("should require username", async function() {
    await test.request
    .post('/api/auth/local')
    .catch(function (err) {
      expect(err.response.body).to.have.property('message');
      expect(err.response.body.message).to.be.equal('Missing credentials');
    });
  });

  it('should require password', async function () {
    await test.request
    .post('/api/auth/local')
    .send({email: 'fake@fake.com'})
    .catch(function (err) {
      expect(err.response.body).to.have.property('message');
      expect(err.response.body.message).to.be.equal('Missing credentials');
    });
  });

  it('should reject the login request if a user does not exist', async function () {
    await test.request
    .post('/api/auth/local')
    .send({email: 'fake@fake.com', password: 'fake'})
    .catch(function (err) {
      expect(err.response.body).to.have.property('message');
      expect(err.response.body.message).to.be.equal('This email is not registered.');
    });
  });

  it('should reject the login request if the wrong password is given for a user that does exist', async function () {
    await test.request
    .post('/api/auth/local')
    .send({email: test.credentials.admin1.email, password: 'fake'})
    .catch(function (err) {
      expect(err.response.body).to.have.property('message');
      expect(err.response.body.message).to.be.equal('This password is not correct.');
    });
  });

  it('should return a valid token once the admin user logs in', async function () {
    await test.request
    .post('/api/auth/local')
    .send({email: test.credentials.admin1.email, password: test.credentials.admin1.password})
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.token).to.not.be.empty;
    });
  });

  it('should return a valid token once the corporate admin user logs in', async function () {
    return await test.request
    .post('/api/auth/local')
    .send({email: test.credentials.corporateAdmin1.email, password: test.credentials.corporateAdmin1.password})
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.token).to.not.be.empty;
    });
  });

  it('should return a valid token once the manager user logs in', async function () {
    return await test.request
    .post('/api/auth/local')
    .send({email: test.credentials.manager1.email, password: test.credentials.manager1.password})
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.token).to.not.be.empty;
    });
  });

  it('should return a valid token once the employee user logs in', async function () {
    return await test.request
    .post('/api/auth/local')
    .send({email: test.credentials.employee1.email, password: test.credentials.employee1.password})
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.token).to.not.be.empty;
    });
  });

  it('should accept the admin token when making a request', async function () {
    // Login the admin user
    await test.loginUserSaveToken('admin');
    // Make a request to an endpoint which requires an admin token
    return await test.request
    .post('/api/admin/systemTime')
    .set('Authorization', `bearer ${test.tokens.admin1.token}`)
    .then(res => {
      expect(res).to.have.status(200);
    });
  });
});
