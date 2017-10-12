'use strict';

// Disable ssl rejection for retailer syncing

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRates = undefined;

/**
 * Update rates
 */
var updateRates = exports.updateRates = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(req, res) {
    var _this6 = this;

    var changes, allChanges, promises;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            changes = req.body.changes;
            allChanges = [];
            // Compile rates into a format I can work with

            _lodash2.default.forEach(changes, function (smp) {
              _lodash2.default.forEach(smp, function (newRate) {
                allChanges.push(newRate);
              });
            });
            promises = [];
            // Update each rate

            allChanges.forEach(function (change) {
              var queryParams = '';
              if (change.rate) {
                queryParams += 'rate=' + change.rate;
              }
              if (change.spelling) {
                if (change.rate) {
                  queryParams += '&';
                }
                queryParams += 'spelling=' + encodeURIComponent(change.spelling);
              }
              promises.push(_axios2.default.post(_runDefers.liquidationApiUrl + ':' + _runDefers.liquidationApiPort + '/' + _runDefers.updateRatesPath + '?smp=' + change.smp + '&retailer_id=' + change.retailer + '&' + queryParams, {}, {
                headers: { apiKey: _runDefers.liquidationApiKey }
              }));
            });
            Promise.all(promises).then(function () {
              return res.json();
            }).catch(function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(err) {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return _errorLog2.default.create({
                          method: 'updateRates',
                          controller: 'retailer.controller',
                          revision: (0, _errors.getGitRev)(),
                          stack: err.stack,
                          error: err
                        });

                      case 2:
                        console.log('**************EXCEPTION IN UPDATE RATES 1**********');
                        console.log(err);
                        return _context9.abrupt('return', res.status(500).json(err));

                      case 5:
                      case 'end':
                        return _context9.stop();
                    }
                  }
                }, _callee9, _this6);
              }));

              return function (_x13) {
                return _ref10.apply(this, arguments);
              };
            }());
            _context10.next = 16;
            break;

          case 9:
            _context10.prev = 9;
            _context10.t0 = _context10['catch'](0);

            console.log('**************EXCEPTION IN UPDATE RATES 2**********');
            console.log(_context10.t0);
            _context10.next = 15;
            return _errorLog2.default.create({
              method: 'updateRates',
              controller: 'retailer.controller',
              revision: (0, _errors.getGitRev)(),
              stack: _context10.t0.stack,
              error: _context10.t0
            });

          case 15:
            return _context10.abrupt('return', res.status(500).json(_context10.t0));

          case 16:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this, [[0, 9]]);
  }));

  return function updateRates(_x11, _x12) {
    return _ref9.apply(this, arguments);
  };
}();

exports.getBuyRateAuto = getBuyRateAuto;
exports.getBuyRatesSet = getBuyRatesSet;
exports.retailerSetBuyAndSellRates = retailerSetBuyAndSellRates;
exports.getRetailersNew = getRetailersNew;
exports.getAllRates = getAllRates;
exports.getBiInfo = getBiInfo;
exports.updateBiInfo = updateBiInfo;
exports.biInfoCsv = biInfoCsv;
exports.uploadCcRatesDoc = uploadCcRatesDoc;
exports.uploadCpRatesDoc = uploadCpRatesDoc;
exports.uploadElectronicPhysical = uploadElectronicPhysical;
exports.uploadGcrRates = uploadGcrRates;
exports.uploadGcrPhysical = uploadGcrPhysical;
exports.uploadGcrElectronic = uploadGcrElectronic;
exports.getAllRetailers = getAllRetailers;
exports.setGsId = setGsId;
exports.setProp = setProp;
exports.salesStats = salesStats;
exports.syncWithBi = syncWithBi;
exports.createNewRetailerBasedOnOldOne = createNewRetailerBasedOnOldOne;
exports.createRetailer = createRetailer;
exports.toggleDisableForCompany = toggleDisableForCompany;

require('../company/autoBuyRate.model');

require('../company/companySettings.model');

require('../inventory/InventoryCache.model');

require('../inventory/inventoryParamCache.model');

require('../log/logs.model');

var _company = require('../company/company.model');

var _company2 = _interopRequireDefault(_company);

var _card = require('../card/card.model');

var _card2 = _interopRequireDefault(_card);

require('../stores/store.model');

require('../reserve/reserve.model');

var _retailer = require('./retailer.model');

