'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRole = exports.deleteInventories = exports.getReceipts = exports.checkInventoryNeedsReconciled = exports.sellNonAutoCard = exports.getCompanySummary = exports.getAllActivityRevised = exports.getParamsInRange = exports.markAsReconciled = exports.getDenials = exports.reconcile = exports.updateSettings = exports.updateProfile = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Admin route to update a company
 * @param req
 * @param res
 */
var updateProfile = exports.updateProfile = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
    var body, _companyId, editable, company, settings, companyFinal;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            body = req.body;
            _companyId = req.params.companyId;
            editable = ['name', 'address1', 'address2', 'city', 'state', 'zip', 'margin', 'apis', 'autoSell', 'useAlternateGCMGR', 'serviceFee', 'bookkeepingEmails'];
            // let newMargin, company, settings;

            _context5.next = 6;
            return _company2.default.findById(_companyId);

          case 6:
            company = _context5.sent;
            _context5.next = 9;
            return company.getSettingsObject();

          case 9:
            settings = _context5.sent;

            _lodash2.default.forEach(body, function (prop, key) {
              // Don't edit non-editable items
              if (editable.indexOf(key) !== -1) {
                switch (key) {
                  // Default to environment margin
                  case 'margin':
                    settings.margin = prop === '' ? _environment2.default.margin : parseFloat(prop);
                    break;
                  case 'useAlternateGCMGR':
                    settings.useAlternateGCMGR = prop;
                    break;
                  // Default to environment service fee
                  case 'serviceFee':
                    settings.serviceFee = prop === '' ? _environment2.default.serviceFee : parseFloat(prop);
                    break;
                  // Make sure there's no spaces in the booking emails list
                  case 'bookkeepingEmails':
                    prop = prop.replace(/\s/g, '');
                    var emails = prop.split(',');
                    var isValid = true;
                    emails.forEach(function (email) {
                      if (!(0, _validation.isEmail)(email)) {
                        isValid = false;
                      }
                    });
                    if (!isValid) {
                      throw 'invalidBookkeepingEmails';
                    }
                    company[key] = prop;
                    break;
                  default:
                    company[key] = prop;
                }
              }
            });
            _context5.next = 13;
            return company.save();

          case 13:
            _context5.next = 15;
            return settings.save();

          case 15:
            _context5.next = 17;
            return _company2.default.findById(_companyId).populate('settings');

          case 17:
            companyFinal = _context5.sent;
            return _context5.abrupt('return', res.json(companyFinal));

          case 21:
            _context5.prev = 21;
            _context5.t0 = _context5['catch'](0);

            console.log('**************UPDATE PROFILE ERR**********');
            console.log(_context5.t0);

            _context5.next = 27;
            return _errorLog2.default.create({
              method: 'updateProfile',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context5.t0.stack,
              error: _context5.t0,
              user: req.user._id
            });

          case 27:
            return _context5.abrupt('return', res.status(500).json(_context5.t0));

          case 28:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 21]]);
  }));

  return function updateProfile(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Handle minimum adjusted denial settings
 * @param settings
 * @param setting
 */


/**
 * Update a company's settings
 */
var updateSettings = exports.updateSettings = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var body, companyId, user, publicSettings, company, settings, companyWithSettings;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            body = req.body;
            companyId = req.params.companyId;
            user = req.user;
            publicSettings = ['managersSetBuyRates', 'autoSetBuyRates', 'autoBuyRates', 'employeesCanSeeSellRates', 'autoSell', 'minimumAdjustedDenialAmount', 'customerDataRequired', 'cardType', 'timezone'];
            // Basic auth check

            if (!(user.company.toString() !== companyId)) {
              _context6.next = 6;
              break;
            }

            return _context6.abrupt('return', res.status(401).json({
              message: 'Unauthorized'
            }));

          case 6:
            _context6.prev = 6;
            _context6.next = 9;
            return _company2.default.findById(companyId);

          case 9:
            company = _context6.sent;
            _context6.next = 12;
            return company.getSettings(false);

          case 12:
            settings = _context6.sent;

            _lodash2.default.forEach(body, function (setting, key) {
              if (publicSettings.indexOf(key) !== -1) {
                // Minimum adjusted denial amount
                if (key === 'minimumAdjustedDenialAmount') {
                  setMinimumAdjustedDenial(settings, setting);
                } else {
                  settings[key] = setting;
                }
              }
            });
            // Retrieve updated company and settings
            _context6.next = 16;
            return settings.save();

          case 16:
            _context6.next = 18;
            return _company2.default.findById(companyId).populate({
              path: 'settings',
              populate: {
                path: 'autoBuyRates',
                model: 'AutoBuyRate'
              }
            });

          case 18:
            companyWithSettings = _context6.sent;
            return _context6.abrupt('return', res.json({ company: companyWithSettings }));

          case 22:
            _context6.prev = 22;
            _context6.t0 = _context6['catch'](6);
            _context6.next = 26;
            return _errorLog2.default.create({
              method: 'updateSettings',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context6.t0.stack,
              error: _context6.t0,
              user: req.user._id
            });

          case 26:
            return _context6.abrupt('return', res.status(500).json(_context6.t0));

          case 27:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[6, 22]]);
  }));

  return function updateSettings(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Update auto-buy rates
 */


/**
 * Reconcile available cards
 */
var reconcile = exports.reconcile = function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(req, res) {
    var _this8 = this;

    var matchedInventories, body, tzOffset, userTime, company, findParams, findElectronicParams, findOthersParams, storeIdParam;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            matchedInventories = [];
            body = req.body;
            tzOffset = body.userTime.substr(-6);
            userTime = _moment2.default.utc().add(parseInt(tzOffset), 'hours').toDate();
            company = void 0;
            // Find physical

            findParams = {
              type: /physical/i,
              reconciliation: { $exists: false },
              soldToLiquidation: true
            };
            // Find electronic

            findElectronicParams = {
              type: /electronic/i,
              status: /SALE_NON_API/i,
              reconciliation: { $exists: false }
            };
            // Find others

            findOthersParams = {
              type: /electronic/i,
              status: /SALE_NON_API/i,
              reconciliation: { $exists: false }
            };
            storeIdParam = req.params.storeId;

            if (storeIdParam === 'all') {
              storeIdParam = false;
            } else if (!isValidObjectId(storeIdParam)) {
              storeIdParam = req.user.store;
            }
            if (storeIdParam) {
              findParams.store = storeIdParam;
              findElectronicParams.store = storeIdParam;
              findOthersParams.store = storeIdParam;
              // Use company
            } else {
              company = req.user && req.user.company ? req.user.company : null;
              if (company) {
                findParams.company = company;
                findElectronicParams.company = company;
                findOthersParams.company = company;
              }
            }
            // Make sure we have store or company

            if (!(!storeIdParam && !company)) {
              _context23.next = 13;
              break;
            }

            return _context23.abrupt('return', res.status(500).json({ err: 'Unable to determine store or company' }));

          case 13:
            // Physical cards
            _inventory2.default.find(findParams).then(function (inventories) {
              // Add to matched
              if (inventories) {
                matchedInventories = matchedInventories.concat(inventories);
              }
              // Electronic and status === SALE_CONFIRMED
              return _inventory2.default.find(findElectronicParams);
            }).then(function (inventories) {
              if (inventories) {
                // Add to matched
                matchedInventories = matchedInventories.concat(inventories);
              }
              // Find electronic cards which are stuck or have otherwise not sold
              return _inventory2.default.find(findOthersParams);
            })
            // Convert these to physical
            .then(function (inventories) {
              if (inventories) {
                // Add to matched
                matchedInventories = matchedInventories.concat(inventories);
              }
            }).then(function () {
              matchedInventories = matchedInventories.filter(function (thisInventory, index, collection) {
                // Find index of this _id. If not the same as current index, filter it out, since duplicate
                return collection.findIndex(function (t) {
                  return t._id.toString() === thisInventory._id.toString();
                }) === index;
              });
            }).then(function () {
              var matchPromises = [];
              // Create reconciliation for each inventory
              matchedInventories.forEach(function (thisMatch) {
                var reconciliation = new Reconciliation({
                  inventory: thisMatch._id,
                  userTime: userTime,
                  created: userTime
                });
                matchPromises.push(reconciliation.save());
              });
              return Promise.all(matchPromises);
            })
            // Add reconciliations to cards
            .then(function (reconciliations) {
              var inventoryPromises = [];
              reconciliations.forEach(function (reconciliation, index) {
                matchedInventories[index].reconciliation = reconciliation._id;
                inventoryPromises.push(matchedInventories[index].save());
              });
              return Promise.all(inventoryPromises);
            })
            // Get store
            .then(function () {
              if (storeIdParam) {
                return Store.findById(req.params.storeId);
              }
              return new Promise(function (resolve) {
                return resolve();
              });
            })
            // Update the last time this store was reconciled
            .then(function (store) {
              if (store) {
                store.reconciledTime = Date.now();
                return store.save();
              }
              return new Promise(function (resolve) {
                return resolve();
              });
            }).then(function (inventories) {
              return res.json({ data: inventories });
            }).catch(function () {
              var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(err) {
                return regeneratorRuntime.wrap(function _callee22$(_context22) {
                  while (1) {
                    switch (_context22.prev = _context22.next) {
                      case 0:
                        console.log('**************RECONCILIATION ERROR**********');
                        console.log(err);

                        _context22.next = 4;
                        return _errorLog2.default.create({
                          method: 'reconcile',
                          controller: 'company.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 4:
                        return _context22.abrupt('return', res.status(500).json(err));

                      case 5:
                      case 'end':
                        return _context22.stop();
                    }
                  }
                }, _callee22, _this8);
              }));

              return function (_x27) {
                return _ref23.apply(this, arguments);
              };
            }());

          case 14:
          case 'end':
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function reconcile(_x25, _x26) {
    return _ref22.apply(this, arguments);
  };
}();

/**
 * Get denials since the last time reconciliation was closed
 */


var getDenials = exports.getDenials = function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(req, res) {
    var _req$params2, _req$params2$pageSize, pageSize, _req$params2$page, page, begin, end, retailers_with_denials, searchQuery, retailersCount, retailers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ret, query, inventories, rejected_inventories;

    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            // Get the last time reconciliation was closed
            // Check for denials since the reconciliation close
            _req$params2 = req.params, _req$params2$pageSize = _req$params2.pageSize, pageSize = _req$params2$pageSize === undefined ? 10 : _req$params2$pageSize, _req$params2$page = _req$params2.page, page = _req$params2$page === undefined ? 0 : _req$params2$page;
            begin = req.params.begin;
            end = req.params.end;

            begin = _moment2.default.utc(begin).startOf('day');
            end = _moment2.default.utc(end).endOf('day');
            retailers_with_denials = [];
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

            _context24.prev = 9;
            _context24.next = 12;
            return Retailer.count({});

          case 12:
            retailersCount = _context24.sent;
            _context24.next = 15;
            return Retailer.find({}).limit(parseInt(pageSize)).skip(parseInt(page) * parseInt(pageSize)).lean();

          case 15:
            retailers = _context24.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context24.prev = 19;
            _iterator = retailers[Symbol.iterator]();

          case 21:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context24.next = 37;
              break;
            }

            ret = _step.value;
            query = searchQuery;

            query.retailer = ret._id;
            _context24.next = 27;
            return _inventory2.default.count(query);

          case 27:
            inventories = _context24.sent;

            query.rejected = true;
            _context24.next = 31;
            return _inventory2.default.count(query);

          case 31:
            rejected_inventories = _context24.sent;

            if (inventories && rejected_inventories) {
              ret['percentOfDenials'] = rejected_inventories / inventories * 100;
            } else {
              ret['percentOfDenials'] = 0;
            }
            retailers_with_denials.push(ret);

          case 34:
            _iteratorNormalCompletion = true;
            _context24.next = 21;
            break;

          case 37:
            _context24.next = 43;
            break;

          case 39:
            _context24.prev = 39;
            _context24.t0 = _context24['catch'](19);
            _didIteratorError = true;
            _iteratorError = _context24.t0;

          case 43:
            _context24.prev = 43;
            _context24.prev = 44;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 46:
            _context24.prev = 46;

            if (!_didIteratorError) {
              _context24.next = 49;
              break;
            }

            throw _iteratorError;

          case 49:
            return _context24.finish(46);

          case 50:
            return _context24.finish(43);

          case 51:
            return _context24.abrupt('return', res.json({
              data: retailers_with_denials,
              total: retailersCount
            }));

          case 54:
            _context24.prev = 54;
            _context24.t1 = _context24['catch'](9);

            console.log('********************ERR IN GETDENIALS***********************');
            console.log(_context24.t1);

            _context24.next = 60;
            return _errorLog2.default.create({
              method: 'getDenials',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context24.t1.stack,
              error: _context24.t1,
              user: req.user._id
            });

          case 60:
            return _context24.abrupt('return', res.status(500).json(_context24.t1));

          case 61:
          case 'end':
            return _context24.stop();
        }
      }
    }, _callee24, this, [[9, 54], [19, 39, 43, 51], [44,, 46, 50]]);
  }));

  return function getDenials(_x28, _x29) {
    return _ref24.apply(this, arguments);
  };
}();

