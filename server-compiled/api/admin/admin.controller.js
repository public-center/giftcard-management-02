'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendAccountingEmail = exports.cleanUpBILogs = exports.sendCallbackFromActivity = exports.fixLqApiCustomerCompany = exports.recalculateTransactions = exports.fixInventoryDuplications = exports.fixBiLogDuplications = exports.setCardStatus = exports.getDenials = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Get denials since the last time reconciliation was closed
 */
var getDenials = exports.getDenials = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var _req$params, _req$params$pageSize, pageSize, _req$params$page, page, begin, end, retailersWithDenials, searchQuery, retailersCount, retailers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, retailer, query, inventoriesThisRetailer, rejectedInventories;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Get the last time reconciliation was closed
            // Check for denials since the reconciliation close
            _req$params = req.params, _req$params$pageSize = _req$params.pageSize, pageSize = _req$params$pageSize === undefined ? 10 : _req$params$pageSize, _req$params$page = _req$params.page, page = _req$params$page === undefined ? 0 : _req$params$page;
            begin = req.params.begin;
            end = req.params.end;

            begin = _moment2.default.utc(begin).startOf('day');
            end = _moment2.default.utc(end).endOf('day');
            retailersWithDenials = [];
            searchQuery = {};


            if (req.query.hasOwnProperty('companyId')) {
              if (req.query.hasOwnProperty('storeId')) {
                searchQuery = {
                  company: req.query.companyId,
                  store: req.query.storeId
                };
              } else {
                searchQuery = {
                  company: req.query.companyId
                };
              }
            } else if (req.query.hasOwnProperty('storeId')) {
              searchQuery = {
                store: req.query.storeId
              };
            }
            searchQuery.created = { $gt: begin.toDate(), $lt: end.toDate() };

            _context.prev = 9;
            _context.next = 12;
            return _retailer2.default.count({});

          case 12:
            retailersCount = _context.sent;
            _context.next = 15;
            return _retailer2.default.find({}).limit(parseInt(pageSize)).skip(parseInt(page) * parseInt(pageSize)).lean();

          case 15:
            retailers = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 19;
            _iterator = retailers[Symbol.iterator]();

          case 21:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 37;
              break;
            }

            retailer = _step.value;
            query = Object.assign({}, searchQuery);

            query.retailer = retailer._id;
            _context.next = 27;
            return _inventory4.default.count(query);

          case 27:
            inventoriesThisRetailer = _context.sent;

            query.rejected = true;
            _context.next = 31;
            return _inventory4.default.count(query);

          case 31:
            rejectedInventories = _context.sent;

            if (inventoriesThisRetailer && rejectedInventories) {
              retailer['percentOfDenials'] = rejectedInventories / inventoriesThisRetailer * 100;
            } else {
              retailer['percentOfDenials'] = 0;
            }
            retailersWithDenials.push(retailer);

          case 34:
            _iteratorNormalCompletion = true;
            _context.next = 21;
            break;

          case 37:
            _context.next = 43;
            break;

          case 39:
            _context.prev = 39;
            _context.t0 = _context['catch'](19);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 43:
            _context.prev = 43;
            _context.prev = 44;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 46:
            _context.prev = 46;

            if (!_didIteratorError) {
              _context.next = 49;
              break;
            }

            throw _iteratorError;

          case 49:
            return _context.finish(46);

          case 50:
            return _context.finish(43);

          case 51:
            return _context.abrupt('return', res.json({
              data: retailersWithDenials,
              total: retailersCount
            }));

          case 54:
            _context.prev = 54;
            _context.t1 = _context['catch'](9);

            console.log('********************ERR IN ADMIN GETDENIALS***********************');
            console.log(_context.t1);
            return _context.abrupt('return', res.status(500).json({ err: _context.t1 }));

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[9, 54], [19, 39, 43, 51], [44,, 46, 50]]);
  }));

  return function getDenials(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Set card statuses
 */


var setCardStatus = exports.setCardStatus = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _inventory4.default.update({
              _id: {
                $in: req.body.cardIds
              }
            }, {
              $set: {
                activityStatus: req.body.status
              }
            }, { multi: true });

          case 3:
            res.json({});
            _context2.next = 12;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2['catch'](0);

            console.log('**************ERR IN SET CARD STATUS**********');

            _context2.next = 11;
            return _errorLog2.default.create({
              method: 'setCardStatus',
              controller: 'admin.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context2.t0.stack,
              error: _context2.t0,
              user: req.user._id
            });

          case 11:
            return _context2.abrupt('return', res.json({
              invalid: 'An error has occurred.'
            }));

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 6]]);
  }));

  return function setCardStatus(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Recreate rejection history
 */


var getInventory = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(cardId) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt('return', _inventory4.default.findOne({ card: cardId }));

          case 1:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function getInventory(_x6) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Fix BI log duplications
 * @return {Promise.<void>}
 */


var fixBiLogDuplications = exports.fixBiLogDuplications = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var duplicateLogs, allLogs, logs, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, log, key, dup;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            duplicateLogs = {};
            allLogs = {};
            logs = void 0;
            _context5.next = 5;
            return _biRequestLog2.default.find({}).sort({ created: -1 });

          case 5:
            logs = _context5.sent;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context5.prev = 9;

            for (_iterator2 = logs[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              log = _step2.value;
              key = log.retailerId.toString() + '.' + log.number + '.' + log.pin;
              // Duplicate

              if (allLogs[key]) {
                // Duplicate already exists in structure
                if (duplicateLogs[key]) {
                  duplicateLogs[key].push(log._id);
                  // First duplicate instance, push duplicate and original
                } else {
                  duplicateLogs[key] = [log._id];
                }
              } else {
                allLogs[key] = log._id;
              }
            }
            // Remove duplicates
            _context5.next = 17;
            break;

          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5['catch'](9);
            _didIteratorError2 = true;
            _iteratorError2 = _context5.t0;

          case 17:
            _context5.prev = 17;
            _context5.prev = 18;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 20:
            _context5.prev = 20;

            if (!_didIteratorError2) {
              _context5.next = 23;
              break;
            }

            throw _iteratorError2;

          case 23:
            return _context5.finish(20);

          case 24:
            return _context5.finish(17);

          case 25:
            _context5.t1 = regeneratorRuntime.keys(duplicateLogs);

          case 26:
            if ((_context5.t2 = _context5.t1()).done) {
              _context5.next = 32;
              break;
            }

            dup = _context5.t2.value;
            _context5.next = 30;
            return _biRequestLog2.default.remove({
              _id: { $in: duplicateLogs[dup] }
            });

          case 30:
            _context5.next = 26;
            break;

          case 32:
            return _context5.abrupt('return', res.json({}));

          case 33:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[9, 13, 17, 25], [18,, 20, 24]]);
  }));

  return function fixBiLogDuplications(_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Calculate an inventory's "completeness" score
 * @param inventory
 * @return {number}
 */


/**
 * Fix inventory duplications (find multiple inventories which apply to the same card)
 */
var fixInventoryDuplications = exports.fixInventoryDuplications = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var inventories, cards, duplicates, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, inventory, inventoriesToDelete, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _ref7, _ref8, id, _inventories, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _ref11, _ref12, index, _inventory, score, inventoryValues, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _ref9, _ref10, cardId, inventoryWeightTuples, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, tuple, allZeroValues, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _tuple, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _tuple2, count, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, _inventory2;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _inventory4.default.find({ created: { $gt: new Date('2017-06-01') } });

          case 2:
            inventories = _context6.sent;
            cards = {};
            duplicates = {};
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context6.prev = 8;

            for (_iterator3 = inventories[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              inventory = _step3.value;

              // First instance
              if (!cards[inventory.card.toString()]) {
                cards[inventory.card.toString()] = inventory;
                // Not first instance
              } else {
                // First duplicate
                if (!duplicates[inventory.card.toString()]) {
                  duplicates[inventory.card.toString()] = [cards[inventory.card.toString()], inventory];
                  // Additional duplicates
                } else {
                  duplicates[inventory.card.toString()].push(inventory);
                }
              }
            }
            _context6.next = 16;
            break;

          case 12:
            _context6.prev = 12;
            _context6.t0 = _context6['catch'](8);
            _didIteratorError3 = true;
            _iteratorError3 = _context6.t0;

          case 16:
            _context6.prev = 16;
            _context6.prev = 17;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 19:
            _context6.prev = 19;

            if (!_didIteratorError3) {
              _context6.next = 22;
              break;
            }

            throw _iteratorError3;

          case 22:
            return _context6.finish(19);

          case 23:
            return _context6.finish(16);

          case 24:
            inventoriesToDelete = {};
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            _context6.prev = 28;
            _iterator4 = Object.entries(duplicates)[Symbol.iterator]();

          case 30:
            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
              _context6.next = 57;
              break;
            }

            _ref7 = _step4.value;
            _ref8 = _slicedToArray(_ref7, 2);
            id = _ref8[0];
            _inventories = _ref8[1];
            _iteratorNormalCompletion6 = true;
            _didIteratorError6 = false;
            _iteratorError6 = undefined;
            _context6.prev = 38;

            for (_iterator6 = _inventories.entries()[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              _ref11 = _step6.value;
              _ref12 = _slicedToArray(_ref11, 2);
              index = _ref12[0];
              _inventory = _ref12[1];

              // Init new comparison, assume it's the first one to delete
              if (!index) {
                inventoriesToDelete[_inventory.card.toString()] = [];
              }

              score = calculateInventoryWeight(_inventory);
              // inventoriesToDelete[inventory.card.toString()].push({score, inventory: inventory._id});

              inventoryValues = {
                '_id': _inventory._id,
                'orderNumber': _inventory.orderNumber,
                'cqAch': _inventory.cqAch,
                'smpAch': _inventory.smpAch,
                'credited': _inventory.credited,
                'rejected': _inventory.rejected,
                'activityStatus': _inventory.activityStatus
              };

              inventoriesToDelete[_inventory.card.toString()].push({ score: score, inventory: inventoryValues });
            }
            _context6.next = 46;
            break;

          case 42:
            _context6.prev = 42;
            _context6.t1 = _context6['catch'](38);
            _didIteratorError6 = true;
            _iteratorError6 = _context6.t1;

          case 46:
            _context6.prev = 46;
            _context6.prev = 47;

            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }

          case 49:
            _context6.prev = 49;

            if (!_didIteratorError6) {
              _context6.next = 52;
              break;
            }

            throw _iteratorError6;

          case 52:
            return _context6.finish(49);

          case 53:
            return _context6.finish(46);

          case 54:
            _iteratorNormalCompletion4 = true;
            _context6.next = 30;
            break;

          case 57:
            _context6.next = 63;
            break;

          case 59:
            _context6.prev = 59;
            _context6.t2 = _context6['catch'](28);
            _didIteratorError4 = true;
            _iteratorError4 = _context6.t2;

          case 63:
            _context6.prev = 63;
            _context6.prev = 64;

            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }

          case 66:
            _context6.prev = 66;

            if (!_didIteratorError4) {
              _context6.next = 69;
              break;
            }

            throw _iteratorError4;

          case 69:
            return _context6.finish(66);

          case 70:
            return _context6.finish(63);

          case 71:
            _iteratorNormalCompletion5 = true;
            _didIteratorError5 = false;
            _iteratorError5 = undefined;
            _context6.prev = 74;
            _iterator5 = Object.entries(inventoriesToDelete)[Symbol.iterator]();

          case 76:
            if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
              _context6.next = 188;
              break;
            }

            _ref9 = _step5.value;
            _ref10 = _slicedToArray(_ref9, 2);
            cardId = _ref10[0];
            inventoryWeightTuples = _ref10[1];

            // Remove those which are marked duplicate
            _iteratorNormalCompletion7 = true;
            _didIteratorError7 = false;
            _iteratorError7 = undefined;
            _context6.prev = 84;
            _iterator7 = inventoryWeightTuples[Symbol.iterator]();

          case 86:
            if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
              _context6.next = 94;
              break;
            }

            tuple = _step7.value;

            if (!(tuple.inventory.orderNumber && tuple.inventory.orderNumber.toLowerCase() === 'duplicate')) {
              _context6.next = 91;
              break;
            }

            _context6.next = 91;
            return _inventory4.default.remove({ _id: tuple.inventory._id });

          case 91:
            _iteratorNormalCompletion7 = true;
            _context6.next = 86;
            break;

          case 94:
            _context6.next = 100;
            break;

          case 96:
            _context6.prev = 96;
            _context6.t3 = _context6['catch'](84);
            _didIteratorError7 = true;
            _iteratorError7 = _context6.t3;

          case 100:
            _context6.prev = 100;
            _context6.prev = 101;

            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }

          case 103:
            _context6.prev = 103;

            if (!_didIteratorError7) {
              _context6.next = 106;
              break;
            }

            throw _iteratorError7;

          case 106:
            return _context6.finish(103);

          case 107:
            return _context6.finish(100);

          case 108:
            // make sure we don't delete all inventories
            allZeroValues = false;
            // Delete all of the 0 scored

            _iteratorNormalCompletion8 = true;
            _didIteratorError8 = false;
            _iteratorError8 = undefined;
            _context6.prev = 112;
            for (_iterator8 = inventoryWeightTuples[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              _tuple = _step8.value;

              if (_tuple.score > 0) {
                allZeroValues = true;
              }
            }
            // If we have a zero value, delete it so long as there are other inventories
            _context6.next = 120;
            break;

          case 116:
            _context6.prev = 116;
            _context6.t4 = _context6['catch'](112);
            _didIteratorError8 = true;
            _iteratorError8 = _context6.t4;

          case 120:
            _context6.prev = 120;
            _context6.prev = 121;

            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }

          case 123:
            _context6.prev = 123;

            if (!_didIteratorError8) {
              _context6.next = 126;
              break;
            }

            throw _iteratorError8;

          case 126:
            return _context6.finish(123);

          case 127:
            return _context6.finish(120);

          case 128:
            if (allZeroValues) {
              _context6.next = 157;
              break;
            }

            _iteratorNormalCompletion9 = true;
            _didIteratorError9 = false;
            _iteratorError9 = undefined;
            _context6.prev = 132;
            _iterator9 = inventoryWeightTuples[Symbol.iterator]();

          case 134:
            if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
              _context6.next = 141;
              break;
            }

            _tuple2 = _step9.value;
            _context6.next = 138;
            return _inventory4.default.remove({ _id: _tuple2.inventory._id });

          case 138:
            _iteratorNormalCompletion9 = true;
            _context6.next = 134;
            break;

          case 141:
            _context6.next = 147;
            break;

          case 143:
            _context6.prev = 143;
            _context6.t5 = _context6['catch'](132);
            _didIteratorError9 = true;
            _iteratorError9 = _context6.t5;

          case 147:
            _context6.prev = 147;
            _context6.prev = 148;

            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }

          case 150:
            _context6.prev = 150;

            if (!_didIteratorError9) {
              _context6.next = 153;
              break;
            }

            throw _iteratorError9;

          case 153:
            return _context6.finish(150);

          case 154:
            return _context6.finish(147);

          case 155:
            _context6.next = 185;
            break;

          case 157:
            count = inventoryWeightTuples.length;
            _iteratorNormalCompletion10 = true;
            _didIteratorError10 = false;
            _iteratorError10 = undefined;
            _context6.prev = 161;
            _iterator10 = inventoryWeightTuples.entries()[Symbol.iterator]();

          case 163:
            if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
              _context6.next = 171;
              break;
            }

            _inventory2 = _step10.value;

            if (!(_inventory2[0] < count)) {
              _context6.next = 168;
              break;
            }

            _context6.next = 168;
            return _inventory4.default.remove({ _id: _inventory2[1].inventory._id });

          case 168:
            _iteratorNormalCompletion10 = true;
            _context6.next = 163;
            break;

          case 171:
            _context6.next = 177;
            break;

          case 173:
            _context6.prev = 173;
            _context6.t6 = _context6['catch'](161);
            _didIteratorError10 = true;
            _iteratorError10 = _context6.t6;

          case 177:
            _context6.prev = 177;
            _context6.prev = 178;

            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }

          case 180:
            _context6.prev = 180;

            if (!_didIteratorError10) {
              _context6.next = 183;
              break;
            }

            throw _iteratorError10;

          case 183:
            return _context6.finish(180);

          case 184:
            return _context6.finish(177);

          case 185:
            _iteratorNormalCompletion5 = true;
            _context6.next = 76;
            break;

          case 188:
            _context6.next = 194;
            break;

          case 190:
            _context6.prev = 190;
            _context6.t7 = _context6['catch'](74);
            _didIteratorError5 = true;
            _iteratorError5 = _context6.t7;

          case 194:
            _context6.prev = 194;
            _context6.prev = 195;

            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }

          case 197:
            _context6.prev = 197;

            if (!_didIteratorError5) {
              _context6.next = 200;
              break;
            }

            throw _iteratorError5;

          case 200:
            return _context6.finish(197);

          case 201:
            return _context6.finish(194);

          case 202:
            return _context6.abrupt('return', res.json({}));

          case 203:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[8, 12, 16, 24], [17,, 19, 23], [28, 59, 63, 71], [38, 42, 46, 54], [47,, 49, 53], [64,, 66, 70], [74, 190, 194, 202], [84, 96, 100, 108], [101,, 103, 107], [112, 116, 120, 128], [121,, 123, 127], [132, 143, 147, 155], [148,, 150, 154], [161, 173, 177, 185], [178,, 180, 184], [195,, 197, 201]]);
  }));

  return function fixInventoryDuplications(_x9, _x10) {
    return _ref6.apply(this, arguments);
  };
}();