var _retailer2 = _interopRequireDefault(_retailer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fastCsv = require('fast-csv');

var _fastCsv2 = _interopRequireDefault(_fastCsv);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _csvWriteStream = require('csv-write-stream');

var _csvWriteStream2 = _interopRequireDefault(_csvWriteStream);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _environment = require('../../config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _card3 = require('../card/card.helpers');

var _smp = require('../../helpers/smp');

var _errorLog = require('../errorLog/errorLog.model');

var _errorLog2 = _interopRequireDefault(_errorLog);

var _errors = require('../../helpers/errors');

var _runDefers = require('../deferredBalanceInquiries/runDefers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var request = require('request');

// Liquidation connection information


// Default buy rate when one isn't set, and auto buy rate isn't on
var defaultBuyRate = 0.6;
// Amount to subtract from sell rate when card sells for less than default buy rate
var defaultBuyLessThanSell = 0.05;
// Default margin for a company
var defaultMargin = 0.03;

/**
 * Import CSV
 * @param req
 * @param res
 */
exports.importCsv = function (req, res) {
  var stream = _fs2.default.createReadStream('/public/cardquiry/giftcard_manager/server/files/retailers.csv');
  var Promises = [];
  // Convert rates to percentages
  var getRate = function getRate(item) {
    var rate = 0;
    if (item) {
      rate = parseFloat(item).toFixed(2);
    }
    return rate;
  };

  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    var urlMatch = void 0,
        url = void 0,
        retailerRecord = new _retailer2.default(),
        rate = void 0;
    record.forEach(function (item, key) {
      switch (key) {
        case 0:
          retailerRecord.name = item;
          break;
        case 1:
          retailerRecord.uid = item;
          break;
        case 2:
          retailerRecord.offerType = item;
          break;
        case 3:
          retailerRecord.retailerId = item;
          break;
        case 4:
          urlMatch = item.match(/https:\/\/dl\.airtable\.com[^)]+/);
          url = '';
          if (urlMatch) {
            url = urlMatch[0];
          }
          retailerRecord.imageUrl = url;
          retailerRecord.imageOriginal = item;
          break;
        case 5:
          retailerRecord.buyRate = getRate(item);
          break;
        case 6:
          retailerRecord.sellRates.saveYa = getRate(item);
          break;
        case 7:
          retailerRecord.sellRates.best = getRate(item);
          break;
        case 8:
          retailerRecord.sellRates.sellTo = item;
          break;
        case 9:
          retailerRecord.sellRates.cardCash = getRate(item);
          break;
      }
    });
    Promises.push(retailerRecord.save());
  }).on("end", function () {
    Promise.all(Promises).then(function () {
      return res.json();
    }).catch(function (err) {
      return res.status(500).json(err);
    });
  });

  stream.pipe(csvStream);
};

/**
 * Add retailer URL
 * @param req
 * @param res
 */
exports.addRetailerUrl = function (req, res) {
  var stream = _fs2.default.createReadStream('./server/files/master-retailers-url-phone.csv');
  var Promises = [];

  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    var uid = record[1].replace(',', '');
    var promise = _retailer2.default.findOne({ uid: uid }).then(function (retailer) {
      retailer.verification = {
        url: record[4],
        phone: record[5]
      };
      return retailer.save();
    });
    Promises.push(promise);
  }).on("end", function () {
    Promise.all(Promises).then(function () {
      return res.json();
    }).catch(function (err) {
      return res.status(500).json(err);
    });
  });

  stream.pipe(csvStream);
};

/**
 * Download card images
 * @param url Image URL
 * @param dest Destination to write
 * @param retailer Retailer record
 * @returns {Promise}
 */
var downloadImage = function downloadImage(url, dest, retailer) {
  var defaultPath = '/public/cardquiry/giftcard_manager/src/assets/images/retailers/';
  var fileName = defaultPath + dest;
  var expectSlashes = defaultPath.match(/\//g).length;
  if (fileName.match(/\//g).length > expectSlashes) {
    return new Promise(function (resolve) {
      return resolve();
    });
  }
  try {
    _fs2.default.statSync(fileName);
    return new Promise(function (resolve) {
      return resolve();
    });
  } catch (e) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        var file = _fs2.default.createWriteStream(fileName);
        _https2.default.get(url, function (response) {
          response.pipe(file);
          file.on('finish', function () {
            file.close();
            resolve();
          });
        }).on('error', function (err) {
          _fs2.default.unlink(fileName);
          reject(err);
        });
      }, 1000);
      resolve();
    });
  }
};

/**
 * Download retailer images
 */