/**
 * Delete a single inventory and all associated records
 * @param inventoryId Inventory document ID
 */


/**
 * Mark cards currently in reconciliation as reconciled
 */
var markAsReconciled = exports.markAsReconciled = function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(req, res) {
    var _this10 = this;

    var params, body, user, tzOffset, userTime, inventoriesToUse, store, batch, findParams;
    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            params = req.params;
            body = req.body;
            user = req.user;
            tzOffset = body.userTime.substr(-6);
            userTime = _moment2.default.utc().add(parseInt(tzOffset), 'hours').toDate();
            inventoriesToUse = void 0;
            store = void 0;
            // Create batch

            batch = {
              company: user.company,
              inventories: []
            };
            findParams = {
              company: params.companyId,
              reconciliation: { $exists: true }
            };

            if (params.storeId === 'all') {
              store = isValidObjectId(params.storeId);
            } else if (isValidObjectId(params.store)) {
              store = params.store;
            } else {
              store = user.store;
            }
            if (store) {
              batch.store = store;
              findParams.store = store;
            }
            _inventory2.default.find(findParams).populate('reconciliation').then(function (inventories) {
              // only return those inventories that don't have a complete reconciliation
              inventoriesToUse = inventories.filter(function (inventory) {
                if (!inventory || !inventory.reconciliation) {
                  return false;
                }
                if (_typeof(inventory.reconciliation) === 'object') {
                  return !inventory.reconciliation.reconciliationComplete;
                }
                return false;
              });
              var reconciliationPromises = [];
              inventoriesToUse.forEach(function (thisInventory) {
                reconciliationPromises.push(thisInventory.reconciliation.update({
                  $set: {
                    reconciliationComplete: true,
                    reconciliationCompleteUserTime: userTime
                  }
                }));
                // Add to batch
                batch.inventories.push(thisInventory._id);
              });
              return Promise.all(reconciliationPromises);
            }).then(function () {
              if (batch.inventories.length) {
                var thisBatch = new _batch2.default(batch);
                return thisBatch.save();
              }
            }).then(function (batch) {
              if (!batch) {
                return;
              }
              var batchPromises = [];
              inventoriesToUse.map(function (thisInventory) {
                batchPromises.push(thisInventory.update({
                  $set: {
                    batch: batch._id
                  }
                }));
              });
              return Promise.all(batchPromises);
            }).then(function (batch) {
              return res.json({ data: batch });
            }).catch(function () {
              var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(err) {
                return regeneratorRuntime.wrap(function _callee26$(_context26) {
                  while (1) {
                    switch (_context26.prev = _context26.next) {
                      case 0:
                        console.log('**************ERROR IN MARKED AS RECONCILED**********');
                        console.log(err);

                        _context26.next = 4;
                        return _errorLog2.default.create({
                          method: 'markAsReconciled',
                          controller: 'company.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 4:
                        return _context26.abrupt('return', res.json(err));

                      case 5:
                      case 'end':
                        return _context26.stop();
                    }
                  }
                }, _callee26, _this10);
              }));

              return function (_x33) {
                return _ref27.apply(this, arguments);
              };
            }());

          case 12:
          case 'end':
            return _context27.stop();
        }
      }
    }, _callee27, this);
  }));

  return function markAsReconciled(_x31, _x32) {
    return _ref26.apply(this, arguments);
  };
}();

/**
 * Retrieve reconciliation for today
 * @param req
 * @param res
 */


/**
 * Get params in date range for dropdowns
 */
var getParamsInRange = exports.getParamsInRange = function () {
  var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(req, res) {
    var _this12 = this;

    var query, companyId, batchMap, companyMap, storeMap, batchFinal, companyFinal, storeFinal, cache, params;
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            query = req.query;
            companyId = query.companyId;

            query.beginDate = query.dateBegin;
            query.endDate = query.dateEnd;
            if (query.beginDate && !query.endDate) {
              query.beginEnd = 'begin';
              query.date = query.beginDate;
            } else if (query.endDate && !query.beginDate) {
              query.beginEnd = 'end';
              query.date = query.endDate;
            }
            if (companyId) {
              query.companyId = companyId;
            }
            // Role for caching
            query.userRole = req.user.role;
            batchMap = {}, companyMap = {}, storeMap = {};
            batchFinal = [], companyFinal = [], storeFinal = [];
            _context30.prev = 9;
            _context30.next = 12;
            return _inventoryParamCache2.default.getCache(query);

          case 12:
            cache = _context30.sent;

            if (!cache) {
              _context30.next = 15;
              break;
            }

            return _context30.abrupt('return', res.json({ batches: cache.batches, companies: cache.companies, stores: cache.stores }));

          case 15:
            params = getActivityDateRange(query);

            _inventory2.default.find(params).populate('batch').populate('company').populate('store').then(function () {
              var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(inventories) {
                return regeneratorRuntime.wrap(function _callee29$(_context29) {
                  while (1) {
                    switch (_context29.prev = _context29.next) {
                      case 0:
                        inventories.forEach(function (inventory) {
                          if (inventory.batch) {
                            batchMap = createParamMap(batchMap, inventory, 'batch', 'batchId');
                          }
                          if (inventory.company) {
                            companyMap = createParamMap(companyMap, inventory, 'company');
                          }
                          if (inventory.store) {
                            storeMap = createParamMap(storeMap, inventory, 'store');
                          }
                        });
                        _lodash2.default.forEach(batchMap, function (batch) {
                          return batchFinal.push(batch);
                        });
                        _lodash2.default.forEach(companyMap, function (company) {
                          return companyFinal.push(company);
                        });
                        _lodash2.default.forEach(storeMap, function (store) {
                          return storeFinal.push(store);
                        });
                        // Store cache

                        if (cache) {
                          _context29.next = 7;
                          break;
                        }

                        _context29.next = 7;
                        return _inventoryParamCache2.default.storeCache(query, {
                          batches: batchFinal,
                          companies: companyFinal,
                          stores: storeFinal
                        });

                      case 7:
                        return _context29.abrupt('return', res.json({ batches: batchFinal, companies: companyFinal, stores: storeFinal }));

                      case 8:
                      case 'end':
                        return _context29.stop();
                    }
                  }
                }, _callee29, _this12);
              }));

              return function (_x38) {
                return _ref32.apply(this, arguments);
              };
            }());
            _context30.next = 26;
            break;

          case 19:
            _context30.prev = 19;
            _context30.t0 = _context30['catch'](9);

            console.log('**************ERROR IN RECONCILIATION TODAY**********');
            console.log(_context30.t0);

            _context30.next = 25;
            return _errorLog2.default.create({
              method: 'getParamsInRange',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context30.t0.stack,
              error: _context30.t0,
              user: req.user._id
            });

          case 25:
            return _context30.abrupt('return', res.status(500).json(_context30.t0));

          case 26:
          case 'end':
            return _context30.stop();
        }
      }
    }, _callee30, this, [[9, 19]]);
  }));

  return function getParamsInRange(_x36, _x37) {
    return _ref31.apply(this, arguments);
  };
}();

/**
 * Get CQ paid
 * @param inventory
 * @param companyId
 * @param rejected Calculate rejected amount
 * @param totalRejections Total amount of rejections
 */


/**
 * Set inventory as unchanged
 * @param inventory
 * @return {Promise.<void>}
 */
var setInventoryUnchanged = function () {
  var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(inventory) {
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            _context31.next = 2;
            return _inventory2.default.findById(inventory._id);

          case 2:
            inventory = _context31.sent;

            inventory.changed = false;
            return _context31.abrupt('return', inventory.save());

          case 5:
          case 'end':
            return _context31.stop();
        }
      }
    }, _callee31, this);
  }));

  return function setInventoryUnchanged(_x40) {
    return _ref33.apply(this, arguments);
  };
}();

/**
 * Get inventory cache, or handle calculations on an inventory
 * @param inventory
 * @param companySettings
 * @param userRole Role of current user
 * @param companyId
 * @param getDenialsPayments Whether to calculate rejected amount
 * @param totalRejections Total rejections
 * @return {Promise.<T>}
 *
 * @todo We need to handle calculations of user total rejections even when getting cached values
 */


var handleCalculations = function () {
  var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(inventory, companySettings, userRole, companyId, getDenialsPayments, totalRejections) {
    var cache, i, thisInventory;
    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            if (getDenialsPayments) {
              _context32.next = 19;
              break;
            }

            cache = void 0;
            // Inventory unchanged, no need to recalculate

            _context32.next = 4;
            return _inventory2.default.getCalculatedValues(inventory);

          case 4:
            cache = _context32.sent;

            if (!cache) {
              _context32.next = 19;
              break;
            }

            if (!_lodash2.default.isPlainObject(inventory)) {
              inventory = inventory.toObject();
            }
            cache = cache.toObject();
            // Combine cache with inventory
            _context32.t0 = regeneratorRuntime.keys(cache);

          case 9:
            if ((_context32.t1 = _context32.t0()).done) {
              _context32.next = 17;
              break;
            }

            i = _context32.t1.value;

            if (!cache.hasOwnProperty(i)) {
              _context32.next = 15;
              break;
            }

            if (!(['_id', 'inventory', 'created'].indexOf(i) !== -1)) {
              _context32.next = 14;
              break;
            }

            return _context32.abrupt('continue', 9);

          case 14:
            inventory[i] = cache[i];

          case 15:
            _context32.next = 9;
            break;

          case 17:
            inventory.isCached = true;
            return _context32.abrupt('return', Promise.resolve(inventory));

          case 19:
            if (['manager', 'employee'].indexOf(userRole) !== -1 && companySettings.useAlternateGCMGR) {
              inventory.card.number = inventory.card.getLast4Digits();
            }
            // Calculate values for this inventory
            thisInventory = calculateValues(inventory, companyId, getDenialsPayments, totalRejections);
            return _context32.abrupt('return', Promise.resolve(thisInventory));

          case 22:
          case 'end':
            return _context32.stop();
        }
      }
    }, _callee32, this);
  }));

  return function handleCalculations(_x41, _x42, _x43, _x44, _x45, _x46) {
    return _ref34.apply(this, arguments);
  };
}();

/**
 * Calculate values (from cache if possible, else cache result)
 * @param inventories
 * @param companySettings
 * @param userRole
 * @param companyId
 * @param getDenialsPayments Whether to
 * @param rejections
 * @return {Promise.<void>}
 */