/***
 * Recalculate transaction values
 */


var recalculateTransactions = exports.recalculateTransactions = function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res) {
    var _req$body2, inventories, _req$body2$dateBegin, dateBegin, _req$body2$dateEnd, dateEnd, findParams, dbInventories, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, inventory, companyId, companySettings, company;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _req$body2 = req.body, inventories = _req$body2.inventories, _req$body2$dateBegin = _req$body2.dateBegin, dateBegin = _req$body2$dateBegin === undefined ? null : _req$body2$dateBegin, _req$body2$dateEnd = _req$body2.dateEnd, dateEnd = _req$body2$dateEnd === undefined ? null : _req$body2$dateEnd;
            findParams = {};

            if (!inventories) {
              _context7.next = 6;
              break;
            }

            findParams = {
              _id: {
                $in: inventories
              },
              isTransaction: true
            };
            _context7.next = 11;
            break;

          case 6:
            if (!(dateBegin && dateEnd)) {
              _context7.next = 10;
              break;
            }

            findParams = {
              created: {
                $gt: new Date(dateBegin),
                $lt: new Date(dateEnd)
              },
              isTransaction: true
            };
            _context7.next = 11;
            break;

          case 10:
            return _context7.abrupt('return', res.status(400).json({ err: 'inventories or dateBegin and dateEnd are needed' }));

          case 11:
            _context7.prev = 11;
            _context7.next = 14;
            return _inventory4.default.find(findParams).populate('retailer');

          case 14:
            dbInventories = _context7.sent;

            // Redo calculations for each transaction
            _iteratorNormalCompletion11 = true;
            _didIteratorError11 = false;
            _iteratorError11 = undefined;
            _context7.prev = 18;
            _iterator11 = dbInventories[Symbol.iterator]();

          case 20:
            if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
              _context7.next = 38;
              break;
            }

            inventory = _step11.value;
            companyId = inventory.company;
            // Get settings

            _context7.next = 25;
            return _companySettings2.default.findById(companyId);

          case 25:
            companySettings = _context7.sent;

            if (companySettings) {
              _context7.next = 33;
              break;
            }

            _context7.next = 29;
            return _company2.default.findById(companyId);

          case 29:
            company = _context7.sent;
            _context7.next = 32;
            return company.getSettings();

          case 32:
            companySettings = _context7.sent;

          case 33:
            _context7.next = 35;
            return (0, _card3.recalculateTransactionAndReserve)(inventory);

          case 35:
            _iteratorNormalCompletion11 = true;
            _context7.next = 20;
            break;

          case 38:
            _context7.next = 44;
            break;

          case 40:
            _context7.prev = 40;
            _context7.t0 = _context7['catch'](18);
            _didIteratorError11 = true;
            _iteratorError11 = _context7.t0;

          case 44:
            _context7.prev = 44;
            _context7.prev = 45;

            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }

          case 47:
            _context7.prev = 47;

            if (!_didIteratorError11) {
              _context7.next = 50;
              break;
            }

            throw _iteratorError11;

          case 50:
            return _context7.finish(47);

          case 51:
            return _context7.finish(44);

          case 52:
            return _context7.abrupt('return', res.json({}));

          case 55:
            _context7.prev = 55;
            _context7.t1 = _context7['catch'](11);

            console.log('**************ADMIN RECALCULATE TRANSACTION ERROR**********');
            console.log(_context7.t1);

            _context7.next = 61;
            return _errorLog2.default.create({
              method: 'recalculateTransactions',
              controller: 'admin.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context7.t1.stack,
              error: _context7.t1,
              user: req.user._id
            });

          case 61:
            if (!(_context7.t1 instanceof _exceptions.DocumentNotFoundException || _context7.t1 instanceof _exceptions.SellLimitViolationException)) {
              _context7.next = 65;
              break;
            }

            return _context7.abrupt('return', res.status(_context7.t1.code).json({ err: _context7.t1.message }));

          case 65:
            res.status(500).json({ err: 'Unable to recalculate transactions' });

          case 66:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[11, 55], [18, 40, 44, 52], [45,, 47, 51]]);
  }));

  return function recalculateTransactions(_x11, _x12) {
    return _ref13.apply(this, arguments);
  };
}();