exports.retailerImages = function (req, res) {
  var promises = [];
  var fileType = void 0,
      splitFilename = void 0;
  _retailer2.default.find({}).sort({ name: 1 }).then(function (retailers) {
    retailers.forEach(function (retailer) {
      if (retailer.imageUrl) {
        splitFilename = retailer.imageUrl.split('.');
        fileType = splitFilename.splice(splitFilename.length - 1, 1)[0];
        promises.push(downloadImage(retailer.imageUrl, retailer._id + '.' + fileType, retailer));
      }
    });
    return Promise.all(promises);
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _errorLog2.default.create({
                method: 'retailerImages',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * Save image types on retailers
 */
exports.retailerImageTypes = function (req, res) {
  var promises = [];
  var imageType = void 0,
      imageUrl = void 0;
  _retailer2.default.find().sort({ name: 1 }).then(function (retailers) {
    retailers.forEach(function (retailer) {
      imageUrl = retailer.imageUrl.split('.');
      imageType = imageUrl[imageUrl.length - 1];
      //retailer.imageType = imageType;
      promises.push(_retailer2.default.update({ _id: retailer._id }, { $set: { imageType: imageType } }));
    });
    return Promise.all(promises);
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _errorLog2.default.create({
                method: 'retailerImageTypes',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context2.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
};

/**
 * Get buy rates for auto-set buy rates
 * @param retailers
 * @param settings
 */
function getBuyRateAuto(retailers, settings) {
  return retailers.map(function (retailer) {
    // Calculate rate based on auto buy rate settings
    var bestSellRate = retailer.sellRate;
    var nearestRoundDown = Math.floor(bestSellRate * 100 / 5) * 5;
    var key = '_' + nearestRoundDown + '_' + (nearestRoundDown + 5);
    var customerMargin = settings.autoBuyRates[key];
    if (!customerMargin) {
      // No margin, use sell rate
      customerMargin = defaultBuyLessThanSell;
    }
    try {
      retailer.buyRate = parseFloat((bestSellRate - customerMargin).toFixed(2));
    } catch (e) {
      retailer.buyRate = bestSellRate - customerMargin;
    }
    return retailer;
  });
}

/**
 * Filter retailers based on best sell rate and selected min sell rate value
 * @param retailers
 * @param minVal
 * @returns {*}
 */
function filterRetailersBasedOnMinSellRate(retailers, minVal) {
  return retailers.filter(function (retailer) {
    if (minVal) {
      // Return all for all
      if (minVal === 'All') {
        return retailer;
      }
      return retailer.sellRate > parseInt(minVal) / 100;
    }
    return retailer;
  });
}

/**
 * Get retailers based on the set buy rates
 * @param retailers
 * @param storeId
 */
function getBuyRatesSet(retailers, storeId) {
  return retailers.map(function (retailer) {
    // Find buy rate relations for this store
    var thisBuyRateRelation = retailer.buyRateRelations.filter(function (relation) {
      if (relation && relation.storeId) {
        return relation.storeId.toString() === storeId.toString();
      }
      return false;
    });
    // Apply relation
    if (thisBuyRateRelation.length) {
      try {
        retailer.buyRate = thisBuyRateRelation[0].buyRate;
      } catch (e) {
        retailer.buyRate = defaultBuyRate;
      }
      // Set to default buy rate
    } else {
      if (retailer.sellRate - defaultBuyLessThanSell > defaultBuyRate) {
        retailer.buyRate = defaultBuyRate;
      } else {
        retailer.buyRate = parseFloat((retailer.sellRate - defaultBuyLessThanSell).toFixed(2));
      }
    }
    return retailer;
  });
}

/**
 * Set buy and sell rates on retailer
 * @param retailers Retailers (with values AFTER margin is applied)
 * @param settings Company settings
 * @param storeId Store ID
 * @param minVal Minimum sell rate to return
 * @param {Boolean} balance Card balance
 */
function retailerSetBuyAndSellRates(retailers) {
  var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { margin: 0.03 };
  var storeId = arguments[2];
  var minVal = arguments[3];
  var balance = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  var returnArray = true;
  // Return a single retailer
  if (!Array.isArray(retailers)) {
    returnArray = false;
  }
  retailers = Array.isArray(retailers) ? retailers : [retailers];
  retailers = retailers.map(function (retailer) {
    // Get best sell rate (margin not included)
    var bestSellRate = (0, _card3.determineSellTo)(retailer, balance, settings);
    if (!bestSellRate) {
      return { sellRate: 0 };
    }
    // Convert to plain if it's not already
    if (!_lodash2.default.isPlainObject(retailer)) {
      retailer = retailer.toObject();
    }
    retailer.sellRate = bestSellRate.rate - settings.margin;
    retailer.type = bestSellRate.type;
    return retailer;
  });
  // Filter out no sell rate
  retailers = retailers.filter(function (retailer) {
    return retailer.sellRate > 0;
  });
  // Filter based on min val
  retailers = filterRetailersBasedOnMinSellRate(retailers, minVal);
  // Remove retailers with 0 sell rates
  retailers = retailers.filter(function (retailer) {
    return retailer.sellRate;
  });
  // Determine best buy rate if rates are auto-set
  if (settings.autoSetBuyRates) {
    retailers = getBuyRateAuto(retailers, settings);
  } else {
    // Filter buy rates by store
    if (storeId) {
      retailers = getBuyRatesSet(retailers, storeId);
    }
  }
  var filteredRetailers = retailers.filter(function (retailer) {
    return retailer;
  });
  // Array of retailers
  if (returnArray) {
    return filteredRetailers;
    // Single retailer
  } else {
    if (filteredRetailers.length) {
      return filteredRetailers[0];
    } else {
      return {};
    }
  }
}

/**
 * Retrieve retailers with buy and sell rates
 */
function getRetailersNew(req, res) {
  var _this = this;

  var _req$params = req.params,
      storeId = _req$params.storeId,
      _req$params$minVal = _req$params.minVal,
      minVal = _req$params$minVal === undefined ? 0 : _req$params$minVal;

  var isCsv = req.csv;
  var margin = void 0,
      company = void 0,
      settings = void 0;
  _company2.default.findOne({
    stores: storeId
  }).then(function (dbCompany) {
    company = dbCompany;
    return dbCompany.getSettings();
  }).then(function (dbSettings) {
    // Save margin
    margin = _lodash2.default.isUndefined(dbSettings.margin) ? 0.03 : dbSettings.margin;
    settings = dbSettings;
    settings.margin = margin;
  }).then(function () {
    return _retailer2.default.find().populate('buyRateRelations').sort({ name: 1 });
  }).then(function (retailers) {
    retailers = filterDisabledRetailers(retailers, company);
    // Get retailers with buy and sell rates set
    retailers = retailerSetBuyAndSellRates(retailers, settings, storeId, minVal);
    if (isCsv) {
      if (!_fs2.default.existsSync('retailerCsv')) {
        _fs2.default.mkdirSync('retailerCsv');
      }
      var csvWriter = (0, _csvWriteStream2.default)({ headers: ['retailer', 'buyRate', 'sellRate', 'type'] });
      var outFile = 'retailerCsv/' + (0, _moment2.default)().format('YYYYMMDD') + '-' + storeId + '.csv';
      csvWriter.pipe(_fs2.default.createWriteStream(outFile));
      retailers.forEach(function (retailer) {
        csvWriter.write([retailer.name, retailer.buyRate, retailer.sellRate, retailer.type]);
      });
      csvWriter.end();
      return res.json({ url: '' + _environment2.default.serverApiUrl + outFile });
    }
    return res.json(retailers);
  }).catch(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _errorLog2.default.create({
                method: 'getRetailersNew',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context3.abrupt('return', res.status(500).json({}));

            case 3:
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
 * Filter out disabled retailers
 * @param retailers
 * @param company
 */
function filterDisabledRetailers(retailers, company) {
  return retailers.filter(function (retailer) {
    if (!company.disabledRetailers) {
      return true;
    }
    return company.disabledRetailers.indexOf(retailer._id.toString()) === -1;
  });
}

/**
 * Get all retailers for card intake
 */
exports.queryRetailers = function (req, res) {
  var query = req.query.query;
  var dbCompany = void 0;
  _company2.default.findOne({
    _id: req.user.company
  }).then(function (company) {
    dbCompany = company;
    // const user = req.user;
    return _retailer2.default.find({ name: new RegExp(query, 'i') }).populate('buyRateRelations').sort({ name: 1 }).limit(10);
  }).then(function (retailers) {
    // Filter out disabled retailers
    retailers = filterDisabledRetailers(retailers, dbCompany);
    return res.json(retailers);
  }).catch(function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _errorLog2.default.create({
                method: 'queryRetailers',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              console.log('**************QUERY RETAILER ERR**********');
              console.log(err);
              return _context4.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    }));

    return function (_x6) {
      return _ref4.apply(this, arguments);
    };
  }());
};

/**
 * Retrieve all rates
 */
function getAllRates(req, res) {
  var _this2 = this;

  // Rates for return
  var rates = {};
  _retailer2.default.find().then(function (retailers) {
    var ratesFinal = [];
    retailers.forEach(function (retailer) {
      if (!rates[retailer.uid]) {
        rates[retailer.uid] = {};
      }
      _lodash2.default.forEach(retailer.getSmpSpelling().toObject(), function (spelling, smp) {
        if (smp.toLowerCase() === 'saveya') {
          return;
        }
        var rateObj = {
          smpSpelling: retailer.getSmpSpelling()[smp],
          retailer: retailer.name,
          smpType: retailer.getSmpType()[smp],
          max: retailer.getSmpMaxMin()[smp].max,
          min: retailer.getSmpMaxMin()[smp].min,
          _id: retailer._id,
          uid: retailer.uid,
          smp: smp
        };

        ratesFinal.push(Object.assign({}, rateObj, {
          sellRates: retailer.getSellRates()[smp],
          smpType: retailer.getSmpType()[smp],
          max: retailer.getSmpMaxMin()[smp].max,
          min: retailer.getSmpMaxMin()[smp].min,
          isMerch: false
        }));

        var maxMin = retailer.getSmpMaxMinMerch()[smp];

        ratesFinal.push(Object.assign({}, rateObj, {
          sellRates: retailer.getSellRatesMerch()[smp],
          smpType: retailer.getSmpTypeMerch()[smp],
          max: maxMin.max,
          min: maxMin.min,
          isMerch: true
        }));
      });
    });
    return ratesFinal;
  }).then(function (completeRates) {
    return completeRates.sort(function (current, next) {
      if (current.retailer.toLowerCase() < next.retailer.toLowerCase()) {
        return -1;
      }
      if (current.retailer.toLowerCase() > next.retailer.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }).then(function (retailers) {
    return res.json({ retailers: retailers });
  }).catch(function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(err) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _errorLog2.default.create({
                method: 'getAllRates',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context5.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this2);
    }));

    return function (_x7) {
      return _ref5.apply(this, arguments);
    };
  }());
}

/**
 * Get BI info
 */
function getBiInfo(req, res) {
  var _this3 = this;

  return _retailer2.default.find().then(function (retailers) {
    return res.json({ retailers: retailers });
  }).catch(function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(err) {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _errorLog2.default.create({
                method: 'getBiInfo',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context6.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this3);
    }));

    return function (_x8) {
      return _ref6.apply(this, arguments);
    };
  }());
}

/**
 * Update BI info
 */
function updateBiInfo(req, res) {
  var _this4 = this;

  var _req$body = req.body,
      _id = _req$body._id,
      propPath = _req$body.propPath,
      value = _req$body.value;

  var propToUpdate = propPath.join('.');
  _retailer2.default.update({ _id: _id }, {
    $set: _defineProperty({}, propToUpdate, value)
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              console.log('**************ERR IN UPDATE BI INFO**********');
              console.log(err);
              _context7.next = 4;
              return _errorLog2.default.create({
                method: 'updateBiInfo',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              res.status(500).json({ message: err.toString() });

            case 5:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this4);
    }));

    return function (_x9) {
      return _ref7.apply(this, arguments);
    };
  }());
}

/**
 * Download BI info CSV
 */
function biInfoCsv(req, res) {
  var _this5 = this;

  _retailer2.default.find().then(function (retailers) {
    if (!_fs2.default.existsSync('biInfoCsv')) {
      _fs2.default.mkdirSync('biInfoCsv');
    }
    var csvWriter = (0, _csvWriteStream2.default)({ headers: ['retailer', 'url', 'phone'] });
    var outFile = 'biInfoCsv/' + (0, _moment2.default)().format('YYYYMMDD') + '.csv';
    csvWriter.pipe(_fs2.default.createWriteStream(outFile));
    retailers.forEach(function (retailer) {
      csvWriter.write([retailer.name, retailer.verification.url, retailer.verification.phone]);
    });
    csvWriter.end();
    return res.json({ url: '' + _environment2.default.serverApiUrl + outFile });
  }).catch(function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(err) {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              console.log('**************ERR IN GET BI INFO CSV**********');
              console.log(err);
              _context8.next = 4;
              return _errorLog2.default.create({
                method: 'biInfoCsv',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context8.abrupt('return', res.status(500).json({ message: err.toString() }));

            case 5:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this5);
    }));

    return function (_x10) {
      return _ref8.apply(this, arguments);
    };
  }());
};

/**
 * Upload Cardcash rates doc
 */
function uploadCcRatesDoc(req, res) {
  var file = req.files[0];
  var ccRates = [];
  var fileName = __dirname + '/rates/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    /**
     * Fields:
     * 1) ID
     * 2) Name
     * 3) Percentage
     * 4) Max
     * 5) Method
     */
    // Create record
    var thisRecord = {
      id: record[0],
      name: record[1],
      percentage: record[2],
      max: record[3],
      method: record[4]
    };
    ccRates.push(thisRecord);
  }).on('end', function () {
    var promises = [];
    ccRates.forEach(function (rate) {
      var type = void 0;
      if (/online/i.test(rate.method)) {
        type = 'electronic';
      } else if (/mail/i.test(rate.method)) {
        type = 'physical';
      } else {
        type = 'disabled';
      }
      var max = void 0,
          percentage = void 0;
      try {
        max = parseFloat(rate.max);
      } catch (e) {
        max = 0;
      }
      try {
        percentage = parseFloat(rate.percentage);
        if (isNaN(percentage)) {
          percentage = 0;
        } else {
          if (percentage > 1) {
            percentage = percentage / 100;
          }
        }
      } catch (e) {
        percentage = 0;
      }
      promises.push(_retailer2.default.update({
        'apiId.cardCash': rate.id
      }, {
        $set: {
          'smpSpelling.cardCash': rate.name,
          'sellRates.cardCash': percentage,
          'smpMaxMin.cardCash.max': isNaN(max) ? 0 : max,
          'smpType.cardCash': type
        }
      }).then(function () {}));
    });
    Promise.all(promises).then(function () {
      _fs2.default.unlink(fileName);
      return res.json();
    });
  });

  stream.pipe(csvStream);
}

