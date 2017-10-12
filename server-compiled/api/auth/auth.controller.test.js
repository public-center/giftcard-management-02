'use strict';

var _chai = require('chai');

var _helpers = require('../../tests/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var test = new _helpers2.default();

describe('auth.controller.js', function () {
  // Clear out DB
  test.initDb();
  // Init test users
  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return test.createAdminUser();

          case 2:
            _context.next = 4;
            return test.createCompanyAndCorporateAdminUser();

          case 4:
            _context.next = 6;
            return test.createStoreAndManager();

          case 6:
            _context.next = 8;
            return test.createEmployee();

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));

  it("should require username", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return test.request.post('/api/auth/local').catch(function (err) {
              (0, _chai.expect)(err.response.body).to.have.property('message');
              (0, _chai.expect)(err.response.body.message).to.be.equal('Missing credentials');
            });

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));

  it('should require password', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return test.request.post('/api/auth/local').send({ email: 'fake@fake.com' }).catch(function (err) {
              (0, _chai.expect)(err.response.body).to.have.property('message');
              (0, _chai.expect)(err.response.body.message).to.be.equal('Missing credentials');
            });

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));

  it('should reject the login request if a user does not exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return test.request.post('/api/auth/local').send({ email: 'fake@fake.com', password: 'fake' }).catch(function (err) {
              (0, _chai.expect)(err.response.body).to.have.property('message');
              (0, _chai.expect)(err.response.body.message).to.be.equal('This email is not registered.');
            });

          case 2:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));

  it('should reject the login request if the wrong password is given for a user that does exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return test.request.post('/api/auth/local').send({ email: test.credentials.admin1.email, password: 'fake' }).catch(function (err) {
              (0, _chai.expect)(err.response.body).to.have.property('message');
              (0, _chai.expect)(err.response.body.message).to.be.equal('This password is not correct.');
            });

          case 2:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));

  it('should return a valid token once the admin user logs in', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return test.request.post('/api/auth/local').send({ email: test.credentials.admin1.email, password: test.credentials.admin1.password }).then(function (res) {
              (0, _chai.expect)(res).to.have.status(200);
              (0, _chai.expect)(res.body.token).to.not.be.empty;
            });

          case 2:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));

  it('should return a valid token once the corporate admin user logs in', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return test.request.post('/api/auth/local').send({ email: test.credentials.corporateAdmin1.email, password: test.credentials.corporateAdmin1.password }).then(function (res) {
              (0, _chai.expect)(res).to.have.status(200);
              (0, _chai.expect)(res.body.token).to.not.be.empty;
            });

          case 2:
            return _context7.abrupt('return', _context7.sent);

          case 3:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  })));

  it('should return a valid token once the manager user logs in', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return test.request.post('/api/auth/local').send({ email: test.credentials.manager1.email, password: test.credentials.manager1.password }).then(function (res) {
              (0, _chai.expect)(res).to.have.status(200);
              (0, _chai.expect)(res.body.token).to.not.be.empty;
            });

          case 2:
            return _context8.abrupt('return', _context8.sent);

          case 3:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  })));

  it('should return a valid token once the employee user logs in', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return test.request.post('/api/auth/local').send({ email: test.credentials.employee1.email, password: test.credentials.employee1.password }).then(function (res) {
              (0, _chai.expect)(res).to.have.status(200);
              (0, _chai.expect)(res.body.token).to.not.be.empty;
            });

          case 2:
            return _context9.abrupt('return', _context9.sent);

          case 3:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  })));

  it('should accept the admin token when making a request', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return test.loginUserSaveToken('admin');

          case 2:
            _context10.next = 4;
            return test.request.post('/api/admin/systemTime').set('Authorization', 'bearer ' + test.tokens.admin1.token).then(function (res) {
              (0, _chai.expect)(res).to.have.status(200);
            });

          case 4:
            return _context10.abrupt('return', _context10.sent);

          case 5:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  })));
});
//# sourceMappingURL=auth.controller.test.js.map