/**
 * Update customer rejections or credits
 * @param apiCustomer Default API customer
 * @param customer Correct company customer
 * @param inventory Inventory on wrong customer
 * @param type "rejection" or "credit" or "none"
 * @return {Promise.<*>}
 */


var updateCustomerRejectionCredit = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(apiCustomer, customer, inventory) {
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
    var pullType, multiplier, amountType;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            pullType = 'credits';
            multiplier = 1;
            amountType = 'creditAmount';

            if (type === 'rejection') {
              pullType = 'rejections';
              multiplier = -1;
              amountType = 'rejectAmount';
            }
            // Set customer on inventory
            _context8.next = 6;
            return inventory.update({
              $set: {
                customer: customer._id
              }
            });

          case 6:
            if (!(type === 'none')) {
              _context8.next = 10;
              break;
            }

            return _context8.abrupt('return', Promise.resolve([apiCustomer, customer]));

          case 10:
            if (!(type === 'credit')) {
              _context8.next = 14;
              break;
            }

            // Remove the existing denial payment
            _denialPayment2.default.remove({
              customer: apiCustomer._id,
              amount: inventory[amountType]
            });
            // Add in new denial payment
            _context8.next = 14;
            return _denialPayment2.default.create({
              customer: customer._id,
              amount: inventory[amountType]
            });

          case 14:
            // Update API customer
            apiCustomer[pullType].splice(apiCustomer[pullType].indexOf(inventory._id), 1);
            apiCustomer.rejectionTotal = apiCustomer.rejectionTotal - inventory[amountType] * multiplier;
            _context8.next = 18;
            return apiCustomer.save();

          case 18:
            apiCustomer = _context8.sent;

            // Update correct customer
            customer[pullType].splice(customer[pullType].indexOf(inventory._id, 1));
            customer.rejectionTotal = customer.rejectionTotal - inventory[amountType] * multiplier;
            _context8.next = 23;
            return customer.save();

          case 23:
            customer = _context8.sent;
            return _context8.abrupt('return', Promise.resolve([apiCustomer, customer]));

          case 25:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function updateCustomerRejectionCredit(_x14, _x15, _x16) {
    return _ref14.apply(this, arguments);
  };
}();