/**
 * Handle cardpool uploads
 * @param req
 * @param res
 * @param type
 */
function handleCp(req, res, type) {
  var file = req.files[0];
  var cpRates = [];
  var fileName = __dirname + '/rates/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    var thisRecord = void 0;
    /**
     * Fields:
     * 1) Name
     * 2) Type
     */
    // Rates
    if (type === 'rates') {
      // Create record
      thisRecord = {
        name: record[0],
        percentage: record[1].replace('%', '')
      };
      // Electronic/physical
    } else if (type == 'electronicPhysical') {
      thisRecord = {
        name: record[0],
        electronicPhysical: record[1]
      };
    }
    cpRates.push(thisRecord);
  }).on('end', function () {
    var promises = [];
    if (type === 'rates') {
      cpRates.forEach(function (rate) {
        // Make sure we have a reasonable percentage
        var percentage = parseFloat(rate.percentage);
        if (isNaN(percentage)) {
          percentage = 0;
        } else {
          if (percentage > 1) {
            percentage = percentage / 100;
          }
        }
        promises.push(_retailer2.default.update({
          'smpSpelling.cardPool': rate.name
        }, {
          $set: {
            'sellRates.cardPool': percentage
          }
        }).then(function () {}));
      });
    } else if (type === 'electronicPhysical') {
      cpRates.forEach(function (rate) {
        var type = 'physical';
        if (/both/i.test(rate.electronicPhysical)) {
          type = 'electronic';
        }
        promises.push(_retailer2.default.update({
          'smpSpelling.cardPool': rate.name
        }, {
          $set: {
            'smpType.cardPool': type
          }
        }).then(function () {}));
      });
    }
    return Promise.all(promises).then(function () {
      _fs2.default.unlink(fileName);
      return res.json();
    });
  });

  stream.pipe(csvStream);
}