var getCalculatedValues = function () {
  var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(inventories, companySettings, userRole, companyId, getDenialsPayments, rejections) {
    var finalInventories, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, inventory;

    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            // Inventories after all calculations or cache applications
            finalInventories = [];
            // return inventories.forEach(getCalc);

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context33.prev = 4;
            _iterator2 = inventories[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context33.next = 21;
              break;
            }

            inventory = _step2.value;
            _context33.next = 10;
            return handleCalculations(inventory, companySettings, userRole, companyId, getDenialsPayments, rejections);

          case 10:
            inventory = _context33.sent;

            if (inventory.isCached) {
              _context33.next = 14;
              break;
            }

            _context33.next = 14;
            return _inventory2.default.cacheInventoryValues(inventory);

          case 14:
            _context33.next = 16;
            return setInventoryUnchanged(inventory);

          case 16:
            // Temp critical bug fix. We need to figure out which place is the best one to put this
            // or put the mapped value along with the cached inventory data.
            if (_environment.smpNames[inventory.smp]) {
              inventory.smp = _environment.smpNames[inventory.smp];
            }

            // Add to final
            finalInventories.push(inventory);

          case 18:
            _iteratorNormalCompletion2 = true;
            _context33.next = 6;
            break;

          case 21:
            _context33.next = 27;
            break;

          case 23:
            _context33.prev = 23;
            _context33.t0 = _context33['catch'](4);
            _didIteratorError2 = true;
            _iteratorError2 = _context33.t0;

          case 27:
            _context33.prev = 27;
            _context33.prev = 28;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 30:
            _context33.prev = 30;

            if (!_didIteratorError2) {
              _context33.next = 33;
              break;
            }

            throw _iteratorError2;

          case 33:
            return _context33.finish(30);

          case 34:
            return _context33.finish(27);

          case 35:
            return _context33.abrupt('return', Promise.resolve(finalInventories));

          case 36:
          case 'end':
            return _context33.stop();
        }
      }
    }, _callee33, this, [[4, 23, 27, 35], [28,, 30, 34]]);
  }));

  return function getCalculatedValues(_x47, _x48, _x49, _x50, _x51, _x52) {
    return _ref35.apply(this, arguments);
  };
}();

/**
 * Create CSV for an SMP
 * @param inventories
 * @param csvSmp
 * @param res
 * @return {Promise.<void>}
 */


var getSmpCsv = function () {
  var _ref36 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(inventories, csvSmp, res) {
    var format, isCc, isCp, isGcz, isCorporate, csvWriter, outFile, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, inventory, row, netAmount, customerName, retailerName;

    return regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            format = [];
            isCc = csvSmp.toLowerCase() === 'cardcash';
            isCp = csvSmp.toLowerCase() === 'cardpool';
            isGcz = csvSmp.toLowerCase() === 'giftcardzen';
            isCorporate = csvSmp.toLowerCase() === 'corporate';

            if (!isCp) {
              _context34.next = 9;
              break;
            }

            format = ['retailer', 'number', 'pin', 'balance'];
            _context34.next = 23;
            break;

          case 9:
            if (!isCc) {
              _context34.next = 13;
              break;
            }

            format = ['Merchant', 'Number', 'Pin', 'Balance', 'REF'];
            _context34.next = 23;
            break;

          case 13:
            if (!isGcz) {
              _context34.next = 17;
              break;
            }

            format = ['Merchant', 'Card Number', 'PIN', 'Balance', 'Note'];
            // Corporate, get all
            _context34.next = 23;
            break;

          case 17:
            if (!isCorporate) {
              _context34.next = 22;
              break;
            }

            format = ['userTime', 'cardId', 'retailer', 'number', 'pin', 'balance', 'verifiedBalance', 'netAmount', 'customerName', 'buyAmount', 'ach'];
            // Add in denial amount for CSV denials
            if (getDenialsPayments) {
              format.splice(9, 0, 'rejectAmount');
            }
            _context34.next = 23;
            break;

          case 22:
            throw 'unknownSmpFormat';

          case 23:
            csvWriter = (0, _csvWriteStream2.default)({ headers: format });
            outFile = 'salesCsv/' + (0, _moment2.default)().format('YYYYMMDD') + '-' + csvSmp + '.csv';
            // Remove existing file

            if (_fs2.default.existsSync(outFile)) {
              _fs2.default.unlinkSync(outFile);
            }
            csvWriter.pipe(_fs2.default.createWriteStream(outFile));
            inventories = inventories.filter(function (inventory) {
              var used = false;
              // All for corporate
              if (isCorporate) {
                used = true;
                // Electronic cards can have any status before sent to SMP
              } else {
                var activityStatus = typeof inventory.activityStatus === 'string' ? inventory.activityStatus.toLowerCase() : '';
                activityStatus = activityStatus.replace(/\s/g, '');
                if (inventory.type.toLowerCase() === 'electronic') {
                  used = !activityStatus || activityStatus === 'notshipped';
                  // Physical cards must be received
                } else {
                  used = activityStatus === 'receivedcq';
                }
              }
              if (!used) {
                return false;
              }
              // 2
              if (isCc) {
                return inventory.smp.toLowerCase() === 'cardcash' || inventory.smp === _environment2.default.smpIds.CARDCASH;
                // 3
              } else if (isCp) {
                return inventory.smp.toLowerCase() === 'cardpool' || inventory.smp === _environment2.default.smpIds.CARDPOOL;
              } else if (isGcz) {
                return inventory.smp.toLowerCase() === 'giftcardzen' || inventory.smp === _environment2.default.smpIds.GIFTCARDZEN;
                // Corporate
              } else if (isCorporate) {
                return inventory;
              }
            });
            // Create columns
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context34.prev = 31;
            _iterator3 = inventories[Symbol.iterator]();

          case 33:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context34.next = 57;
              break;
            }

            inventory = _step3.value;
            row = void 0;

            if (!inventory.card) {
              _context34.next = 54;
              break;
            }

            if (!(csvSmp === 'corporate')) {
              _context34.next = 46;
              break;
            }

            inventory = calculateValues(inventory, companyId);
            netAmount = inventory.isTransaction ? inventory.transaction.netPayout : inventory.netAmount;
            customerName = '';
            // Get customer name, which could be different based on which endpoint the cards sold from

            if (inventory.card.lqCustomerName) {
              customerName = inventory.card.lqCustomerName;
            } else if (inventory.customer && inventory.customer.fullName) {
              customerName = inventory.customer.fullName;
            }
            row = [(0, _moment2.default)(inventory.created).format(), inventory.card._id, inventory.retailer.name, inventory.card.number, inventory.card.pin, inventory.balance.toFixed(2), inventory.verifiedBalance ? inventory.verifiedBalance.toFixed(2) : inventory.balance.toFixed(2), netAmount.toFixed(2), customerName, inventory.buyAmount.toFixed(2), inventory.cqAch];
            // Denials
            if (getDenialsPayments) {
              row.splice(9, 0, inventory.rejectAmount ? inventory.rejectAmount.toFixed(2) : '(' + inventory.creditAmount.toFixed(2) + ')');
            }
            _context34.next = 52;
            break;

          case 46:
            if (!_lodash2.default.isPlainObject(inventory.retailer)) {
              _context34.next = 50;
              break;
            }

            _context34.next = 49;
            return Retailer.findById(inventory.retailer._id);

          case 49:
            inventory.retailer = _context34.sent;

          case 50:
            retailerName = inventory.retailer.getSmpSpelling()[csvSmp] || inventory.retailer.name;

            row = [retailerName, inventory.card.number, inventory.card.pin, inventory.verifiedBalance || inventory.balance];

          case 52:
            if (isCc || isGcz) {
              row.push('');
            }
            csvWriter.write(row);

          case 54:
            _iteratorNormalCompletion3 = true;
            _context34.next = 33;
            break;

          case 57:
            _context34.next = 63;
            break;

          case 59:
            _context34.prev = 59;
            _context34.t0 = _context34['catch'](31);
            _didIteratorError3 = true;
            _iteratorError3 = _context34.t0;

          case 63:
            _context34.prev = 63;
            _context34.prev = 64;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 66:
            _context34.prev = 66;

            if (!_didIteratorError3) {
              _context34.next = 69;
              break;
            }

            throw _iteratorError3;

          case 69:
            return _context34.finish(66);

          case 70:
            return _context34.finish(63);

          case 71:
            csvWriter.end();
            res.json({ url: '' + _environment2.default.serverApiUrl + outFile });

          case 73:
          case 'end':
            return _context34.stop();
        }
      }
    }, _callee34, this, [[31, 59, 63, 71], [64,, 66, 70]]);
  }));

  return function getSmpCsv(_x53, _x54, _x55) {
    return _ref36.apply(this, arguments);
  };
}();

/**
 * Get all activity (admin revised)
 */


var getAllActivityRevised = exports.getAllActivityRevised = function () {
  var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(req, res) {
    var _req$params3, perPage, offset, query, _companyId2, companySettings, csvSmp, cqAchCompanySearch, _getDenialsPayments, payments, meta, findParams, inventories, finalFindParams, rejections, queryRes, company, mrRes, paramsOffset, paramsPerPage, mrPageRes, count;

    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            _context35.prev = 0;
            _req$params3 = req.params, perPage = _req$params3.perPage, offset = _req$params3.offset;
            query = req.query;
            _companyId2 = void 0;
            companySettings = null;
            // Download CSV for an SMP

            csvSmp = void 0;
            // See if a CQ ACH search is being performed

            cqAchCompanySearch = !!query.cqAch;
            // Whether to get denial payments

            _getDenialsPayments = false;
            payments = [];
            meta = {};
            // Date range params

            findParams = getActivityDateRange(req.params);
            inventories = void 0;
            // Params after formatting for activity query

            finalFindParams = void 0;
            rejections = {
              user: {}
            };
            // Store company ID and format for query

            if (query.companyId) {
              _companyId2 = query.companyId;
              query.company = query.companyId;
              delete query.companyId;
            }
            // Download CSV
            if (query.csvSmp) {
              csvSmp = query.csvSmp;
              delete query.csvSmp;
            }
            // Set rejected to boolean
            if (query.rejected && query.rejected === 'true') {
              // Either credited or rejected
              query.$or = [{ credited: true }, { rejected: true }];
              delete query.rejected;
              _getDenialsPayments = true;
              // Search all statuses for denials
              query.activityStatus = '-';
            }
            // User is admin
            if (req.user.role === 'admin') {
              query.isAdmin = true;
            }
            _context35.next = 20;
            return queryActivity(findParams, query, perPage, offset, false, true);

          case 20:
            queryRes = _context35.sent;

            inventories = queryRes.inventories;
            finalFindParams = queryRes.findParams;
            // If querying as corporate
            _context35.next = 25;
            return _company2.default.findById(_companyId2);

          case 25:
            company = _context35.sent;

            if (!company) {
              _context35.next = 30;
              break;
            }

            _context35.next = 29;
            return company.getSettings();

          case 29:
            companySettings = _context35.sent;

          case 30:
            _context35.next = 32;
            return getCalculatedValues(inventories, companySettings, req.user.role, _companyId2, _getDenialsPayments, rejections);

          case 32:
            inventories = _context35.sent;

            // Set mongo grand total params
            inventoryMapReduceParams.query = finalFindParams;
            inventoryMapReduceParams.scope = {
              counter: null,
              begin: 0,
              end: 0,
              corporate: !!_companyId2,
              cqAchSearch: cqAchCompanySearch
            };
            _context35.next = 37;
            return _inventory2.default.mapReduce(inventoryMapReduceParams);

          case 37:
            mrRes = _context35.sent;

            meta.totals = {};
            mrRes.forEach(function (item) {
              meta.totals[item._id] = item.value;
            });

            if (!_getDenialsPayments) {
              _context35.next = 44;
              break;
            }

            _context35.next = 43;
            return _denialPayment2.default.find({
              customer: query.customer
            });

          case 43:
            payments = _context35.sent;

          case 44:
            // Set mongo skip and limit
            inventoryMapReduceParams.query = finalFindParams;
            paramsOffset = parseInt(offset);
            paramsPerPage = parseInt(perPage);

            inventoryMapReduceParams.scope = {
              counter: 0,
              begin: paramsOffset,
              end: paramsPerPage + paramsOffset,
              corporate: !!_companyId2,
              cqAchSearch: cqAchCompanySearch
            };
            _context35.next = 50;
            return _inventory2.default.mapReduce(inventoryMapReduceParams);

          case 50:
            mrPageRes = _context35.sent;

            meta.pageTotals = {};
            mrPageRes.forEach(function (item) {
              meta.pageTotals[item._id] = item.value;
            });
            _context35.next = 55;
            return queryActivity(findParams, query, perPage, offset, true);

          case 55:
            count = _context35.sent;

            meta.total = count;
            meta.pages = Math.ceil(count / perPage);
            // Download formatted for upload to an SMP

            if (!csvSmp) {
              _context35.next = 60;
              break;
            }

            return _context35.abrupt('return', getSmpCsv(inventories, csvSmp, res));

          case 60:
            res.json({
              inventories: inventories,
              meta: meta,
              payments: payments
            });
            _context35.next = 70;
            break;

          case 63:
            _context35.prev = 63;
            _context35.t0 = _context35['catch'](0);

            console.log('**************GETALLACTIVITYREVISED ERR**********');
            console.log(_context35.t0);

            _context35.next = 69;
            return _errorLog2.default.create({
              method: 'getAllActivityRevised',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context35.t0.stack,
              error: _context35.t0,
              user: req.user._id
            });

          case 69:
            return _context35.abrupt('return', res.status(500).json({ err: _context35.t0 }));

          case 70:
          case 'end':
            return _context35.stop();
        }
      }
    }, _callee35, this, [[0, 63]]);
  }));

  return function getAllActivityRevised(_x56, _x57) {
    return _ref37.apply(this, arguments);
  };
}();