/**
 * Change generic API_CUSTOMER to a company specific API customer
 */


var fixLqApiCustomerCompany = exports.fixLqApiCustomerCompany = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(req, res) {
    var ps, apiCustomer, inventories, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, inventory, customer, type, _ref16, _ref17;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return _company2.default.findOne({ name: /posting/i });

          case 2:
            ps = _context9.sent;
            _context9.next = 5;
            return _customer2.default.find(Object.assign({}, _lq.lqCustomerFind, { $or: [{ company: { $exists: false } }, { company: ps._id }] }));

          case 5:
            apiCustomer = _context9.sent;

            if (!(apiCustomer.length > 1)) {
              _context9.next = 8;
              break;
            }

            return _context9.abrupt('return', res.status(400).json({ err: 'Already run' }));

          case 8:
            apiCustomer = apiCustomer[0];
            // Found customer

            if (!apiCustomer) {
              _context9.next = 16;
              break;
            }

            if (apiCustomer.company) {
              _context9.next = 14;
              break;
            }

            apiCustomer.company = ps._id;
            _context9.next = 14;
            return apiCustomer.save();

          case 14:
            _context9.next = 17;
            break;

          case 16:
            return _context9.abrupt('return', res.status(400).json({ err: 'Unable to find API customer' }));

          case 17:
            _context9.next = 19;
            return _inventory4.default.find({ customer: apiCustomer._id, company: { $ne: ps._id } });

          case 19:
            inventories = _context9.sent;


            // Find inventories which do not belong to PS
            _iteratorNormalCompletion12 = true;
            _didIteratorError12 = false;
            _iteratorError12 = undefined;
            _context9.prev = 23;
            _iterator12 = inventories[Symbol.iterator]();

          case 25:
            if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
              _context9.next = 46;
              break;
            }

            inventory = _step12.value;

            if (!(inventory.company.toString() !== ps._id.toString())) {
              _context9.next = 43;
              break;
            }

            _context9.next = 30;
            return _customer2.default.findOne((0, _lq.apiCustomerValues)(inventory.company));

          case 30:
            customer = _context9.sent;

            if (customer) {
              _context9.next = 35;
              break;
            }

            _context9.next = 34;
            return _customer2.default.create((0, _lq.apiCustomerValues)(inventory.company));

          case 34:
            customer = _context9.sent;

          case 35:
            type = 'none';

            if (inventory.credited || inventory.rejected) {
              type = inventory.credited ? 'credit' : 'rejection';
            }
            // See if this inventory has rejections/credits that need to be moved
            _context9.next = 39;
            return updateCustomerRejectionCredit(apiCustomer, customer, inventory, type);

          case 39:
            _ref16 = _context9.sent;
            _ref17 = _slicedToArray(_ref16, 2);
            apiCustomer = _ref17[0];
            customer = _ref17[1];

          case 43:
            _iteratorNormalCompletion12 = true;
            _context9.next = 25;
            break;

          case 46:
            _context9.next = 52;
            break;

          case 48:
            _context9.prev = 48;
            _context9.t0 = _context9['catch'](23);
            _didIteratorError12 = true;
            _iteratorError12 = _context9.t0;

          case 52:
            _context9.prev = 52;
            _context9.prev = 53;

            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }

          case 55:
            _context9.prev = 55;

            if (!_didIteratorError12) {
              _context9.next = 58;
              break;
            }

            throw _iteratorError12;

          case 58:
            return _context9.finish(55);

          case 59:
            return _context9.finish(52);

          case 60:
            return _context9.abrupt('return', res.json({}));

          case 61:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[23, 48, 52, 60], [53,, 55, 59]]);
  }));

  return function fixLqApiCustomerCompany(_x17, _x18) {
    return _ref15.apply(this, arguments);
  };
}();