/**
 * Upload Cardpool rates doc
 */
function uploadCpRatesDoc(req, res) {
  handleCp(req, res, 'rates');
}

/**
 * Upload Cardpool electronic/physical doc
 */
function uploadElectronicPhysical(req, res) {
  handleCp(req, res, 'electronicPhysical');
}

/**
 * Upload Giftcard Rescue rates
 */
function uploadGcrRates(req, res) {
  var file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  var data = [];
  var fileName = __dirname + '/rates/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    /**
     * Fields:
     * 1) Name
     * 2) Percentage
     */
    // Create record
    var thisRecord = {
      name: record[0],
      percentage: record[1]
    };
    data.push(thisRecord);
  }).on('end', function () {
    _axios2.default.post(_runDefers.liquidationApiUrl + ':' + _runDefers.liquidationApiPort + '/' + _runDefers.csvRatesPath, {
      rates: JSON.stringify(data),
      smp: 'giftcardrescue'
    }, {
      headers: { apiKey: _runDefers.liquidationApiKey }
    }).then(function () {
      return _fs2.default.unlink(fileName);
    }).then(function () {
      return res.json();
    }).catch(function (err) {
      console.log('**************GCR RATE UPLOAD ERROR**********');
      console.log(err);
      return res.status(500).json(err);
    });
  });
  stream.pipe(csvStream);
}

