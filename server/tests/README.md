# Testing

### Testing Project

https://www.pivotaltracker.com/n/projects/2089797

## At the Beginning of Each Day

At the beginning of the day, you must branch off of `development` before creating a new branch. The only exception is if a pull request already exists for the branch you were working on the previous day, and it has not been merged or closed. In that case, you must merge `development` into your branch so that you have the most updated code.

### Creating a New Branch Off of Development

Creating a new branch off of `development` can be done as follows:

#### Using Webstorm:

Click on the git branch selector in the lower right, Select `development -> checkout`, then make sure that `development` is updated by clicking `VCM -> Git -> pull`. After `development` has been updated, click `Git: development` at the bottom right of the screen, then `+ New Branch` at the top of the list of branches that pops up. Name your new branch something like `aashish/unit-testing` (basically, `aashish/short-description-of-task`) 

#### Using Command Line:

Check out development: 

`git checkout development`

Update development:

`git pull`

Create a new branch off of `development`

`git checkout -b aashish/unit-testing`

### Updating an Existing Branch Which Has Not Been Merged or Closed the Previous Day

A pull request must be submitted every day. If the pull request has not been merged or closed the previous day, then you may continue working on the same branch you were working on yesterday. Any new code that you push will be automatically added to the pull request.

To update an existing branch, you must do one of the following:

#### Using Webstorm:

Before updating your branch, make sure that the development branch has been updated and is ready to be merged into your branch:

Click on the git branch selector in the lower right, Select `development -> checkout`, then make sure that `development` is updated by clicking `VCM -> Git -> pull`.

Click on the Git branch selector in the lower right, Select your branch you were working on the previous day, then make sure that you are on your branch: `Git branch selector -> <your branch> -> checkout`. Click again the branch selector so you can merge `development` into your branch: `Git branch selector -> development -> Merge`

Do not ever merge your branch into `development`. Make sure that you are always merging your branch into `development`, and not the other way around.

#### Using Command Line:

Check out development: 

`git checkout development`

Update development:

`git pull`

Checkout your branch

`git checkout aashish/unit-testing`

Merge `development` into your branch:

`git merge development` 

## At the End of Each Day