/**
 * Send a cqPaymentInitiated callback for each inventory specified in the request body
 */


var sendCallbackFromActivity = exports.sendCallbackFromActivity = function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var _req$body3, inventories, _req$body3$type, type, _req$body3$force, force, types, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, inventory, dbInventory, card, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, thisType;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _req$body3 = req.body, inventories = _req$body3.inventories, _req$body3$type = _req$body3.type, type = _req$body3$type === undefined ? 'cqPaymentInitiated' : _req$body3$type, _req$body3$force = _req$body3.force, force = _req$body3$force === undefined ? false : _req$body3$force;
            types = [];

            if (type === 'denial') {
              types = ['denial', 'credit'];
            } else {
              types = [type];
            }

            _iteratorNormalCompletion13 = true;
            _didIteratorError13 = false;
            _iteratorError13 = undefined;
            _context10.prev = 6;
            _iterator13 = inventories[Symbol.iterator]();

          case 8:
            if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
              _context10.next = 44;
              break;
            }

            inventory = _step13.value;
            _context10.next = 12;
            return _inventory4.default.findById(inventory).populate('card');

          case 12:
            dbInventory = _context10.sent;
            card = Object.assign({}, dbInventory.card.toObject());

            card.inventory = dbInventory.toObject();
            _iteratorNormalCompletion14 = true;
            _didIteratorError14 = false;
            _iteratorError14 = undefined;
            _context10.prev = 18;
            _iterator14 = types[Symbol.iterator]();

          case 20:
            if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
              _context10.next = 27;
              break;
            }

            thisType = _step14.value;
            _context10.next = 24;
            return (0, _callbackLog.resendCallback)(null, card, thisType, force);

          case 24:
            _iteratorNormalCompletion14 = true;
            _context10.next = 20;
            break;

          case 27:
            _context10.next = 33;
            break;

          case 29:
            _context10.prev = 29;
            _context10.t0 = _context10['catch'](18);
            _didIteratorError14 = true;
            _iteratorError14 = _context10.t0;

          case 33:
            _context10.prev = 33;
            _context10.prev = 34;

            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }

          case 36:
            _context10.prev = 36;

            if (!_didIteratorError14) {
              _context10.next = 39;
              break;
            }

            throw _iteratorError14;

          case 39:
            return _context10.finish(36);

          case 40:
            return _context10.finish(33);

          case 41:
            _iteratorNormalCompletion13 = true;
            _context10.next = 8;
            break;

          case 44:
            _context10.next = 50;
            break;

          case 46:
            _context10.prev = 46;
            _context10.t1 = _context10['catch'](6);
            _didIteratorError13 = true;
            _iteratorError13 = _context10.t1;

          case 50:
            _context10.prev = 50;
            _context10.prev = 51;

            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }

          case 53:
            _context10.prev = 53;

            if (!_didIteratorError13) {
              _context10.next = 56;
              break;
            }

            throw _iteratorError13;

          case 56:
            return _context10.finish(53);

          case 57:
            return _context10.finish(50);

          case 58:
            return _context10.abrupt('return', res.json({}));

          case 59:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this, [[6, 46, 50, 58], [18, 29, 33, 41], [34,, 36, 40], [51,, 53, 57]]);
  }));

  return function sendCallbackFromActivity(_x19, _x20) {
    return _ref18.apply(this, arguments);
  };
}();

/**
 * Retrieve card from log
 * @param log
 * @return {Promise.<*>}
 */


var getCardFromBiLog = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(log) {
    var findParams;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            findParams = {};

            if (log.card) {
              findParams.card = log.card;
            } else {
              findParams = {
                retailer: log.retailer,
                number: log.number
              };
              if (log.pin) {
                findParams.pin = log.pin;
              }
            }
            _context11.next = 4;
            return _card2.default.findOne(findParams);

          case 4:
            return _context11.abrupt('return', _context11.sent);

          case 5:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function getCardFromBiLog(_x21) {
    return _ref19.apply(this, arguments);
  };
}();

/**
 * Clean up BI logs with the following logic:
 *
 * First, check for any duplicates. If duplicates were found, we'd prioritise
 * the ones that have verifiedBalance set, followed by the date they were created.
 * Any duplicates that don't have responseCode will be deleted.
 * Lastly, delete any remaining logs that have no responseCode, even if they're not duplicates.
 */