/**
 * Upload Giftcard Rescue physical retailers
 */
function uploadGcrPhysical(req, res) {
  var file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  var data = [];
  var fileName = __dirname + '/rates/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    /**
     * Fields:
     * 1) Name
     */
    // Create record
    var thisRecord = {
      name: record[0]
    };
    data.push(thisRecord);
  }).on('end', function () {
    console.log('**************PHYSICAL**********');
    console.log(data);
    // axios.post(`${liquidationApiUrl}:${liquidationApiPort}/${csvRatesPath}`, {
    //     rates: JSON.stringify(data),
    //     smp: 'cardcash'
    //   }, {
    //     headers: {apiKey: liquidationApiKey}
    //   })
    //   .then(() => {
    //     return fs.unlink(fileName);
    //   })
    //   .then(() => res.json())
    //   .catch(() => res.status(500).json());
  });
  stream.pipe(csvStream);
}

/**
 * Upload Giftcard Rescue electronic retailers
 */
function uploadGcrElectronic(req, res) {
  var file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  var data = [];
  var fileName = __dirname + '/rates/' + file.filename;
  var stream = _fs2.default.createReadStream(fileName);
  var csvStream = (0, _fastCsv2.default)().on("data", function (record) {
    /**
     * Fields:
     * 1) Name
     */
    // Create record
    var thisRecord = {
      name: record[0]
    };
    data.push(thisRecord);
  }).on('end', function () {
    console.log('**************PHYSICAL**********');
    console.log(data);
    // axios.post(`${liquidationApiUrl}:${liquidationApiPort}/${csvRatesPath}`, {
    //     rates: JSON.stringify(data),
    //     smp: 'cardcash'
    //   }, {
    //     headers: {apiKey: liquidationApiKey}
    //   })
    //   .then(() => {
    //     return fs.unlink(fileName);
    //   })
    //   .then(() => res.json())
    //   .catch(() => res.status(500).json());
  });
  stream.pipe(csvStream);
}