/**
 * Retrieve a company summary report
 */


var getCompanySummary = exports.getCompanySummary = function () {
  var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(req, res) {
    var companyId, begin, end, dbStores;
    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            companyId = req.params.companyId;
            begin = req.params.begin;
            end = req.params.end;

            begin = _moment2.default.utc(begin).startOf('day');
            end = _moment2.default.utc(end).endOf('day');
            dbStores = void 0;
            _context36.prev = 6;

            Store.find({
              companyId: companyId
            }).then(function (stores) {
              dbStores = stores;
              var promises = [];
              stores.forEach(function (store) {
                inventoryMapReduceParams.query = {
                  created: { $gt: begin.toDate(), $lt: end.toDate() },
                  company: companyId,
                  store: store._id
                };
                inventoryMapReduceParams.scope = {
                  counter: null,
                  begin: 0,
                  end: 0,
                  corporate: true,
                  cqAchSearch: false
                };
                promises.push(_inventory2.default.mapReduce(inventoryMapReduceParams));
              });
              return Promise.all(promises);
            }).then(function (results) {
              var storesWithData = [];

              var _loop = function _loop(i) {
                var resultObject = {};
                results[i].forEach(function (result) {
                  resultObject[result._id] = result.value;
                });
                storesWithData.push({
                  store: dbStores[i],
                  data: resultObject
                });
              };

              for (var i = 0; i < results.length; i++) {
                _loop(i);
              }
              return res.json({ data: storesWithData });
            });
            _context36.next = 17;
            break;

          case 10:
            _context36.prev = 10;
            _context36.t0 = _context36['catch'](6);

            console.log('**************getCompanySummary ERR**********');
            console.log(_context36.t0);

            _context36.next = 16;
            return _errorLog2.default.create({
              method: 'getCompanySummary',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context36.t0.stack,
              error: _context36.t0,
              user: req.user._id
            });

          case 16:
            return _context36.abrupt('return', res.status(500).json({ err: _context36.t0 }));

          case 17:
          case 'end':
            return _context36.stop();
        }
      }
    }, _callee36, this, [[6, 10]]);
  }));

  return function getCompanySummary(_x58, _x59) {
    return _ref38.apply(this, arguments);
  };
}();

/**
 * Sell a card which is not auto-sold
 */


var sellNonAutoCard = exports.sellNonAutoCard = function () {
  var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(req, res) {
    var _this13 = this;

    var user, params, isCorporateAdmin;
    return regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            user = req.user;
            params = req.params;
            isCorporateAdmin = user.role === 'corporate-admin';
            // Wrong company

            if (!(user.company.toString() !== params.companyId)) {
              _context38.next = 5;
              break;
            }

            return _context38.abrupt('return', res.status(401).json());

          case 5:
            if (isCorporateAdmin) {
              _context38.next = 8;
              break;
            }

            if (!(!user.store || user.store.toString() !== params.storeId)) {
              _context38.next = 8;
              break;
            }

            return _context38.abrupt('return', res.status(401).json());

          case 8:
            _inventory2.default.findById(params.inventoryId).then(function (inventory) {
              inventory.proceedWithSale = true;
              inventory.save();
            }).then(function (inventory) {
              return res.json(inventory);
            }).catch(function () {
              var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(err) {
                return regeneratorRuntime.wrap(function _callee37$(_context37) {
                  while (1) {
                    switch (_context37.prev = _context37.next) {
                      case 0:
                        console.log('**************ERR IN SELL NON AUTO CARD**********');
                        console.log(err);

                        _context37.next = 4;
                        return _errorLog2.default.create({
                          method: 'sellNonAutoCard',
                          controller: 'company.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err,
                          user: req.user._id
                        });

                      case 4:
                        return _context37.abrupt('return', res.status(500).json(err));

                      case 5:
                      case 'end':
                        return _context37.stop();
                    }
                  }
                }, _callee37, _this13);
              }));

              return function (_x62) {
                return _ref40.apply(this, arguments);
              };
            }());

          case 9:
          case 'end':
            return _context38.stop();
        }
      }
    }, _callee38, this);
  }));

  return function sellNonAutoCard(_x60, _x61) {
    return _ref39.apply(this, arguments);
  };
}();

/**
 * Check if there is inventory which needs to be reconciled
 */


var checkInventoryNeedsReconciled = exports.checkInventoryNeedsReconciled = function () {
  var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(req, res) {
    var _req$params4, companyId, storeId;

    return regeneratorRuntime.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            _req$params4 = req.params, companyId = _req$params4.companyId, storeId = _req$params4.storeId;
            _context39.prev = 1;

            _inventory2.default.find({
              company: companyId,
              store: storeId,
              soldToLiquidation: true,
              reconciliation: {
                $exists: false
              }
            }).then(function (inventories) {
              return res.json({
                needReconciliation: !!inventories.length
              });
            });
            _context39.next = 12;
            break;

          case 5:
            _context39.prev = 5;
            _context39.t0 = _context39['catch'](1);

            console.log('**************ERR IN checkInventoryNeedsReconciled**********');
            console.log(_context39.t0);

            _context39.next = 11;
            return _errorLog2.default.create({
              method: 'checkInventoryNeedsReconciled',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context39.t0.stack,
              error: _context39.t0,
              user: req.user._id
            });

          case 11:
            return _context39.abrupt('return', res.status(500).json(_context39.t0));

          case 12:
          case 'end':
            return _context39.stop();
        }
      }
    }, _callee39, this, [[1, 5]]);
  }));

  return function checkInventoryNeedsReconciled(_x63, _x64) {
    return _ref41.apply(this, arguments);
  };
}();

/**
 * Get receipts for a company
 */


var getReceipts = exports.getReceipts = function () {
  var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(req, res) {
    var _req$query, _req$query$perPage, perPage, _req$query$offset, offset, receiptService, query, _ref43, _ref44, totalReceipts, receipts;

    return regeneratorRuntime.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            _req$query = req.query, _req$query$perPage = _req$query.perPage, perPage = _req$query$perPage === undefined ? 20 : _req$query$perPage, _req$query$offset = _req$query.offset, offset = _req$query$offset === undefined ? 0 : _req$query$offset;
            _context40.prev = 1;
            receiptService = new _receipt4.default();
            query = Object.assign({}, _lodash2.default.pick(req.query, ['created']), { company: req.user.company });
            _context40.next = 6;
            return Promise.all([receiptService.getReceiptsCount(query), receiptService.getReceipts(query, { perPage: parseInt(perPage, 10), offset: parseInt(offset, 10) })]);

          case 6:
            _ref43 = _context40.sent;
            _ref44 = _slicedToArray(_ref43, 2);
            totalReceipts = _ref44[0];
            receipts = _ref44[1];


            res.json({
              data: receipts,
              pagination: {
                total: totalReceipts
              }
            });
            _context40.next = 20;
            break;

          case 13:
            _context40.prev = 13;
            _context40.t0 = _context40['catch'](1);

            console.log('**************ERR IN GET RECEIPTS**********');
            console.log(_context40.t0);

            _context40.next = 19;
            return _errorLog2.default.create({
              method: 'getReceipts',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context40.t0.stack,
              error: _context40.t0,
              user: req.user._id
            });

          case 19:
            return _context40.abrupt('return', res.status(500).json(_context40.t0));

          case 20:
          case 'end':
            return _context40.stop();
        }
      }
    }, _callee40, this, [[1, 13]]);
  }));

  return function getReceipts(_x65, _x66) {
    return _ref42.apply(this, arguments);
  };
}();

/**
 * Delete one or more inventories
 */


var deleteInventories = exports.deleteInventories = function () {
  var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(req, res) {
    var _this14 = this;

    var body, inventories;
    return regeneratorRuntime.wrap(function _callee42$(_context42) {
      while (1) {
        switch (_context42.prev = _context42.next) {
          case 0:
            body = req.body;
            inventories = [];
            _context42.prev = 2;

            _lodash2.default.forEach(body, function (thisInventory) {
              inventories.push(thisInventory);
            });
            _inventory2.default.find({
              _id: {
                $in: inventories
              }
            }).populate('card').then(function () {
              var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(dbInventories) {
                var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, inventory;

                return regeneratorRuntime.wrap(function _callee41$(_context41) {
                  while (1) {
                    switch (_context41.prev = _context41.next) {
                      case 0:
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context41.prev = 3;
                        _iterator4 = dbInventories[Symbol.iterator]();

                      case 5:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                          _context41.next = 17;
                          break;
                        }

                        inventory = _step4.value;

                        if (!inventory.transaction) {
                          _context41.next = 10;
                          break;
                        }

                        _context41.next = 10;
                        return inventory.removeReserve();

                      case 10:
                        _context41.next = 12;
                        return inventory.card.remove();

                      case 12:
                        _context41.next = 14;
                        return inventory.remove();

                      case 14:
                        _iteratorNormalCompletion4 = true;
                        _context41.next = 5;
                        break;

                      case 17:
                        _context41.next = 23;
                        break;

                      case 19:
                        _context41.prev = 19;
                        _context41.t0 = _context41['catch'](3);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context41.t0;

                      case 23:
                        _context41.prev = 23;
                        _context41.prev = 24;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                          _iterator4.return();
                        }

                      case 26:
                        _context41.prev = 26;

                        if (!_didIteratorError4) {
                          _context41.next = 29;
                          break;
                        }

                        throw _iteratorError4;

                      case 29:
                        return _context41.finish(26);

                      case 30:
                        return _context41.finish(23);

                      case 31:
                        return _context41.abrupt('return', res.json());

                      case 32:
                      case 'end':
                        return _context41.stop();
                    }
                  }
                }, _callee41, _this14, [[3, 19, 23, 31], [24,, 26, 30]]);
              }));

              return function (_x69) {
                return _ref46.apply(this, arguments);
              };
            }());
            _context42.next = 14;
            break;

          case 7:
            _context42.prev = 7;
            _context42.t0 = _context42['catch'](2);

            console.log('**************ERR IN deleteInventories**********');
            console.log(_context42.t0);

            _context42.next = 13;
            return _errorLog2.default.create({
              method: 'deleteInventories',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context42.t0.stack,
              error: _context42.t0,
              user: req.user._id
            });

          case 13:
            return _context42.abrupt('return', res.status(500).json(_context42.t0));

          case 14:
          case 'end':
            return _context42.stop();
        }
      }
    }, _callee42, this, [[2, 7]]);
  }));

  return function deleteInventories(_x67, _x68) {
    return _ref45.apply(this, arguments);
  };
}();