var cleanUpBILogs = exports.cleanUpBILogs = function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(req, res) {
    var _this2 = this;

    var dupes, hasMultipleCards, hasNoCards, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, dupe, card, logs, hasValidLog, numValid, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, log, hasPrefix, numPrefix, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _log, indexWithCards, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, _ref21, _ref22, index, _log2, numKeep, _loop, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, _log3, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, _ref23, _ref24, _index, _log4;

    return regeneratorRuntime.wrap(function _callee12$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            _context13.next = 3;
            return _biRequestLog2.default.remove({ created: { $lt: new Date('2017-07-01') } });

          case 3:
            _context13.next = 5;
            return _biRequestLog2.default.aggregate([{
              $group: {
                _id: { number: "$number", retailerId: "$retailerId" },
                count: { $sum: 1 },
                biRequestLogs: { $push: "$$ROOT" }
              }
            }, {
              $match: { count: { $gt: 1 } }
            }]);

          case 5:
            dupes = _context13.sent;
            hasMultipleCards = 0;
            hasNoCards = 0;
            _iteratorNormalCompletion15 = true;
            _didIteratorError15 = false;
            _iteratorError15 = undefined;
            _context13.prev = 11;
            _iterator15 = dupes[Symbol.iterator]();

          case 13:
            if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
              _context13.next = 166;
              break;
            }

            dupe = _step15.value;
            card = void 0;
            logs = dupe.biRequestLogs.sort(function (a, b) {
              // Sort by date
              if (a.created === b.created) {
                return 0;
              }
              return a.created < b.created ? 1 : -1;
            });
            hasValidLog = false;
            numValid = 0;
            // Make sure any group that requires PINs doesn't have multiple results

            _iteratorNormalCompletion16 = true;
            _didIteratorError16 = false;
            _iteratorError16 = undefined;
            _context13.prev = 22;
            _iterator16 = logs[Symbol.iterator]();

          case 24:
            if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
              _context13.next = 32;
              break;
            }

            log = _step16.value;

            if (!_environment.retailersNoPin[log.retailerId.toString()]) {
              _context13.next = 28;
              break;
            }

            return _context13.abrupt('break', 32);

          case 28:
            if (typeof log.balance === 'number' && !(log.balance === 0 && log.responseCode !== _environment.biCodes.invalid)) {
              hasValidLog = true;
              numValid++;
            }

          case 29:
            _iteratorNormalCompletion16 = true;
            _context13.next = 24;
            break;

          case 32:
            _context13.next = 38;
            break;

          case 34:
            _context13.prev = 34;
            _context13.t0 = _context13['catch'](22);
            _didIteratorError16 = true;
            _iteratorError16 = _context13.t0;

          case 38:
            _context13.prev = 38;
            _context13.prev = 39;

            if (!_iteratorNormalCompletion16 && _iterator16.return) {
              _iterator16.return();
            }

          case 41:
            _context13.prev = 41;

            if (!_didIteratorError16) {
              _context13.next = 44;
              break;
            }

            throw _iteratorError16;

          case 44:
            return _context13.finish(41);

          case 45:
            return _context13.finish(38);

          case 46:
            if (hasValidLog && numValid > 1) {
              console.log('**************NUM VALID**********');
              console.log(numValid);
              console.log(logs);
            }
            // Make sure any group doesn't have multiple prefixes
            hasPrefix = false;
            numPrefix = 0;
            _iteratorNormalCompletion17 = true;
            _didIteratorError17 = false;
            _iteratorError17 = undefined;
            _context13.prev = 52;

            for (_iterator17 = logs[Symbol.iterator](); !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
              _log = _step17.value;

              if (_log.prefix) {
                hasPrefix = true;
                numPrefix++;
              }
            }
            _context13.next = 60;
            break;

          case 56:
            _context13.prev = 56;
            _context13.t1 = _context13['catch'](52);
            _didIteratorError17 = true;
            _iteratorError17 = _context13.t1;

          case 60:
            _context13.prev = 60;
            _context13.prev = 61;

            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }

          case 63:
            _context13.prev = 63;

            if (!_didIteratorError17) {
              _context13.next = 66;
              break;
            }

            throw _iteratorError17;

          case 66:
            return _context13.finish(63);

          case 67:
            return _context13.finish(60);

          case 68:
            if (hasPrefix) {
              console.log('**************HAS PREFIX**********');
              console.log(numPrefix);
            }
            // Find the ones with cards attached
            indexWithCards = [];
            _iteratorNormalCompletion18 = true;
            _didIteratorError18 = false;
            _iteratorError18 = undefined;
            _context13.prev = 73;
            _iterator18 = logs.entries()[Symbol.iterator]();

          case 75:
            if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
              _context13.next = 87;
              break;
            }

            _ref21 = _step18.value;
            _ref22 = _slicedToArray(_ref21, 2);
            index = _ref22[0];
            _log2 = _ref22[1];
            _context13.next = 82;
            return getCardFromBiLog(_log2);

          case 82:
            card = _context13.sent;

            if (card) {
              indexWithCards.push(index);
            }

          case 84:
            _iteratorNormalCompletion18 = true;
            _context13.next = 75;
            break;

          case 87:
            _context13.next = 93;
            break;

          case 89:
            _context13.prev = 89;
            _context13.t2 = _context13['catch'](73);
            _didIteratorError18 = true;
            _iteratorError18 = _context13.t2;

          case 93:
            _context13.prev = 93;
            _context13.prev = 94;

            if (!_iteratorNormalCompletion18 && _iterator18.return) {
              _iterator18.return();
            }

          case 96:
            _context13.prev = 96;

            if (!_didIteratorError18) {
              _context13.next = 99;
              break;
            }

            throw _iteratorError18;

          case 99:
            return _context13.finish(96);

          case 100:
            return _context13.finish(93);

          case 101:
            if (!indexWithCards.length) {
              hasNoCards++;
            } else if (indexWithCards.length > 1) {
              hasMultipleCards++;
            } else {
              hasNoCards++;
            }
            // logs = logs.map(log => log.toObject());
            /**
             * Now that we know we have a steady set, find the ones to delete
             * @type {Array}
             */
            // keep logs with a balance, if only one has a balance
            logs = logs.map(function (log) {
              if (typeof log.balance === 'number' && log.balance > 0) {
                log.keep = true;
              }
              return log;
            });
            numKeep = logs.filter(function (log) {
              return log.keep;
            });

            if (!(numKeep === 1)) {
              _context13.next = 131;
              break;
            }

            _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop(_log3) {
              return regeneratorRuntime.wrap(function _loop$(_context12) {
                while (1) {
                  switch (_context12.prev = _context12.next) {
                    case 0:
                      if (_log3.keep) {
                        _context12.next = 4;
                        break;
                      }

                      _context12.next = 3;
                      return _biRequestLog2.default.remove({ _id: _log3._id });

                    case 3:
                      logs = logs.filter(function (thisLog) {
                        return thisLog._id.toString() !== _log3._id.toString();
                      });

                    case 4:
                    case 'end':
                      return _context12.stop();
                  }
                }
              }, _loop, _this2);
            });
            _iteratorNormalCompletion19 = true;
            _didIteratorError19 = false;
            _iteratorError19 = undefined;
            _context13.prev = 109;
            _iterator19 = logs[Symbol.iterator]();

          case 111:
            if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
              _context13.next = 117;
              break;
            }

            _log3 = _step19.value;
            return _context13.delegateYield(_loop(_log3), 't3', 114);

          case 114:
            _iteratorNormalCompletion19 = true;
            _context13.next = 111;
            break;

          case 117:
            _context13.next = 123;
            break;

          case 119:
            _context13.prev = 119;
            _context13.t4 = _context13['catch'](109);
            _didIteratorError19 = true;
            _iteratorError19 = _context13.t4;

          case 123:
            _context13.prev = 123;
            _context13.prev = 124;

            if (!_iteratorNormalCompletion19 && _iterator19.return) {
              _iterator19.return();
            }

          case 126:
            _context13.prev = 126;

            if (!_didIteratorError19) {
              _context13.next = 129;
              break;
            }

            throw _iteratorError19;

          case 129:
            return _context13.finish(126);

          case 130:
            return _context13.finish(123);

          case 131:
            if (!(logs.length === 1)) {
              _context13.next = 133;
              break;
            }

            return _context13.abrupt('continue', 163);

          case 133:
            // If we still have logs, remove all but the most recent
            _iteratorNormalCompletion20 = true;
            _didIteratorError20 = false;
            _iteratorError20 = undefined;
            _context13.prev = 136;
            _iterator20 = logs.entries()[Symbol.iterator]();

          case 138:
            if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
              _context13.next = 149;
              break;
            }

            _ref23 = _step20.value;
            _ref24 = _slicedToArray(_ref23, 2);
            _index = _ref24[0];
            _log4 = _ref24[1];

            if (!_index) {
              _context13.next = 146;
              break;
            }

            _context13.next = 146;
            return _biRequestLog2.default.remove({ _id: _log4._id });

          case 146:
            _iteratorNormalCompletion20 = true;
            _context13.next = 138;
            break;

          case 149:
            _context13.next = 155;
            break;

          case 151:
            _context13.prev = 151;
            _context13.t5 = _context13['catch'](136);
            _didIteratorError20 = true;
            _iteratorError20 = _context13.t5;

          case 155:
            _context13.prev = 155;
            _context13.prev = 156;

            if (!_iteratorNormalCompletion20 && _iterator20.return) {
              _iterator20.return();
            }

          case 158:
            _context13.prev = 158;

            if (!_didIteratorError20) {
              _context13.next = 161;
              break;
            }

            throw _iteratorError20;

          case 161:
            return _context13.finish(158);

          case 162:
            return _context13.finish(155);

          case 163:
            _iteratorNormalCompletion15 = true;
            _context13.next = 13;
            break;

          case 166:
            _context13.next = 172;
            break;

          case 168:
            _context13.prev = 168;
            _context13.t6 = _context13['catch'](11);
            _didIteratorError15 = true;
            _iteratorError15 = _context13.t6;

          case 172:
            _context13.prev = 172;
            _context13.prev = 173;

            if (!_iteratorNormalCompletion15 && _iterator15.return) {
              _iterator15.return();
            }

          case 175:
            _context13.prev = 175;

            if (!_didIteratorError15) {
              _context13.next = 178;
              break;
            }

            throw _iteratorError15;

          case 178:
            return _context13.finish(175);

          case 179:
            return _context13.finish(172);

          case 180:
            return _context13.abrupt('return', res.json({}));

          case 183:
            _context13.prev = 183;
            _context13.t7 = _context13['catch'](0);

            console.log('***************************ERR IN CLEANUPBILOGS***************************');
            console.log(_context13.t7);

            _context13.next = 189;
            return _errorLog2.default.create({
              method: 'cleanUpBILogs',
              controller: 'admin.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context13.t7.stack,
              error: _context13.t7,
              user: req.user._id
            });

          case 189:
            return _context13.abrupt('return', res.status(500).json({
              invalid: 'An error has occurred.'
            }));

          case 190:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee12, this, [[0, 183], [11, 168, 172, 180], [22, 34, 38, 46], [39,, 41, 45], [52, 56, 60, 68], [61,, 63, 67], [73, 89, 93, 101], [94,, 96, 100], [109, 119, 123, 131], [124,, 126, 130], [136, 151, 155, 163], [156,, 158, 162], [173,, 175, 179]]);
  }));

  return function cleanUpBILogs(_x22, _x23) {
    return _ref20.apply(this, arguments);
  };
}();