/**
 * Get all retailers
 */
function getAllRetailers(req, res) {
  var _this7 = this;

  return _retailer2.default.find().then(function (retailers) {
    return res.json(retailers);
  }).catch(function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(err) {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _errorLog2.default.create({
                method: 'getAllRetailers',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context11.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this7);
    }));

    return function (_x14) {
      return _ref11.apply(this, arguments);
    };
  }());
}

/**
 * Change the GiftSquirrel ID of a retailer
 */
function setGsId(req, res) {
  var _this8 = this;

  _retailer2.default.findByIdAndUpdate(req.params.retailerId, {
    gsId: req.body.gsId
  }).then(function (retailer) {
    return res.json(retailer);
  }).catch(function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(err) {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              console.log('**************ERR IN SET GS ID**********');
              console.log(err);
              _context12.next = 4;
              return _errorLog2.default.create({
                method: 'setGsId',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 4:
              return _context12.abrupt('return', res.status(500).json(err));

            case 5:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this8);
    }));

    return function (_x15) {
      return _ref12.apply(this, arguments);
    };
  }());
}

/**
 * Set retailer property
 */
function setProp(req, res) {
  var _this9 = this;

  var propPath = req.body.propPath;
  var value = req.body.value;

  _retailer2.default.findById(req.params.retailerId).then(function (retailer) {
    if (propPath[0] === 'sellRates' || propPath === 'sellRatesMerch') {
      value = parseFloat(value);
      // Forgotten decimal
      if (value > 1) {
        value = value / 100;
      }
    }
    _lodash2.default.set(retailer, propPath, value);
    return retailer.save();
  }).then(function (retailer) {
    return res.json(retailer);
  }).catch(function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(err) {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _errorLog2.default.create({
                method: 'setProp',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              console.log('**************ERR IN RETAILER SET PROP**********');
              console.log(err);
              return _context13.abrupt('return', res.status(500).json());

            case 5:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this9);
    }));

    return function (_x16) {
      return _ref13.apply(this, arguments);
    };
  }());
}

/**
 * Count the number of retailers by card
 */
function salesStats(req, res) {
  _card2.default.aggregate([{ $group: { _id: "$retailer", count: { $sum: 1 } } }, { $sort: { count: -1 } }]).exec(function (err, results) {
    if (err) {
      return res.status(500).json(err);
    }
    _retailer2.default.populate(results, { path: '_id' }).then(function (retailers) {
      retailers = retailers.map(function (retailer) {
        retailer.name = retailer._id.name;
        return retailer;
      });
      return res.json({ retailers: retailers });
    }).catch(function (err) {
      console.log('**************ERR POPULATING RETAILERS FOR COUNTING**********');
      console.log(err);
      return res.status(500).json();
    });
  });
}

/**
 * Sync retailers with BI
 */