/**
 * Change users role
 */


var updateRole = exports.updateRole = function () {
  var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(req, res) {
    var userId;
    return regeneratorRuntime.wrap(function _callee43$(_context43) {
      while (1) {
        switch (_context43.prev = _context43.next) {
          case 0:
            userId = req.params.userId;
            _context43.prev = 1;

            _user2.default.findById(userId).then(function (user) {
              user.role = req.params.userRole;
              user.save();
            }).then(function () {
              return res.json();
            });
            _context43.next = 12;
            break;

          case 5:
            _context43.prev = 5;
            _context43.t0 = _context43['catch'](1);

            console.log('**************ERR IN updateRole**********');
            console.log(_context43.t0);

            _context43.next = 11;
            return _errorLog2.default.create({
              method: 'updateRole',
              controller: 'company.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context43.t0.stack,
              error: _context43.t0,
              user: req.user._id
            });

          case 11:
            return _context43.abrupt('return', res.status(500).json(_context43.t0));

          case 12:
          case 'end':
            return _context43.stop();
        }
      }
    }, _callee43, this, [[1, 5]]);
  }));

  return function updateRole(_x70, _x71) {
    return _ref47.apply(this, arguments);
  };
}();

exports.create = create;
exports.updateAutoBuyRates = updateAutoBuyRates;
exports.managerOverride = managerOverride;
exports.getCardsInInventory = getCardsInInventory;
exports.getCardsInReconciliation = getCardsInReconciliation;
exports.getLastReconciliationTime = getLastReconciliationTime;
exports.reconciliationCompleteTime = reconciliationCompleteTime;
exports.doDeleteInventory = doDeleteInventory;
exports.deleteInventory = deleteInventory;
exports.getReconciliationToday = getReconciliationToday;

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

var _inventoryParamCache = require('../inventory/inventoryParamCache.model');

var _inventoryParamCache2 = _interopRequireDefault(_inventoryParamCache);

require('../inventory/liquidationError.model');

require('../log/logs.model');

require('../company/company.model');

require('../card/card.model');

require('../stores/store.model');

require('../reserve/reserve.model');

var _company = require('./company.model');

var _company2 = _interopRequireDefault(_company);

var _companySettings = require('./companySettings.model');

var _companySettings2 = _interopRequireDefault(_companySettings);

var _customer = require('../customer/customer.model');

var _customer2 = _interopRequireDefault(_customer);

var _user = require('../user/user.model');

var _user2 = _interopRequireDefault(_user);

var _inventory = require('../inventory/inventory.model');

var _inventory2 = _interopRequireDefault(_inventory);

var _denialPayment = require('../denialPayment/denialPayment.model');

var _denialPayment2 = _interopRequireDefault(_denialPayment);

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _validation = require('../../helpers/validation');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _batch = require('../batch/batch.model');

var _batch2 = _interopRequireDefault(_batch);

var _receipt = require('../receipt/receipt.model');

var _receipt2 = _interopRequireDefault(_receipt);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _csvWriteStream = require('csv-write-stream');

var _csvWriteStream2 = _interopRequireDefault(_csvWriteStream);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _receipt3 = require('../receipt/receipt.service');

var _receipt4 = _interopRequireDefault(_receipt3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Retailer = require('../retailer/retailer.model');
var Store = require('../stores/store.model');
var BuyRate = require('../buyRate/buyRate.model');
var Reconciliation = require('../reconciliation/reconciliation');
var Card = require('../card/card.model');
var CardUpdate = require('../cardUpdates/cardUpdates.model');
var DeferredBalanceInquiry = require('../deferredBalanceInquiries/deferredBalanceInquiries.model');

var passport = require('passport');

var isValidObjectId = _mongoose2.default.Types.ObjectId.isValid;


/**
 * General error response
 */
var generalError = function generalError(res, err) {
  var errStr = JSON.stringify(err);
  errStr = errStr.replace(/hashedPassword/g, 'password');
  err = JSON.parse(errStr);
  return res.status(400).json(err);
};

/**
 * Get all supplier companies
 */
exports.getAll = function (req, res) {
  _company2.default.find({}).then(function (companies) {
    return res.json(companies);
  }).catch(function (err) {
    console.log('**************ERR IN GET ALL SUPPLIER COMPANIES**********');
    console.log(err);
    return res.status(500).json(err);
  });
};

/**
 * Search for companies
 * restriction: 'admin'
 */
exports.search = function (req, res) {
  var _this = this;

  _company2.default.find({ name: new RegExp(req.body.$query) }).populate('users').then(function (err, companies) {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json({ companies: companies });
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log('**************ERR IN COMPANY SEARCH**********');
              console.log(err);

              _context.next = 4;
              return _errorLog2.default.create({
                method: 'search',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * Allow/disallow API access
 */
exports.setApiAccess = function (req, res) {
  var id = req.params.companyId;
  var api = req.params.api;
  _company2.default.findById(id, function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err, company) {
      var access;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              access = !company.apis[api];
              // No company

              if (company) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return', res.status(500).json({
                error: 'company not found'
              }));

            case 3:
              if (!err) {
                _context2.next = 7;
                break;
              }

              _context2.next = 6;
              return _errorLog2.default.create({
                method: 'setApiAccess',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 6:
              return _context2.abrupt('return', res.json(err));

            case 7:
              company.apis[api] = access;
              company.save(function (err) {
                if (err) {
                  return validationError(res, err);
                }
                return res.status(200).json({
                  access: access
                });
              });

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }());
};

/**
 * Create a new supplier company
 */
function create(req, res) {
  var _this2 = this;

  var _req$body$powerSeller = req.body.powerSeller,
      powerSeller = _req$body$powerSeller === undefined ? false : _req$body$powerSeller;

  var company = new _company2.default(req.body);
  var savedCompany = void 0,
      savedUser = void 0;
  company.save()
  // Create user
  .then(function (company) {
    savedCompany = company;
    // Successful save, create user
    var user = new _user2.default(req.body.contact);
    user.company = company._id;
    user.role = 'corporate-admin';
    return user.save();
  })
  // Add user to company users
  .then(function (user) {
    savedUser = user;
    company.users.push(user._id);
    return company.save();
  })
  // Add company ID to user
  .then(function (company) {
    savedUser.company = company._id;
    return savedUser.save();
  }).then(function () {
    if (powerSeller) {
      var store = new Store({
        name: 'default',
        companyId: savedCompany._id,
        users: [savedUser._id]
      });
      return store.save();
    }
  }).then(function (store) {
    if (store) {
      savedCompany.stores = [store._id];
      return savedCompany.save();
    }
  }).then(function () {
    return res.status(200).send();
  }).catch(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              console.log('**************ERR IN CREATE NEW SUPPLIER COMPANY**********');
              console.log(err);

              _context3.next = 4;
              return _errorLog2.default.create({
                method: 'create',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:

              // Remove anything written on error
              if (savedCompany) {
                savedCompany.remove();
              }
              if (savedUser) {
                savedUser.remove();
              }
              return _context3.abrupt('return', generalError(res, err));

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this2);
    }));

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  }());
};

/**
 * Get company
 */
exports.getCompany = function (req, res) {
  var user = req.user;
  var companyId = req.params.companyId;
  var company = void 0;
  // Check to make sure we're retrieving the right company
  if (user.company && user.company.toString() !== companyId) {
    return res.status(401).json({
      message: 'unauthorized'
    });
  }
  // Retrieve company settings
  _company2.default.findById(req.params.companyId).then(function (dbCompany) {
    if (!dbCompany) {
      throw Error('Could not find company');
    }
    company = dbCompany;
    return company.getSettings();
  }).then(function (settings) {
    company = company.toObject();
    company.settings = settings;
    return res.json(company);
  }).catch(function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log('**************ERR IN GET COMPANY**********');
              console.log(err);

              _context4.next = 4;
              return _errorLog2.default.create({
                method: 'getCompany',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context4.abrupt('return', res.status(400).json(err));

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    }));

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  }());
};function setMinimumAdjustedDenial(settings, setting) {
  if (setting === true) {
    // Default to 0.1
    settings[key] = 0.1;
  } else if (setting === false) {
    settings[key] = 0;
  } else {
    var value = parseFloat(setting);
    settings[key] = !isNaN(value) ? value : settings[key];
  }
}function updateAutoBuyRates(req, res) {
  var _this3 = this;

  var companyId = req.params.companyId;
  var body = req.body;
  var user = req.user;
  // Auth
  if (user.company.toString() !== companyId) {
    return res.status(401).json();
  }
  _companySettings2.default.findOne({ company: companyId }).then(function (settings) {
    return settings.getAutoBuyRates();
  }).then(function (rates) {
    _lodash2.default.forEach(body, function (rate, key) {
      // Rate
      if (/_\d{2}/.test(key)) {
        rates[key] = rate / 100;
      }
    });
    return rates.save();
  }).then(function () {
    return _company2.default.findById(companyId).populate({
      path: 'settings',
      populate: {
        path: 'autoBuyRates',
        model: 'AutoBuyRate'
      }
    });
  }).then(function (company) {
    return res.json(company);
  }).catch(function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              console.log('**************ERR IN UPDATE RATES**********');
              console.log(err);

              _context7.next = 4;
              return _errorLog2.default.create({
                method: 'updateSettings',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context7.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this3);
    }));

    return function (_x10) {
      return _ref7.apply(this, arguments);
    };
  }());
}

/**
 * Perform a manager override credentials
 * @param req
 * @param res
 */
function managerOverride(req, res) {
  var companyId = req.params.companyId;
  passport.authenticate('local', function (err, user) {
    if (err) {
      return res.status(401).json(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Incorrect credentials' });
    }
    if (user.role === 'admin') {
      return res.json({
        admin: true
      });
    }
    // Check we're on the right company
    if (user.company.toString() === companyId && ['corporate-admin', 'manager', 'admin'].indexOf(user.role) !== -1) {
      return res.json();
    }
    return res.status(401).json();
  })(req, res);
}

/**
 * Create a new store
 *
 * @todo This is a copy of the company creation method above. .bind the above function to avoid this code replication
 */
exports.newStore = function (req, res) {
  var body = req.body;
  var savedCompany = null;
  var savedUser = null;
  var savedStore = null;
  var store = null;
  body.companyId = req.user.company;
  store = new Store(body);
  return store.save()
  // Create user
  .then(function (store) {
    savedStore = store;
    // Successful save, create user
    var user = new _user2.default(body.contact);
    user.store = store._id;
    user.role = 'employee';
    return user.save();
  })
  // Add user to store users
  .then(function (user) {
    savedUser = user;
    store.users.push(user._id);
    return store.save();
  })
  // Add store ID to user
  .then(function (store) {
    savedUser.store = store._id;
    savedUser.company = store.companyId;
    return savedUser.save();
  })
  // Get company
  .then(function () {
    return _company2.default.findById(store.companyId);
  })
  // Add user and store to company
  .then(function (company) {
    savedCompany = company;
    // Add store to company
    company.stores.push(savedStore._id);
    // Add user to company
    company.users.push(savedUser._id);
    return company.save();
  }).then(function () {
    return res.status(200).send({ _id: savedStore._id });
  })
  // Remove anything written on error
  .catch(function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(err) {
      var storeIndex, userIndex;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _errorLog2.default.create({
                method: 'newStore',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              storeIndex = savedCompany ? savedCompany.stores.indexOf(savedStore._id) : -1;
              userIndex = savedCompany ? savedCompany.users.indexOf(savedUser._id) : -1;
              // Remove store

              if (savedStore) {
                savedStore.remove();
              }
              // Remove user
              if (savedUser) {
                savedUser.remove();
              }
              if (savedCompany) {
                // Remove store
                if (storeIndex !== -1) {
                  savedCompany.stores.splice(storeIndex, 1);
                }
                // Remove user
                if (userIndex !== -1) {
                  savedCompany.users.splice(userIndex, 1);
                }
                savedCompany.save();
              }
              console.log('**************ERR IN NEW STORE**********');
              console.log(err);
              return _context8.abrupt('return', generalError(res, err));

            case 10:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, undefined);
    }));

    return function (_x11) {
      return _ref8.apply(this, arguments);
    };
  }());
};

