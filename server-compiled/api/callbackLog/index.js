'use strict';

var _validation = require('../../helpers/validation');

var _validationRules = require('./validationRules');

var _validationRules2 = _interopRequireDefault(_validationRules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var controller = require('./callbackLog.controller');
var auth = require('../auth/auth.service');


var router = express.Router();

// Get all callback logs
router.get('/', auth.isAuthenticated(), controller.getCallbacksInDateRange);
// Force re-run of callbacks which have already been sent based on a list
router.post('/reFire/:callbackType/list', auth.isAuthenticated(), controller.refireCallbackFromList);
// Re-run callbacks for a card which should have been sent but weren't
router.post('/reFire/:cardId/:callbackType', auth.isAuthenticated(true, _validationRules2.default), controller.reFireCallback);
// Re-run callbacks for a card which should have been sent but weren't
router.post('/fireAll/:companyId', auth.isAuthenticated(true, _validationRules2.default), controller.fireAllCallbacks);
// Get callback logs for a time range
router.get('/:begin/:end', auth.isAuthenticated(true, _validationRules2.default), controller.getCallbacksInDateRange);

module.exports = router;

// db.inventories.find({company: c._id, 'transaction.callbacks': 'cqPaymentInitiated'}).limit(5).forEach(function (i) {c = db.cards.findOne({_id: i.card});print(c._id);})

/*
 596bc1bfb0447615186a82dc,
 596bc1f9b0447615186a82e1,
 596bc62dbc6d910eccd570a6,
 596bd202bc6d910eccd570aa,
 596bd6cabc6d910eccd570ae
 */
//# sourceMappingURL=index.js.map