function syncWithBi(req, res) {
  var agentOptions = {
    host: _environment2.default.gcmgrBiIp,
    port: _environment2.default.gcmgrBiPort,
    path: '/',
    rejectUnauthorized: false
  };

  var methodFunction = _environment2.default.env === 'development' ? _http2.default : _https2.default;
  var agent = new methodFunction['Agent'](agentOptions);

  request({
    url: '' + _environment2.default.gcmgrBiMethod + _environment2.default.gcmgrBiIp + ':' + _environment2.default.gcmgrBiPort + '/retailers',
    method: 'GET',
    agent: agent
  }, function (err, resp, body) {
    if (err) {
      if (res.status) {
        var resResponse = res.status(500);
        if (resResponse) {
          return resResponse.json(err);
        }
      }
    }
    _retailer2.default.update({}, {
      $unset: {
        gsId: false
      }
    }, {
      multi: true
    }).then(function () {
      var promises = [];
      body = JSON.parse(body);
      var totalName = '';
      body.forEach(function (biRetailer) {
        var name = biRetailer.name;
        name = name.replace('/', '.');
        name = name.replace(/s/g, 's?');
        name = name.replace(/\s/g, '[\/\\s\'\"]+');
        name = new RegExp(name, 'i');
        totalName = '' + totalName + name + '|';
        var toSet = {};
        // GS ID
        if (biRetailer.retailer_id) {
          toSet.gsId = biRetailer.retailer_id;
        }
        // Addtoit ID
        if (biRetailer.ai_id) {
          toSet.aiId = biRetailer.ai_id;
        }
        promises.push(_retailer2.default.update({ name: name }, {
          $set: toSet
        }).then(function () {}));
      });
      return Promise.all(promises);
    }).then(function () {
      return res.json();
    });
  });
}

/**
 * Create a new retailer based on an old one (such as a merch credit retailer)
 */
function createNewRetailerBasedOnOldOne(req, res) {
  var _this10 = this;

  var body = req.body.retailer;
  _retailer2.default.findOne({
    $or: [{ gsId: body.gsId }, { retailerId: body.gsId }]
  }).then(function (retailer) {
    if (!retailer) {
      return res.status(400).json();
    }
    var old = retailer.toObject();
    old.name = body.name;
    old.original = old._id;
    delete old._id;
    var newRetailer = new _retailer2.default(old);
    return newRetailer.save();
  }).then(function (retailer) {
    if (!retailer) {
      return;
    }
    return res.json();
  }).catch(function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(err) {
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _errorLog2.default.create({
                method: 'createNewRetailerBasedOnOldOne',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context14.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this10);
    }));

    return function (_x17) {
      return _ref14.apply(this, arguments);
    };
  }());
}

/**
 * Create new retailer
 */
function createRetailer(req, res) {
  var _this11 = this;

  var body = req.body;

  _retailer2.default.findOne({
    name: body.name
  }).then(function (result) {
    if (!result) {
      var retailer = new _retailer2.default(body);
      (0, _smp.getActiveSmps)().forEach(function (smp) {
        // Not decimal
        if (typeof retailer.sellRates[smp] === 'number' && retailer.sellRates[smp] > 1) {
          retailer.sellRates[smp] = (retailer.sellRates[smp] / 100).toFixed(2);
        }
      });

      retailer.save().then(function () {
        return res.json({ msg: "Retailer saved successfully" });
      });
    } else {
      res.status(400).json({
        msg: "Retailer exists"
      });
    }
  }).catch(function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(err) {
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return _errorLog2.default.create({
                method: 'createRetailer',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context15.abrupt('return', res.status(500).json(err));

            case 3:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, _this11);
    }));

    return function (_x18) {
      return _ref15.apply(this, arguments);
    };
  }());
}
/**
 * Toggle disable retailers for a company
 */
function toggleDisableForCompany(req, res) {
  var _this12 = this;

  var body = req.body;
  _company2.default.findOne({
    _id: body.company
  }).then(function (company) {
    body.retailers.forEach(function (retailer) {
      var index = company.disabledRetailers.indexOf(retailer.toString());
      // Exists, so remove
      if (index !== -1) {
        company.disabledRetailers.splice(index, 1);
      } else {
        company.disabledRetailers.push(retailer);
      }
    });
    return company.save();
  }).then(function () {
    return res.json();
  }).catch(function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(err) {
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _errorLog2.default.create({
                method: 'toggleDisableForCompany',
                controller: 'retailer.controller',
                revision: (0, _errors.getGitRev)(),
                stack: err.stack,
                error: err
              });

            case 2:
              return _context16.abrupt('return', res.status(500).json({}));

            case 3:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, _this12);
    }));

    return function (_x19) {
      return _ref16.apply(this, arguments);
    };
  }());
}
//# sourceMappingURL=retailer.controller.js.map