/**
 * Retrieve stores for a company
 */
exports.getStores = function (req, res) {
  var companyId = req.params.companyId;
  // Retrieve stores
  Store.find({ companyId: companyId }).populate('users').then(function (stores) {
    return res.json(stores);
  }).catch(function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(err) {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              console.log('**************ERR IN GET STORES**********');
              console.log(err);

              _context9.next = 4;
              return _errorLog2.default.create({
                method: 'getStores',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context9.abrupt('return', res.status(400).json(err));

            case 5:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, undefined);
    }));

    return function (_x12) {
      return _ref9.apply(this, arguments);
    };
  }());
};

/**
 * Get store details
 */
exports.getStoreDetails = function (req, res) {
  Store.findOne({ _id: req.params.storeId, companyId: req.user.company }).populate('users').then(function (store) {
    return res.json(store);
  }).catch(function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              console.log('**************ERR IN GET STORE DETAILS**********');
              console.log(err);

              _context10.next = 4;
              return _errorLog2.default.create({
                method: 'getStoreDetails',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context10.abrupt('return', res.status(400).json(err));

            case 5:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, undefined);
    }));

    return function (_x13) {
      return _ref10.apply(this, arguments);
    };
  }());
};

/**
 * Update a store
 */
exports.updateStore = function (req, res) {
  var details = req.body;
  Store.findById(details.storeId).then(function (store) {
    Object.assign(store, details);
    return store.save();
  }).then(function (store) {
    return res.json(store);
  }).catch(function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(err) {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              console.log('**************ERR IN UPDATE STORE**********');
              console.log(err);

              _context11.next = 4;
              return _errorLog2.default.create({
                method: 'updateStore',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context11.abrupt('return', res.status(400).json(err));

            case 5:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, undefined);
    }));

    return function (_x14) {
      return _ref11.apply(this, arguments);
    };
  }());
};

/**
 * Create a new employee
 */
exports.newEmployee = function (req, res) {
  var body = req.body;
  var user = new _user2.default(body);
  var savedUser = void 0,
      savedStore = void 0;
  var _req$body = req.body,
      companyId = _req$body.companyId,
      storeId = _req$body.storeId;

  var currentUser = req.user;
  // Check for permissions
  if (currentUser.role === 'manager' && storeId !== currentUser.store.toString()) {
    return res.status(401).json();
  }
  if (currentUser.role === 'corporate-admin' && companyId !== currentUser.company.toString()) {
    return res.status(401).json();
  }

  user.company = companyId;
  user.store = storeId;
  user.save()
  // Create user
  .then(function (newUser) {
    savedUser = newUser;
    return Store.findById(savedUser.store);
  })
  // Add user to store
  .then(function (store) {
    savedStore = store;
    store.users.push(savedUser._id);
    return store.save();
  })
  // Success
  .then(function () {
    return res.json(savedUser);
  }).catch(function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(err) {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _errorLog2.default.create({
                method: 'newEmployee',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:

              if (savedUser) {
                savedUser.remove();
              }
              if (savedStore) {
                savedStore.remove();
              }
              console.log('**************ERR IN NEW EMPLOYEE**********');
              console.log(err);
              return _context12.abrupt('return', res.status(400).json(err));

            case 7:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, undefined);
    }));

    return function (_x15) {
      return _ref12.apply(this, arguments);
    };
  }());
};

/**
 * Pull values on delete store
 * @param companyId
 * @param storeId
 * @param users
 */
function cleanupOnStoreDelete(companyId, storeId, users) {
  return _company2.default.update({
    _id: companyId
  }, {
    $pull: {
      stores: storeId,
      users: { $in: users }
    }
  });
}

/**
 * Delete a store
 */
exports.deleteStore = function (req, res) {
  var storeId = req.params.storeId;

  var companyId = req.user.company;
  var userPromises = [];
  var storeUsers = [];
  var savedStore = void 0;
  // Find store
  Store.findOne({ _id: storeId, companyId: companyId }).populate('users').then(function (store) {
    if (!store) {
      res.status(404).json({ err: 'Store not found' });
      throw 'notFound';
    }
    // Keep reference to store
    savedStore = store;
    // Remove all users
    store.users.forEach(function (user) {
      storeUsers.push(user._id);
      userPromises.push(user.remove());
    });
    // Once users are gone, remove store
    return Promise.all(userPromises);
  })
  // Remove store and users from company
  .then(function () {
    return cleanupOnStoreDelete(companyId, storeId, storeUsers);
  }).then(function () {
    // Remove store
    return savedStore.remove();
  }).then(function () {
    // success
    return res.json();
  }).catch(function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(err) {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _errorLog2.default.create({
                method: 'deleteStore',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              if (!(err === 'notFound')) {
                _context13.next = 4;
                break;
              }

              return _context13.abrupt('return');

            case 4:
              console.log('**************ERR IN DELETE STORE**********');
              console.log(err);
              return _context13.abrupt('return', res.status(500).json(err));

            case 7:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, undefined);
    }));

    return function (_x16) {
      return _ref13.apply(this, arguments);
    };
  }());
};

/**
 * Delete an employee from a store
 */
exports.deleteEmployee = function (req, res) {
  var params = req.params;
  var currentUser = req.user;
  // Find employee
  _user2.default.findById(params.employeeId)
  // Remove employee
  .then(function (employee) {
    if (currentUser.role === 'corporate-admin' && currentUser.company.toString() !== employee.company.toString()) {
      throw 'permissions';
    }
    if (currentUser.role === 'manager' && currentUser.store.toString() !== employee.store.toString()) {
      throw 'permissions';
    }
    return employee.remove();
  })
  // Get store
  .then(function () {
    return Store.findById(params.storeId);
  })
  // Remove employee from store
  .then(function (store) {
    store.users.splice(store.users.indexOf(params.employeeId), 1);
    store.save();
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(err) {
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _errorLog2.default.create({
                method: 'deleteEmployee',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 2:
              if (!(err === 'permissions')) {
                _context14.next = 6;
                break;
              }

              return _context14.abrupt('return', res.status(401).json());

            case 6:
              console.log('**************ERR IN DELETE EMPLOYEE**********');
              console.log(err);
              return _context14.abrupt('return', res.status(500).json(err));

            case 9:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, undefined);
    }));

    return function (_x17) {
      return _ref14.apply(this, arguments);
    };
  }());
};

/**
 * Update a company
 */
exports.updateCompany = function (req, res) {
  var companyId = req.params.companyId;
  var body = req.body;
  // Find company
  _company2.default.findById(companyId).then(function (company) {
    // Update
    Object.assign(company, body);
    return company.save();
  })
  // Success
  .then(function (company) {
    return res.json(company);
  })
  // Failure
  .catch(function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(err) {
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              console.log('**************ERR IN UPDATE COMPANY**********');
              console.log(err);

              _context15.next = 4;
              return _errorLog2.default.create({
                method: 'updateCompany',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context15.abrupt('return', res.status(400).json(err));

            case 5:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, undefined);
    }));

    return function (_x18) {
      return _ref15.apply(this, arguments);
    };
  }());
};

/**
 * Get store with buy rates
 */
exports.getStoreWithBuyRates = function (req, res) {
  var id = req.params.storeId;
  Store.findById(id).populate('buyRateRelations').then(function (store) {
    return res.json(store);
  }).catch(function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(err) {
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              console.log('**************ERR IN GET STORE WITH BUY RATES**********');
              console.log(err);

              _context16.next = 4;
              return _errorLog2.default.create({
                method: 'getStoreWithBuyRates',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context16.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, undefined);
    }));

    return function (_x19) {
      return _ref16.apply(this, arguments);
    };
  }());
};

/**
 * Update store buy rates for a specific retailer
 */
exports.updateStoreBuyRates = function (req, res) {
  var _req$params = req.params,
      retailerId = _req$params.retailerId,
      storeId = _req$params.storeId;
  // Get percentage buy rates

  var buyRate = parseFloat(req.body.buyRate) / 100;
  var storeRecord = void 0,
      retailerRecord = void 0,
      existingBuyRateId = void 0,
      buyRateId = void 0;
  // Look for existing buy rate relationship
  BuyRate.findOne({ retailerId: retailerId, storeId: storeId }).then(function (buyRateRecord) {
    // No buy rate set
    if (!buyRateRecord) {
      buyRateRecord = new BuyRate({ storeId: storeId, retailerId: retailerId, buyRate: buyRate });
      return buyRateRecord.save();
    }
    existingBuyRateId = buyRateRecord._id;
    // Update existing buy rate
    return BuyRate.update({ _id: buyRateRecord._id }, { $set: { buyRate: buyRate } });
  })
  // Get buy rate id, and then store
  .then(function (buyRate) {
    buyRateId = buyRate._id || existingBuyRateId;
    return Store.findById(storeId);
  })
  // Store buy rate ID on store
  .then(function (store) {
    storeRecord = store;
    // Add relationship if necessary
    if (!Array.isArray(store.buyRateRelations)) {
      store.buyRateRelations = [];
      store.buyRateRelations.push(buyRateId);
      return store.save();
    }
    // Relationships exist, but not this one
    if (store.buyRateRelations.indexOf(buyRateId) === -1) {
      store.buyRateRelations.push(buyRateId);
      return store.save();
    }
  })
  // Get retailer
  .then(function () {
    return Retailer.findById(retailerId);
  })
  // Store buy rate ID on retailer
  .then(function (retailer) {
    retailerRecord = retailer;
    // Add relationship if necessary
    if (!Array.isArray(retailer.buyRateRelations)) {
      retailer.buyRateRelations = [];
      retailer.buyRateRelations.push(buyRateId);
      return retailer.save();
    }
    // Relationships exist, but not this one
    if (!Array.isArray(retailer.buyRateRelations) || retailer.buyRateRelations.indexOf(buyRateId) === -1) {
      retailer.buyRateRelations.push(buyRateId);
      return retailer.save();
    }
  })
  // Return buy rate
  .then(function () {
    return res.json(buyRate);
  }).catch(function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(err) {
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              console.log('**************UPDATE STORE BUY RATES ERR**********');
              console.log(err);

              _context17.next = 4;
              return _errorLog2.default.create({
                method: 'updateStoreBuyRates',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:

              res.status(500).json(err);

            case 5:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, undefined);
    }));

    return function (_x20) {
      return _ref17.apply(this, arguments);
    };
  }());
};

/**
 * Get cards in inventory
 * @param req
 * @param res
 */
function getCardsInInventory(req, res) {
  var _this4 = this;

  var params = req.params;
  var findParams = {
    company: params.companyId,
    reconciliation: { $exists: false }
  };
  // Search for inventories for this store
  if (params.storeId && isValidObjectId(params.storeId)) {
    findParams.store = params.storeId;
  }

  var companySettings = void 0;

  // Can't use Company.findById and Inventory.find with Promise.all because
  // we want to call company.getSettings()
  _company2.default.findById(params.companyId).then(function (company) {
    if (company) {
      return company.getSettings();
    }

    throw 'companyNotFound';
  }).then(function (settings) {
    companySettings = settings;

    return _inventory2.default.find(findParams).populate('card').populate('retailer').populate('customer').sort({ created: -1 });
  }).then(function (inventories) {
    if (['manager', 'employee'].indexOf(req.user.role) !== -1) {
      if (companySettings.useAlternateGCMGR) {
        inventories = inventories.map(function (inventory) {
          inventory.card.number = inventory.card.getLast4Digits();
          return inventory;
        });
      }
    }

    return res.json(inventories);
  }).catch(function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(err) {
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              console.log('**************ERR IN GET CARDS IN INVENTORY**********');
              console.log(err);

              _context18.next = 4;
              return _errorLog2.default.create({
                method: 'getCardsInInventory',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context18.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, _this4);
    }));

    return function (_x21) {
      return _ref18.apply(this, arguments);
    };
  }());
}