/**
 * Sends an email
 */


var sendAccountingEmail = exports.sendAccountingEmail = function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(req, res) {
    var _this3 = this;

    var companyId, _req$body4, emailSubject, emailBody, company, emails, recipients;

    return regeneratorRuntime.wrap(function _callee14$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            companyId = req.params.companyId;
            _req$body4 = req.body, emailSubject = _req$body4.emailSubject, emailBody = _req$body4.emailBody;
            _context15.next = 4;
            return _company2.default.findById(companyId);

          case 4:
            company = _context15.sent;
            emails = company.bookkeepingEmails.split(',');
            recipients = [];

            emails.forEach(function (email) {
              if (email.trim().length) {
                recipients.push(email.trim());
              }
            });

            if (!recipients.length) {
              _context15.next = 21;
              break;
            }

            _context15.prev = 9;

            _mailer2.default.sendAccountingEmail(recipients, emailSubject, emailBody, function () {
              var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(err) {
                return regeneratorRuntime.wrap(function _callee13$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        if (err) {
                          _context14.next = 4;
                          break;
                        }

                        return _context14.abrupt('return', res.json({}));

                      case 4:
                        console.log('**************************ERR IN SENDEMAILS**************************');
                        console.log(err);
                        console.log(err.response.body.errors);

                        _context14.next = 9;
                        return _errorLog2.default.create({
                          method: 'sendAccountingEmail',
                          controller: 'admin.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 9:
                        return _context14.abrupt('return', res.status(500).json({
                          invalid: 'An error has occurred.'
                        }));

                      case 10:
                      case 'end':
                        return _context14.stop();
                    }
                  }
                }, _callee13, _this3);
              }));

              return function (_x26) {
                return _ref26.apply(this, arguments);
              };
            }());
            _context15.next = 20;
            break;

          case 13:
            _context15.prev = 13;
            _context15.t0 = _context15['catch'](9);

            console.log('**************************ERR IN SENDEMAILS**************************');
            console.log(_context15.t0);

            _context15.next = 19;
            return _errorLog2.default.create({
              method: 'sendAccountingEmail',
              controller: 'admin.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context15.t0.stack,
              error: _context15.t0,
              user: req.user._id
            });

          case 19:
            return _context15.abrupt('return', res.status(500).json({
              invalid: 'An error has occurred.'
            }));

          case 20:
            return _context15.abrupt('return');

          case 21:
            return _context15.abrupt('return', res.json({}));

          case 22:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee14, this, [[9, 13]]);
  }));

  return function sendAccountingEmail(_x24, _x25) {
    return _ref25.apply(this, arguments);
  };
}();

exports.recreateRejectionHistory = recreateRejectionHistory;
exports.addDeduction = addDeduction;
exports.systemTime = systemTime;
exports.testCallback = testCallback;

require('../company/autoBuyRate.model');

var _companySettings = require('../company/companySettings.model');

var _companySettings2 = _interopRequireDefault(_companySettings);

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