You must submit a [pull request](https://github.com/loganetherton/gcmgr/compare) at the end of each day. Even if the code is not completely finished and ready to be merged into the `development` branch, a pull request must be submitted.

The only exception is when a pull request was submitted on the previous day, but it was not closed or merged into `development`. In  this case, simply push to the same branch that you were working on yesterday and let me know when it is finished so I can review the code.

## Running Tests

`npm run test`

The tests will interact direcly with the actual endpoints. So, when tests are run, the server starts up and actual HTTP requests are made. The important thing for now is that we tests that the endpoints are doing what they need to do. 

Eventually, we can stub individual functions and test them. For now, we just want to make sure that the API remains stable.

## Writing Asynchronous Tests

All tests will be testing asynchronous functions, since they are interacting with live endpoints. [Superagent](https://visionmedia.github.io/superagent/) is used to for making http requests, and [Chai](http://chaijs.com/) is used to verify the result. You can use either the [expect](http://chaijs.com/api/bdd/) or [assert](http://chaijs.com/api/assert/)methods in Chai.

The tests are handled by the class `TestHelper`, which holds all helper functions, manages endpoint requests, etc. 

To user Superagent with Chai, we use the Chai plugin called [chai-http](https://github.com/chaijs/chai-http). The `requests` object will be automatically created when it is first used in each suite of tests. A new instance of `TestHelper` must be instantiated for each set of tests. This will give access to the `request` method, as well as all other helper functions.

```javascript
import TestHelper from '../../tests/helpers';
const test = new TestHelper();
await test.request
.post('/api/card/newCard')
...
```

Example request using expect:

```javascript
test.request
  .post('/api/auth/local')
  .then(function (res) {
    expect(res).to.have.status(200);
    expect(res.body.token).to.not.be.empty;
    test.tokens.admin = res.body.token;
  })
  .catch(function (err) {
    throw err;
  });
```
```javascript
test.request
  .post('/api/auth/local')
  .send({email: test.credentials[type].email, password: test.credentials[type].password})
  .then(function (res) {
    expect(res).to.have.status(200);
    expect(res.body.token).to.not.be.empty;
    tokens.admin = res.body.token;
  })
  .catch(function (err) {
    throw err;
  });
```

Generally, you want to test the result `status`, which is tested in the above example using `expect(res).to.have.status(200);`.

## Determining Intended Data for Endpoints

Using the application is often the best way to determine the proper data for testing an endpoint.

You can login to the application at http://gcmgr-staging.cardquiry.com

The credentials you can use are as follows:

```
Admin
user: admin@admin.com
password: irDZqHRh9v3NdRD5kABEXEiKVY2GWJ
```

```
Corporate Admin
user: corporate@corporate.com
password: corporate
```

```
Manager
user: manager@manager.com
password: manager
```

```
Employee
user: employee@employee.com
password: employee
```

For example, if I wanted to write a test against the endpoint used to create a store, I could login as a corporate admin user on the staging server, then click on stores. Along the top, I would see a button that says, `Create New Store`. If I click that, I will be able to fill in the information on the form. Then, in Chrome, I hit f12 to open the developer console. I could go to the network tab, and when I click `Save Changes` to create the store, the information send to the server, as well as the response, is shown. To see the information sent to the server, I click on the request that was just sent over, click on headers, and scroll all the way down to where it says `Request Payload`. This will show me the exact data that is required.

## What to Test

Initially, we are testing each endpoint. We simply want to have a suite of tests to ensure that no endpoint is broken. To do this, we want to create tests for each endpoint. The tests will include the following:

* Tests which send the correct data to the endpoint. After this data is sent, we want to examine the database and make sure the right data is present.
* Tests which send no data, as well as incorrect data to the endpoints.

Please see the tests in `/api/auth` for an example of what I'm looking for.

## Test Setup

In many cases, the same setup must be done for each set of endpoints. Since the database is cleared after each test, we will need to not only create users, but also login in users and store their token, create stores, etc. These generic functions which will be used in each set of tests will be stores in `/server/tests/helpers.js`. Tests should not be performed in this file, but rather in the individual test files. This is simply for setup.

For example, in the `auth.controller.test.js` file, I need to create a user of each type: `admin`, `corporate-admin`, `manager`, `employee`. In order to create `corporate-admin` users, we also need to create a company. In order to create `manager` and `employee` users, we need to create a store within the previously created company. All of these functions should be placed into `tests/helpers.js`, and then the result tested in the test file (in this case, `auth.controller.test.js`).

Data created in the helper file should be saved in the helper file and then exported into the individual test files. In this file, data can be stored in the database directly. So, rather than making a request to an endpoint, you can simply interact directly with the database.

Example:

```javascript
  const userParams = {
    'firstName': 'test',
    'lastName' : 'test',
    'email'    : test.credentials.corporateAdmin.email,
    'password' : test.credentials.corporateAdmin.password,
    'role'     : 'corporate-admin',
    'company'  : company._id,
  };
  const user = new User();
  user.firstName = 'Something else';
  await user.save();
  // or
  await User.create(userParams);
```

Database interactions are done using [Mongoose](http://mongoosejs.com/).

Note the user of `await` before `User.create(userParams);`. If `await` is not called, then you will not initiate the actual database call. Additionally, for `await` to be valid, the immediate surrounding function must be an `async` function. Please see [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) for an explanation.

**Valid function**
```javascript
async function example() {
  const user = await User.findOne();
}
```

**Function which does not result in a database call**
```javascript
async function example() {
  const user = User.findOne();
}
```

This call to `User.findOne()` will simplky return a Mongoose object, rather than the data from the database.

**Invalid user of await**
```javascript
async function example() {
  setTimeout(function () {
    const user = await User.findOne();
  })
}
```

This will result in a syntax error, since the function labeled `async` is not the immediate surrounding function. The `setTimeout` function is the immediate surrounding function. To make this valid, it would need to be rewritten like this:

```javascript
function example() {
  setTimeout(async function () {
    const user = await User.findOne();
  })
}
```

## Making Async

## Creating Users of Each Type

Helper functions exist to create users of each type.

```javascript
async function() {
  // Create admin user
  await test.createAdminUser();
  // Create company and corporate admin user
  await test.createCompanyAndCorporateAdminUser();
  // Create store and manager user
  await test.createStoreAndManager();
  // Create an employee user attached to a store
  await test.createEmployee();
}
```

## Logging in Users and Making Requests To Endpoints Which Require A Logged In User

After users exist in the database, you may login users using the following helper function:

```javascript
async function() {
  await test.loginUserSaveToken(request, 'admin');
}
```

After logging in a user, the token for that user is stored in the `tokens` object in `tests/helpers.js`. It can be used as follows:

Complete example:

```javascript
import {
  initDb,
  createAdminUser,
  createCompanyAndCorporateAdminUser,
  createStoreAndManager,
  createEmployee,
  loginUserSaveToken,
  credentials,
  tokens,
} from '../../tests/helpers';
import app from '../../app';

import TestHelper from '../tests/helpers';
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
  
...

  it('should accept the admin token when making a request', async function () {
    // Login the admin user
    await test.loginUserSaveToken('admin');
    // Make a request to an endpoint which requires an admin token
    return await test.request
    .post('/api/admin/systemTime')
    .set('Authorization', `bearer ${tokens.admin}`)
    .then(res => {
      expect(res).to.have.status(200);
    });
  });
});
```

## Running a Specific Test Case

When working on a specific test case or a specific feature, it might make sense to run only the relevant test case instead of running the entire test suite, every time you make some changes. In that case, we can tell Mocha to run just that particular test case by calling the run test command like the following:

```
TEST=company npm run test
```

In the example above, Mocha will only run the test cases that match the phrase `company` in any part of the filename. So, `api/company/company.controller.test.js` would run, but `api/card/card.controller.test.js` would not.

When you're done making sure that all the tests in the test case are passing, don't forget to still run the entire test suite to make sure you didn't break anything.

## Misc

* When comparing object IDs, you must call `toString()` on the object ID. Otherwise, the comparison will fail. This is because an objectId from a Mongoose model is actually an object, not a string. Converting to a string will cause the test to pass:
```javascript
async function compareIdsBadly() {
  const card1 = await Card.findOne();
  const card2 = await Card.findOne();
  expect(card1._id).to.be.equal(card2._id); // This will fail
}

async function compareIdsCorrectly() {
  const card1 = await Card.findOne();
  const card2 = await Card.findOne();
  expect(card1._id.toString()).to.be.equal(card2._id.toString()); // This will pass
}
```