/**
 * Get cards in reconciliation
 *
 * @todo Update this, I can't be retrieving all reconciliations and then filtering, need to determine the query for just
 * retrieving inventories that aren't complete
 * @param req
 * @param res
 */
function getCardsInReconciliation(req, res) {
  var _this5 = this;

  var params = req.params;
  // Retrieve
  _inventory2.default.find({
    store: params.storeId,
    company: params.companyId,
    reconciliation: { $exists: true }
  }).populate('card').populate('retailer').populate('customer').populate('reconciliation').sort({ created: -1 }).then(function (cards) {
    cards = cards.filter(function (card) {
      if (card && card.reconciliation) {
        return !card.reconciliation.reconciliationComplete;
      }
      return false;
    });
    return res.json(cards);
  }).catch(function () {
    var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(err) {
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              console.log('**************ERR IN GET CARDS IN RECONCILIATION**********');
              console.log(err);

              _context19.next = 4;
              return _errorLog2.default.create({
                method: 'getCardsInReconciliation',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context19.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context19.stop();
          }
        }
      }, _callee19, _this5);
    }));

    return function (_x22) {
      return _ref19.apply(this, arguments);
    };
  }());
}

/**
 * Get the last time this store was reconciled
 */
function getLastReconciliationTime(req, res) {
  var _this6 = this;

  var params = req.params;
  Store.findById(params.storeId).then(function (store) {
    return res.json({ reconciledLast: store.reconciledTime || null });
  }).catch(function () {
    var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(err) {
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              console.log('**************ERR IN GET LAST RECONCILIATION TIME**********');
              console.log(err);

              _context20.next = 4;
              return _errorLog2.default.create({
                method: 'getLastReconciliationTime',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context20.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context20.stop();
          }
        }
      }, _callee20, _this6);
    }));

    return function (_x23) {
      return _ref20.apply(this, arguments);
    };
  }());
}

/**
 * Get the last time reconciliation was completed for this store
 */
function reconciliationCompleteTime(req, res) {
  var _this7 = this;

  var params = req.params;
  Store.findById(params.storeId).then(function (store) {
    return res.json({ reconcileCompleteTime: store.reconcileCompleteTime || null });
  }).catch(function () {
    var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(err) {
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              console.log('**************ERR IN RECONCILIATION COMPLETE TIME**********');
              console.log(err);

              _context21.next = 4;
              return _errorLog2.default.create({
                method: 'reconciliationCompleteTime',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context21.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context21.stop();
          }
        }
      }, _callee21, _this7);
    }));

    return function (_x24) {
      return _ref21.apply(this, arguments);
    };
  }());
}function doDeleteInventory(inventoryId) {
  var inventory = void 0,
      card = void 0;
  return _inventory2.default.findById(inventoryId)
  // Get inventory
  .then(function (thisInventory) {
    inventory = thisInventory;
    // Get card
    return Card.findById(inventory.card);
  }).then(function (thisCard) {
    // Save reference to card
    card = thisCard;
    // Remove all card updates
    return CardUpdate.remove({
      _id: {
        $in: card.updates
      }
    });
  })
  // Remove all deferred for this card
  .then(function () {
    return DeferredBalanceInquiry.remove({
      card: card._id
    });
  })
  // Remove reconciliations
  .then(function () {
    return Reconciliation.remove({
      _id: inventory.reconciliation
    });
  })
  // Remove inventory
  .then(function () {
    return inventory.remove();
  })
  // Remove card
  .then(function () {
    return card.remove();
  });
}

/**
 * Delete an inventory record
 * @param req
 * @param res
 */
function deleteInventory(req, res) {
  var _this9 = this;

  // Delete this inventory ID
  doDeleteInventory(req.params.inventoryId).then(function () {
    return res.json('deleted');
  }).catch(function () {
    var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(err) {
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              console.log('**************ERR IN DELETE INVENTORY**********');
              console.log(err);

              _context25.next = 4;
              return _errorLog2.default.create({
                method: 'deleteInventory',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context25.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, _this9);
    }));

    return function (_x30) {
      return _ref25.apply(this, arguments);
    };
  }());
}function getReconciliationToday(req, res) {
  var _this11 = this;

  var storeParam = req.params.storeId;
  var companyId = req.user.company;
  var dbStores = [];
  var thisStore = '';
  if (storeParam === 'all') {
    thisStore = '';
  } else if (isValidObjectId(storeParam)) {
    thisStore = storeParam;
  } else {
    thisStore = req.user.store;
  }
  var params = req.params;
  var dayBegin = (0, _moment2.default)(params.today).startOf('day');
  var dayEnd = (0, _moment2.default)(params.today).endOf('day');
  var dbUser = void 0,
      dbReconciliations = void 0;
  var promise = void 0;
  if (thisStore === '') {
    promise = Store.find({
      companyId: companyId
    });
  } else {
    promise = new Promise(function (resolve) {
      return resolve();
    });
  }
  promise.then(function (stores) {
    if (stores) {
      dbStores = stores.map(function (store) {
        return store._id.toString();
      });
    }
    // Find user, company, store
    return _user2.default.findById(req.user._id).populate('store').populate('company');
  }).then(function (user) {
    dbUser = user;

    return Promise.all([dbUser.company.getSettings(), Reconciliation.find({
      reconciliationCompleteUserTime: {
        $gt: dayBegin.toISOString(),
        $lt: dayEnd.toISOString()
      }
    }).populate({
      path: 'inventory',
      populate: [{
        path: 'card',
        model: 'Card'
      }, {
        path: 'retailer',
        model: 'Retailer'
      }, {
        path: 'customer',
        model: 'Customer'
      }]
    })]);
  }).then(function (_ref28) {
    var _ref29 = _slicedToArray(_ref28, 2),
        companySettings = _ref29[0],
        reconciliations = _ref29[1];

    // Only return reconciliations for this store
    dbReconciliations = reconciliations.filter(function (thisReconciliation) {
      var storeId = void 0;
      try {
        storeId = thisReconciliation.inventory.store.toString();
      } catch (e) {
        storeId = '';
      }
      if (!thisStore) {
        return dbStores.indexOf(storeId) > -1;
      }
      return storeId === thisStore.toString();
    });

    dbReconciliations = dbReconciliations.map(function (reconciliation) {
      if (companySettings.useAlternateGCMGR && ['manager', 'employee'].indexOf(dbUser.role) !== -1) {
        reconciliation.inventory.card.number = reconciliation.inventory.card.getLast4Digits();
      }

      return reconciliation;
    });

    if (dbReconciliations.length) {
      // Get batch
      if (dbReconciliations[0].inventory && dbReconciliations[0].inventory.batch) {
        return _batch2.default.findById(dbReconciliations[0].inventory.batch);
      }
    } else {
      return false;
    }
  }).then(function (batch) {
    return res.json({
      reconciliations: dbReconciliations,
      user: dbUser,
      batch: batch ? batch : {}
    });
  }).catch(function () {
    var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(err) {
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              console.log('**************ERROR IN RECONCILIATION TODAY**********');
              console.log(err);

              _context28.next = 4;
              return _errorLog2.default.create({
                method: 'getReconciliationToday',
                controller: 'company.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err,
                user: req.user._id
              });

            case 4:
              return _context28.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, _this11);
    }));

    return function (_x34) {
      return _ref30.apply(this, arguments);
    };
  }());
}

/**
 * Retrieve date range params for activity
 * @param params
 */
function getActivityDateRange(params) {
  var beginDate = params.beginDate,
      endDate = params.endDate,
      beginEnd = params.beginEnd,
      date = params.date;

  var findParams = {};
  var begin = beginDate ? _moment2.default.utc(beginDate, 'MM-DD-YYYY').startOf('day') : (0, _moment2.default)().subtract(100, 'years');
  var end = endDate ? _moment2.default.utc(endDate, 'MM-DD-YYYY').endOf('day') : (0, _moment2.default)().add(100, 'years');
  if (beginDate && endDate) {
    findParams.created = { $gt: begin.toDate(), $lt: end.toDate() };
    // Begin date only
  } else if (beginEnd === 'begin' && date) {
    findParams.created = { $gt: begin.toDate() };
  }
  if (typeof params.companyId !== 'undefined') {
    findParams.company = params.companyId;
  }
  if (_typeof(params.rejected) && params.rejected === 'true') {
    params.rejected = true;
  }
  // Only sold
  findParams.soldToLiquidation = true;

  return findParams;
}

/**
 * Expose inventory values
 * @param valuesToExpose
 * @param inventory
 * @returns {*}
 */
function exposeInventoryValues(valuesToExpose, inventory) {
  _lodash2.default.forEach(valuesToExpose, function (value, key) {
    if (typeof value === 'string') {
      inventory[key] = _lodash2.default.get(inventory, value, '');
    } else if (_lodash2.default.isPlainObject(value)) {
      inventory[key] = _lodash2.default.get(inventory, value.path, value.default);
      // Modification function
      if (value.modify) {
        inventory[key] = value.modify(inventory[key]);
      }
    }
  });
  return inventory;
}

/**
 * Inventory map reduce params
 */
var inventoryMapReduceParams = {
  map: function map() {
    if (typeof counter !== 'number' || counter >= begin && counter < end) {
      var verifiedBalance = typeof this.verifiedBalance === 'number' ? this.verifiedBalance : 0;
      var claimedBalance = typeof this.balance === 'number' ? this.balance : 0;
      var actualBalance = verifiedBalance || claimedBalance;
      emit('balance', claimedBalance);
      var buyRate = typeof this.buyRate === 'number' ? this.buyRate : 0;
      emit('buyRate', buyRate);
      var buyAmount = typeof this.buyAmount === 'number' ? this.buyAmount : 0;
      emit('buyAmount', buyAmount);
      // CQ paid
      var margin = this.margin || 0.03;
      var liquidationSoldFor = this.liquidationSoldFor || 0;
      var rateThisInventory = typeof this.liquidationRate === 'number' ? this.liquidationRate : 0;
      if (!rateThisInventory && claimedBalance) {
        rateThisInventory = liquidationSoldFor / claimedBalance;
      }
      var cqPaid = actualBalance * (rateThisInventory - margin);

      if (this.isTransaction) {
        cqPaid = this.transaction.cqPaid;
      }

      if (typeof cqPaid !== 'number' || cqPaid < 0) {
        cqPaid = 0;
      }
      // Service fee (CQ Paid for corporate, SMP paid for admin)
      var _serviceFee = cqPaid * 0.0075;
      emit('serviceFee', _serviceFee);
      emit('cqPaid', cqPaid);
      // Sold for
      emit('soldFor', liquidationSoldFor);

      if (this.isTransaction) {
        emit('netAmount', this.transaction.netPayout);
      } else {
        // Company ACH search including a deduction
        if (cqAchSearch && this.deduction) {
          emit('netAmount', cqPaid * -1);
          return;
        } else {
          emit('netAmount', cqPaid - _serviceFee);
        }
      }
      // Verified balance
      emit('verifiedBalance', verifiedBalance);
      // Paid for already
      var cqHasPaid = typeof this.cqAch !== 'undefined';
      // Has no CQ ACH
      emit('cqOwes', cqHasPaid ? 0 : cqPaid - _serviceFee);
      // The amount outstanding which CQ has yet to pay. If 4 cards bought for $50 each, and we've paid for 3, this should be $50
      emit('outstandingBuyAmount', cqHasPaid ? 0 : buyAmount);
    }
    if (typeof counter === 'number') {
      counter++;
    }
  },
  reduce: function reduce(k, v) {
    switch (k) {
      case 'buyRate':
        return Array.sum(v) / v.length;
        break;
      default:
        return Array.sum(v);
        break;
    }
  },
  scope: {
    counter: 0,
    begin: 0,
    end: 0,
    corporate: false
  }
};