require('../stores/store.model');

require('../reserve/reserve.model');

var _inventory3 = require('../inventory/inventory.model');

var _inventory4 = _interopRequireDefault(_inventory3);

var _denialPayment = require('../denialPayment/denialPayment.model');

var _denialPayment2 = _interopRequireDefault(_denialPayment);

var _biRequestLog = require('../biRequestLog/biRequestLog.model');

var _biRequestLog2 = _interopRequireDefault(_biRequestLog);

var _customer = require('../customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _retailer = require('../retailer/retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _card3 = require('../card/card.helpers');

var _exceptions = require('../../exceptions/exceptions');

var _callbackLog = require('../callbackLog/callbackLog.controller');

var _lq = require('../lq/lq.controller');

var _environment = require('../../config/environment');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validation = require('../../helpers/validation');

var _mailer = require('../mailer');

var _mailer2 = _interopRequireDefault(_mailer);

var _errors = require('../../helpers/errors');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function recreateRejectionHistory(req, res) {
  _denialPayment2.default.find({}).then(function (denialPayments) {
    var promises = [];
    denialPayments.forEach(function (denial) {
      promises.push(denial.remove());
    });
    return Promise.all(promises);
  }).then(function () {
    return _inventory4.default.find({
      rejected: true
    }).populate('customer');
  }).then(function (inventories) {
    var promises = [];
    inventories.forEach(function (inventory) {
      // Update rejection amounts
      var buyAmount = inventory.buyAmount;
      // Buy amount after adjustment
      var realBuyAmount = inventory.buyRate * inventory.verifiedBalance;
      if (realBuyAmount < buyAmount) {
        var rejectAmount = buyAmount - realBuyAmount;
        // Set rejected
        inventory.rejectedDate = Date.now();
        inventory.rejectAmount = rejectAmount;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  }).then(function (inventories) {
    var customers = {};
    inventories.forEach(function (inventory) {
      // Create collection of customers with inventories
      if (!customers[inventory.customer._id]) {
        customers[inventory.customer._id] = {
          inventories: [],
          rejectionTotal: 0,
          customer: inventory.customer
        };
      }
      customers[inventory.customer._id].inventories.push(inventory);
    });
    return customers;
  }).then(function (customers) {
    var promises = [];
    _lodash2.default.forEach(customers, function (customer) {
      customer.rejectionTotal = customer.inventories.reduce(function (curr, next) {
        return curr + next.rejectAmount;
      }, 0);
      var currentRejectionTotal = 0;
      // Get current reject value
      try {
        if (_lodash2.default.isNumber(currentRejectionTotal)) {
          currentRejectionTotal = customer.customer.rejectionTotal;
        }
      } catch (e) {
        currentRejectionTotal = 0;
      }
      var denialPayment = null;
      // If less than it should be, create a denial payment
      if (currentRejectionTotal < customer.rejectionTotal) {
        denialPayment = new _denialPayment2.default({
          customer: customer.customer._id,
          amount: customer.rejectionTotal - currentRejectionTotal
        });
        promises.push(denialPayment.save());
      }
      promises.push(customer.customer.save());
    });
  }).then(function () {
    return res.json({});
  });
}

/**
 * Add deduction
 */
function addDeduction(req, res) {
  var _this = this;

  var _req$body = req.body,
      ach = _req$body.ach,
      inventory = _req$body.inventory;

  var company = void 0;

  _inventory4.default.find({ cqAch: ach }).then(function (inventories) {
    if (!inventories.length) {
      throw 'achNotFound';
    }

    if (inventories.length > 1) {
      var companies = new Set();
      inventories.forEach(function (inv) {
        companies.add(inv.company.toString());
      });

      if (companies.size > 1) {
        throw 'multipleCompanies';
      }
    }

    company = inventories[0].company;

    return _inventory4.default.findById(inventory);
  }).then(function (dbInventory) {
    if (!dbInventory) {
      throw 'inventoryNotFound';
    }

    if (dbInventory.company.toString() !== company.toString()) {
      throw 'differentCompany';
    }

    dbInventory.deduction = ach;
    dbInventory.save();

    return res.json({});
  }).catch(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(err === 'achNotFound')) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt('return', res.status(400).json({ error: "The ACH could not be found in the database." }));

            case 2:
              if (!(err === 'inventoryNotFound')) {
                _context3.next = 4;
                break;
              }

              return _context3.abrupt('return', res.status(400).json({ error: "Invalid inventory specified." }));

            case 4:
              if (!(err === 'multipleCompanies')) {
                _context3.next = 6;
                break;
              }

              return _context3.abrupt('return', res.status(400).json({ error: "This ACH belongs to multiple companies." }));

            case 6:
              if (!(err === 'differentCompany')) {
                _context3.next = 8;
                break;
              }

              return _context3.abrupt('return', res.status(400).json({ error: "This ACH belongs to a different company." }));

            case 8:

              console.log('**************ERR IN ADDDEDUCTION**************');
              console.log(err);

              _context3.next = 12;
              return _errorLog2.default.create({
                method: 'addDeduction',
                controller: 'admin.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 12:
              return _context3.abrupt('return', res.status(500).json({ error: "Something went wrong." }));

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x5) {
      return _ref3.apply(this, arguments);
    };
  }());
}

/**
 * Fill in system time on existing cards
 */
function systemTime(req, res) {
  _inventory4.default.find().then(function (inventories) {
    var promises = [];
    inventories.forEach(function (inventory) {
      if (!inventory.systemTime) {
        inventory.systemTime = inventory.created;
        promises.push(inventory.save());
      }
    });
    return Promise.all(promises);
  }).then(function () {
    return res.json({});
  });
}

function testCallback(req, res) {
  console.log(req.body);
  res.json({});
}

function calculateInventoryWeight(inventory) {
  // Assign partial weight to activity status, since we need to compare them, but giving entire points would throw everything off
  var activityStatusValues = {
    'notShipped': 0,
    shipped: 0.2,
    receivedCq: 0.4,
    sentToSmp: 0.6,
    receivedSmp: 0.8,
    rejected: 0.1
  };
  // Inventory "score" to see how complete it is based on admin activity interaction
  var score = 0;
  // Iterate the values typically modified from admin activity
  ['orderNumber', 'cqAch', 'smpAch', 'credited', 'rejected', 'activityStatus'].forEach(function (property) {
    if (inventory[property]) {
      score = score + 1;
    }
    if (property === 'activityStatus') {
      var activityStatusValue = activityStatusValues[inventory[property]];
      if (!isNaN(activityStatusValue)) {
        score = score + activityStatusValue;
      }
    }
  });
  return score;
}
//# sourceMappingURL=admin.controller.js.map