/**
 * Create param map as an intermediate step for getting search params
 * @param map Incoming map
 * @param inventory Current inventory
 * @param inventoryParam
 * @param displayParam
 */
function createParamMap(map, inventory, inventoryParam) {
  var _map$inventory$invent;

  var displayParam = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'name';

  map[inventory[inventoryParam]._id] = (_map$inventory$invent = {}, _defineProperty(_map$inventory$invent, displayParam, inventory[inventoryParam][displayParam]), _defineProperty(_map$inventory$invent, '_id', inventory[inventoryParam]._id), _map$inventory$invent);
  return map;
}function calculateValues(inventory, companyId, rejected, totalRejections) {
  if (!_lodash2.default.isPlainObject(inventory)) {
    inventory = inventory.toObject();
  }
  inventory.verifiedBalance = typeof inventory.verifiedBalance === 'number' ? inventory.verifiedBalance : null;
  inventory.claimedBalance = typeof inventory.balance === 'number' ? inventory.balance : 0;
  inventory.actualBalance = inventory.verifiedBalance || inventory.claimedBalance;
  inventory.buyRate = typeof inventory.buyRate === 'number' ? inventory.buyRate : 0;
  inventory.buyAmount = typeof inventory.buyAmount === 'number' ? inventory.buyAmount : 0;
  inventory.margin = inventory.margin || 0.03;
  inventory.liquidationSoldFor = inventory.liquidationSoldFor || 0;
  if (inventory.credited || inventory.rejected) {
    inventory.liquidationSoldFor = inventory.verifiedBalance * inventory.liquidationRate;
  }
  inventory.rateThisInventory = typeof inventory.liquidationRate === 'number' ? inventory.liquidationRate : 0;
  if (!inventory.rateThisInventory && inventory.actualBalance) {
    inventory.rateThisInventory = inventory.liquidationSoldFor / inventory.actualBalance;
  }
  var rateAfterMargin = inventory.rateThisInventory > inventory.margin ? inventory.rateThisInventory - inventory.margin : 0;
  var serviceFeeRate = inventory.serviceFee || _environment2.default.serviceFee;
  // Transactions handled differently
  if (inventory.isTransaction) {
    inventory.cqPaid = inventory.transaction.cqPaid;
    inventory.displayMargin = true;
    inventory.companyMargin = inventory.serviceFee + inventory.margin;
  } else {
    inventory.cqPaid = inventory.actualBalance * rateAfterMargin;
    inventory.serviceFee = inventory.cqPaid * serviceFeeRate;
    inventory.netAmount = inventory.cqPaid - inventory.serviceFee;
  }
  // Company margin
  if (typeof inventory.verifiedBalance === 'number' && inventory.verifiedBalance < inventory.balance) {
    inventory.companyMargin = null;
    inventory.displayMargin = false;
  } else if (!inventory.isTransaction) {
    inventory.companyMargin = (inventory.netAmount - inventory.buyAmount) / inventory.netAmount * 100;
    inventory.displayMargin = true;
  }
  // Company activity
  inventory.corpRateThisInventory = rateAfterMargin;

  var smps = _environment.smpNames;
  // SMP
  inventory.smp = smps[inventory.smp];
  if (inventory.activityStatus) {
    if (companyId) {
      inventory.activityStatus = _environment2.default.statusDisplay[inventory.activityStatus];
    }
  } else {
    inventory.activityStatus = 'Not shipped';
  }

  if (rejected) {
    // Original buy amount
    // const buyAmount = inventory.buyAmount;
    // Buy amount after adjustment
    inventory.realBuyAmount = inventory.buyRate * inventory.verifiedBalance;
    inventory.amountOwed = inventory.buyAmount - inventory.realBuyAmount;
    // Begin calculating for this customer
    if (!totalRejections.user[inventory.customer._id.toString()]) {
      totalRejections.user[inventory.customer._id.toString()] = {
        owed: 0
      };
    }
    totalRejections.user[inventory.customer._id.toString()].owed += inventory.amountOwed;
  }
  return inventory;
}

/**
 * Allow for search on multiple values for the listed items
 * @param query
 * @return {*}
 */
function allowSearchOnMultipleValues(query) {
  var searchMultiple = ['transactionPrefix', 'retailer', 'number', 'pin', 'balance', 'verifiedBalance', 'orderNumber', 'smpAch', 'cqAch', 'adminActivityNote'];
  var splitQuery = Object.assign({}, query);
  _lodash2.default.forEach(query, function (item, key) {
    // Allow for split values
    if (searchMultiple.indexOf(key) > -1 && query[key]) {
      splitQuery[key] = query[key].split(',').join('|').trim();
      // Trim values which cannot be split
    } else if (typeof query[key] === 'string') {
      splitQuery[key] = query[key].trim();
    }
  });
  return splitQuery;
}

/**
 * Query activity
 * @param dateParams Date range
 * @param query
 * @param limit
 * @param skip
 * @param count Return only count
 */
function queryActivity(dateParams, query, limit, skip) {
  var count = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  var promises = [];
  // Sort by created by default
  var sort = { created: 1 };
  // Allow for search on multiple values for specific inputs
  query = allowSearchOnMultipleValues(query);
  // Partial object ID match
  if (query._id) {
    query.$where = 'this._id.toString().match(/' + query._id + '/i) || this.card.toString().match(/' + query._id + '/i)';
    delete query._id;
  }
  if (query.balance) {
    query.balance = parseFloat(query.balance);
  }
  if (query.type) {
    if (!(query.type instanceof RegExp)) {
      query.type = new RegExp(query.type, 'i');
    }
  }
  if (query.balance) {
    var balance = parseFloat(query.balance);
    query.$where = 'String(this.balance).match(/^' + balance + '/) != null';
    delete query.balance;
  }
  if (typeof query.orderNumber === 'string') {
    query.orderNumber = new RegExp('^' + query.orderNumber, 'i');
  }
  if (typeof query.liquidationSoldFor === 'string') {
    query.orderNumber = new RegExp('^' + query.orderNumber, 'i');
  }
  if (typeof query.smpAch === 'string') {
    query.smpAch = new RegExp('^' + query.smpAch, 'i');
  }
  if (typeof query.cqAch === 'string') {
    query.$or = [{ cqAch: new RegExp('^' + query.cqAch, 'i') }, { deduction: new RegExp('^' + query.cqAch, 'i') }];
    delete query.cqAch;
  }
  // Blank
  if (!query.activityStatus && (!query.company || query.isAdmin)) {
    query.activityStatus = { $exists: false };
  }
  // Search any
  if (query.activityStatus === '-') {
    // Don't modify original query object, or it'll mess up count`
    query = Object.assign({}, query);
    delete query.activityStatus;
  }
  // Sort by system time for admin
  if (_typeof(query.isAdmin)) {
    delete query.isAdmin;
    sort = { systemTime: 1 };
  }
  // Transactions
  if (query.isTransactions) {
    query.transaction = { $exists: query.isTransactions === 'true' };
    delete query.isTransactions;
  }
  // search by verified balance
  if (query.verifiedBalance) {
    var verifiedBalance = parseFloat(query.verifiedBalance);
    query.$where = 'String(this.verifiedBalance).match(/^' + verifiedBalance + '/) != null';
    delete query.verifiedBalance;
  }
  var findParams = Object.assign(query, dateParams);
  // Custom sort
  if (findParams.sort) {
    sort = {};
    var sortParts = findParams.sort.split(':');
    sort[sortParts[0]] = parseInt(sortParts[1], 10);
    delete findParams.sort;
  }

  if (query.balanceCardIssued) {
    if (query.balanceCardIssued === 'true') {
      query['transaction.nccCardValue'] = { $gt: 0 };
    }

    if (query.balanceCardIssued === 'false') {
      query['transaction.nccCardValue'] = 0;
    }

    delete query.balanceCardIssued;
  }

  if (query.transactionPrefix) {
    if (query.transactionPrefix.indexOf(',') > -1) {
      query.transactionPrefix = query.transactionPrefix.split(',').join('|');
    }
    query['transaction.prefix'] = new RegExp(query.transactionPrefix, 'i');
    delete query.transactionPrefix;
  }

  // Query by a subdocument
  var subdocumentConstraints = ['number', 'pin', 'retailer', 'customerName', 'employeeName', 'customerPhone', 'customerEmail'];
  var queryBySubdocument = false;

  subdocumentConstraints.forEach(function (constraint) {
    if (query[constraint]) {
      queryBySubdocument = true;
    }
  });

  if (queryBySubdocument) {
    var cardParams = {},
        retailerParams = {};
    var searchCard = false;
    if (query.number) {
      searchCard = true;
      if (!(query.number instanceof RegExp)) {
        cardParams.number = new RegExp(query.number);
      }
      delete query.number;
    }
    if (query.pin) {
      searchCard = true;
      if (!(query.pin instanceof RegExp)) {
        cardParams.pin = new RegExp(query.pin);
      }
      delete query.pin;
    }
    if (query.retailer) {
      if (!(query.name instanceof RegExp)) {
        retailerParams.name = new RegExp(query.retailer, 'i');
      }
      delete query.retailer;
      // Search retailers
      promises.push(Retailer.find(retailerParams).then(function (retailers) {
        findParams.retailer = { $in: retailers.map(function (retailer) {
            return retailer._id.toString();
          }) };
      }));
    }
    // Search cards
    if (searchCard) {
      promises.push(Card.find(cardParams).then(function (cards) {
        findParams.card = { $in: cards.map(function (card) {
            return card._id.toString();
          }) };
      }));
    }

    var customerQuery = {};

    // Search customer
    if (query.customerName) {
      var customerNameRegExp = void 0;
      if (!(query.customerName instanceof RegExp)) {
        customerNameRegExp = new RegExp(query.customerName, 'i');
      } else {
        customerNameRegExp = query.customerName;
      }

      customerQuery.fullName = customerNameRegExp;
    }

    if (query.customerPhone) {
      customerQuery.phone = new RegExp(query.customerPhone, 'i');
    }

    if (query.customerEmail) {
      customerQuery.email = new RegExp(query.customerEmail, 'i');
    }

    if (!_lodash2.default.isEmpty(customerQuery)) {
      promises.push(_customer2.default.find(customerQuery).then(function (customers) {
        findParams.customer = { $in: customers.map(function (customer) {
            return customer._id.toString();
          }) };
        delete query.customerName;
        delete query.customerPhone;
        delete query.customerEmail;
      }));
    }

    // Search employee
    if (query.employeeName) {
      var employeeRegExp = new RegExp(query.employeeName.split(' ').join('|'), 'i');
      promises.push(
      // Check firstName and lastName as well because some users might not have the fullName attribute
      _user2.default.find({ $or: [{ firstName: employeeRegExp }, { lastName: employeeRegExp }, { fullName: employeeRegExp }] }).then(function (employees) {
        findParams.user = { $in: employees.map(function (employee) {
            return employee._id.toString();
          }) };
        delete query.employeeName;
      }));
    }
  }
  if (!count) {
    return Promise.all(promises).then(function () {
      return _inventory2.default.find(findParams).populate('customer').populate('retailer').populate('store').populate('company').populate('liquidationError').populate('card').populate('user').populate('reconciliation').populate('batch').sort(sort).limit(parseInt(limit)).skip(parseInt(skip));
    }).then(function (inventories) {
      return {
        inventories: inventories,
        findParams: findParams
      };
    });
  } else {
    return Promise.all(promises).then(function () {
      return _inventory2.default.count(findParams);
    });
  }
}
//# sourceMappingURL=company.controller.js.map
