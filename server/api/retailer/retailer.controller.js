'use strict';

// Disable ssl rejection for retailer syncing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Retailer from './retailer.model';
import Card from '../card/card.model';
import _ from 'lodash';
import https from 'https';
import http from 'http';
import fs from 'fs';
import csv from 'fast-csv';
import axios from 'axios';
const request = require('request');
import CsvWriter from 'csv-write-stream';
import moment from 'moment';
import environment from '../../config/environment';
import {determineSellTo} from '../card/card.helpers';
import {getActiveSmps} from '../../helpers/smp';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

import '../company/autoBuyRate.model';
import Company from '../company/company.model';

// Liquidation connection information
import {
  liquidationApiUrl,
  liquidationApiPort,
  ratesPath,
  liquidationApiKey,
  updateRatesPath,
  updateRatesFromLqPath,
  smpMaxMinPath,
  csvRatesPath,
  updateRetailerPath,
  SAVEYA,
  CARDCASH,
  CARDPOOL,
  GIFTCARDRESCUE,
} from '../deferredBalanceInquiries/runDefers';

// Default buy rate when one isn't set, and auto buy rate isn't on
const defaultBuyRate = 0.6;
// Amount to subtract from sell rate when card sells for less than default buy rate
const defaultBuyLessThanSell = 0.05;
// Default margin for a company
const defaultMargin = 0.03;

/**
 * Import CSV
 * @param req
 * @param res
 */
exports.importCsv = (req, res) => {
  const stream = fs.createReadStream('/public/cardquiry/giftcard_manager/server/files/retailers.csv');
  const Promises = [];
  // Convert rates to percentages
  const getRate = (item) => {
    let rate = 0;
    if (item) {
      rate = parseFloat(item).toFixed(2);
    }
    return rate;
  };

  const csvStream = csv()
    .on("data", function(record){
      let urlMatch, url, retailerRecord = new Retailer(), rate;
      record.forEach((item, key) => {
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

    })
    .on("end", function(){
      Promise.all(Promises)
      .then(() => {
        return res.json();
      })
      .catch((err) => {
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
exports.addRetailerUrl = (req, res) => {
  const stream = fs.createReadStream('./server/files/master-retailers-url-phone.csv');
  const Promises = [];

  const csvStream = csv()
    .on("data", function(record){
      const uid = record[1].replace(',', '');
      const promise = Retailer.findOne({uid})
      .then(retailer => {
        retailer.verification = {
          url: record[4],
          phone: record[5]
        };
        return retailer.save();
      });
      Promises.push(promise);
    })
    .on("end", function(){
      Promise.all(Promises)
        .then(() => {
          return res.json();
        })
        .catch((err) => {
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
var downloadImage = function(url, dest, retailer) {
  const defaultPath = '/public/cardquiry/giftcard_manager/src/assets/images/retailers/';
  const fileName = defaultPath + dest;
  const expectSlashes = defaultPath.match(/\//g).length;
  if (fileName.match(/\//g).length > expectSlashes) {
    return new Promise(resolve => resolve());
  }
  try {
    fs.statSync(fileName);
    return new Promise((resolve) => {
      return resolve();
    });
  } catch (e) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var file = fs.createWriteStream(fileName);
        https.get(url, function(response) {
          response.pipe(file);
          file.on('finish', function() {
            file.close();
            resolve();
          });
        }).on('error', function(err) {
          fs.unlink(fileName);
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
exports.retailerImages = (req, res) => {
  const promises = [];
  let fileType, splitFilename;
  Retailer.find({})
  .sort({name: 1})
  .then((retailers) => {
    retailers.forEach((retailer) => {
      if (retailer.imageUrl) {
        splitFilename = retailer.imageUrl.split('.');
        fileType = splitFilename.splice(splitFilename.length - 1, 1)[0];
        promises.push(downloadImage(retailer.imageUrl, `${retailer._id}.${fileType}`, retailer));
      }
    });
    return Promise.all(promises);
  })
  .then(() => {
    return res.json();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'retailerImages',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
};

/**
 * Save image types on retailers
 */
exports.retailerImageTypes = (req, res) => {
  const promises = [];
  let imageType, imageUrl;
  Retailer.find()
  .sort({name: 1})
  .then(retailers => {
    retailers.forEach(retailer => {
      imageUrl = retailer.imageUrl.split('.');
      imageType = imageUrl[imageUrl.length - 1];
      //retailer.imageType = imageType;
      promises.push(Retailer.update({_id: retailer._id}, {$set: {imageType}}));
    });
    return Promise.all(promises);
  })
  .then(() => {
    return res.json();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'retailerImageTypes',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
};

/**
 * Get buy rates for auto-set buy rates
 * @param retailers
 * @param settings
 */
export function getBuyRateAuto(retailers, settings) {
  return retailers.map(retailer => {
    // Calculate rate based on auto buy rate settings
    const bestSellRate = retailer.sellRate;
    const nearestRoundDown = Math.floor(bestSellRate * 100 / 5) * 5;
    const key = `_${nearestRoundDown}_${nearestRoundDown + 5}`;
    let customerMargin = settings.autoBuyRates[key];
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
  return retailers.filter(retailer => {
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
export function getBuyRatesSet(retailers, storeId) {
  return retailers.map(retailer => {
    // Find buy rate relations for this store
    const thisBuyRateRelation = retailer.buyRateRelations.filter(relation => {
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
      if ((retailer.sellRate - defaultBuyLessThanSell) > defaultBuyRate) {
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
export function retailerSetBuyAndSellRates(retailers, settings = {margin: 0.03}, storeId, minVal, balance = null) {
  let returnArray = true;
  // Return a single retailer
  if (!Array.isArray(retailers)) {
    returnArray = false;
  }
  retailers = Array.isArray(retailers) ? retailers : [retailers];
  retailers = retailers.map(retailer => {
    // Get best sell rate (margin not included)
    const bestSellRate = determineSellTo(retailer, balance, settings);
    if (!bestSellRate) {
      return {sellRate: 0};
    }
    // Convert to plain if it's not already
    if (!_.isPlainObject(retailer)) {
      retailer = retailer.toObject();
    }
    retailer.sellRate = bestSellRate.rate - settings.margin;
    retailer.type = bestSellRate.type;
    return retailer;
  });
  // Filter out no sell rate
  retailers = retailers.filter(retailer => retailer.sellRate > 0);
  // Filter based on min val
  retailers = filterRetailersBasedOnMinSellRate(retailers, minVal);
  // Remove retailers with 0 sell rates
  retailers = retailers.filter(retailer => retailer.sellRate);
  // Determine best buy rate if rates are auto-set
  if (settings.autoSetBuyRates) {
    retailers = getBuyRateAuto(retailers, settings);
  } else {
    // Filter buy rates by store
    if (storeId) {
      retailers = getBuyRatesSet(retailers, storeId);
    }
  }
  const filteredRetailers = retailers.filter(retailer => retailer);
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
export function getRetailersNew(req, res) {
  const {storeId, minVal = 0} = req.params;
  const isCsv = req.csv;
  let margin, company, settings;
  Company.findOne({
      stores: storeId
    })
    .then(dbCompany => {
      company = dbCompany;
      return dbCompany.getSettings()
    })
    .then(dbSettings => {
      // Save margin
      margin = _.isUndefined(dbSettings.margin) ? 0.03 : dbSettings.margin;
      settings = dbSettings;
      settings.margin = margin;
    })
    .then(() => {
      return Retailer.find()
        .populate('buyRateRelations')
        .sort({name: 1})
    })
    .then(retailers => {
      retailers = filterDisabledRetailers(retailers, company);
      // Get retailers with buy and sell rates set
      retailers = retailerSetBuyAndSellRates(retailers, settings, storeId, minVal);
      if (isCsv) {
        if (!fs.existsSync('retailerCsv')){
          fs.mkdirSync('retailerCsv');
        }
        const csvWriter = CsvWriter({ headers: ['retailer', 'buyRate', 'sellRate', 'type']});
        const outFile = `retailerCsv/${moment().format('YYYYMMDD')}-${storeId}.csv`;
        csvWriter.pipe(fs.createWriteStream(outFile));
        retailers.forEach(retailer => {
          csvWriter.write([retailer.name, retailer.buyRate, retailer.sellRate, retailer.type]);
        });
        csvWriter.end();
        return res.json({url: `${environment.serverApiUrl}${outFile}`});
      }
      return res.json(retailers);
    })
  .catch(async err => {
    await ErrorLog.create({
      method: 'getRetailersNew',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  });
}

/**
 * Filter out disabled retailers
 * @param retailers
 * @param company
 */
function filterDisabledRetailers(retailers, company) {
  return retailers.filter(retailer => {
    if (!company.disabledRetailers) {
      return true;
    }
    return company.disabledRetailers.indexOf(retailer._id.toString()) === -1;
  });
}

/**
 * Get all retailers for card intake
 */
exports.queryRetailers = (req, res) => {
  const query = req.query.query;
  let dbCompany;
  Company.findOne({
    _id: req.user.company
  })
  .then(company => {
    dbCompany = company;
    // const user = req.user;
    return Retailer.find({name: new RegExp(query, 'i')})
      .populate('buyRateRelations')
      .sort({name: 1})
      .limit(10)
  })
  .then(retailers => {
    // Filter out disabled retailers
    retailers = filterDisabledRetailers(retailers, dbCompany);
    return res.json(retailers);
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'queryRetailers',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    console.log('**************QUERY RETAILER ERR**********');
    console.log(err);
    return res.status(500).json(err);
  });
};

/**
 * Retrieve all rates
 */
export function getAllRates(req, res) {
  // Rates for return
  const rates = {};
  Retailer.find()
  .then(retailers => {
    const ratesFinal = [];
    retailers.forEach(retailer => {
      if (!rates[retailer.uid]) {
        rates[retailer.uid] = {};
      }
      _.forEach(retailer.getSmpSpelling().toObject(), (spelling, smp) => {
        if (smp.toLowerCase() === 'saveya') {
          return;
        }
        const rateObj = {
          smpSpelling: retailer.getSmpSpelling()[smp],
          retailer: retailer.name,
          smpType: retailer.getSmpType()[smp],
          max: retailer.getSmpMaxMin()[smp].max,
          min: retailer.getSmpMaxMin()[smp].min,
          _id: retailer._id,
          uid: retailer.uid,
          smp,
        };

        ratesFinal.push(Object.assign({}, rateObj, {
          sellRates: retailer.getSellRates()[smp],
          smpType: retailer.getSmpType()[smp],
          max: retailer.getSmpMaxMin()[smp].max,
          min: retailer.getSmpMaxMin()[smp].min,
          isMerch: false
        }));

        const maxMin = retailer.getSmpMaxMinMerch()[smp];

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
  })
  .then(completeRates => {
    return completeRates.sort((current, next) => {
      if (current.retailer.toLowerCase() < next.retailer.toLowerCase()) {
        return -1;
      }
      if (current.retailer.toLowerCase() > next.retailer.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  })
  .then(retailers => res.json({retailers}))
  .catch(async err => {
    await ErrorLog.create({
      method: 'getAllRates',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  });
}

/**
 * Get BI info
 */
export function getBiInfo(req, res) {
  return Retailer.find()
  .then(retailers => res.json({retailers}))
  .catch(async err => {
    await ErrorLog.create({
      method: 'getBiInfo',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  });
}

/**
 * Update BI info
 */
export function updateBiInfo(req, res) {
  const {_id, propPath, value} = req.body;
  const propToUpdate = propPath.join('.');
  Retailer.update({_id}, {
    $set: {
      [propToUpdate]: value
    }
  })
  .then(() => res.json())
  .catch(async err => {
    console.log('**************ERR IN UPDATE BI INFO**********');
    console.log(err);
    await ErrorLog.create({
      method: 'updateBiInfo',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    res.status(500).json({message: err.toString()});
  });
}

/**
 * Download BI info CSV
 */
export function biInfoCsv(req, res) {
  Retailer.find()
  .then(retailers => {
    if (!fs.existsSync('biInfoCsv')){
      fs.mkdirSync('biInfoCsv');
    }
    const csvWriter = CsvWriter({ headers: ['retailer', 'url', 'phone']});
    const outFile = `biInfoCsv/${moment().format('YYYYMMDD')}.csv`;
    csvWriter.pipe(fs.createWriteStream(outFile));
    retailers.forEach(retailer => {
      csvWriter.write([retailer.name, retailer.verification.url, retailer.verification.phone]);
    });
    csvWriter.end();
    return res.json({url: `${environment.serverApiUrl}${outFile}`});
  })
  .catch(async err => {
    console.log('**************ERR IN GET BI INFO CSV**********');
    console.log(err);
    await ErrorLog.create({
      method: 'biInfoCsv',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({message: err.toString()});
  });
}

/**
 * Update rates
 */
export async function updateRates(req, res) {
  try {
    const changes = req.body.changes;
    const allChanges = [];
    // Compile rates into a format I can work with
    _.forEach(changes, smp => {
      _.forEach(smp, newRate => {
        allChanges.push(newRate);
      });
    });
    const promises = [];
    // Update each rate
    allChanges.forEach(change => {
      let queryParams = '';
      if (change.rate) {
        queryParams += `rate=${change.rate}`;
      }
      if (change.spelling) {
        if (change.rate) {
          queryParams += '&';
        }
        queryParams += `spelling=${encodeURIComponent(change.spelling)}`;
      }
      promises.push(axios.post(
        `${liquidationApiUrl}:${liquidationApiPort}/${updateRatesPath}?smp=${change.smp}&retailer_id=${change.retailer}&${queryParams}`,
        {}, {
          headers: {apiKey: liquidationApiKey}
        }));
    });
    Promise.all(promises)
      .then(() => res.json())
      .catch(async err => {
        await ErrorLog.create({
          method: 'updateRates',
          controller: 'retailer.controller',
          revision: getGitRev(),
          stack: err.stack,
          error: err
        });
        console.log('**************EXCEPTION IN UPDATE RATES 1**********');
        console.log(err);
        return res.status(500).json(err);
      })
  } catch(err) {
    console.log('**************EXCEPTION IN UPDATE RATES 2**********');
    console.log(err);
    await ErrorLog.create({
      method: 'updateRates',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  }
};


/**
 * Upload Cardcash rates doc
 */
export function uploadCcRatesDoc(req, res) {
  const file = req.files[0];
  const ccRates = [];
  const fileName = `${__dirname}/rates/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      /**
       * Fields:
       * 1) ID
       * 2) Name
       * 3) Percentage
       * 4) Max
       * 5) Method
       */
      // Create record
      const thisRecord = {
        id: record[0],
        name: record[1],
        percentage: record[2],
        max: record[3],
        method: record[4]
      };
      ccRates.push(thisRecord);
    })
    .on('end', () => {
      const promises = [];
      ccRates.forEach(rate => {
        let type;
        if (/online/i.test(rate.method)) {
          type = 'electronic';
        } else if (/mail/i.test(rate.method)) {
          type = 'physical';
        } else {
          type = 'disabled';
        }
        let max, percentage;
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
        promises.push(Retailer.update({
          'apiId.cardCash': rate.id
        }, {
          $set: {
            'smpSpelling.cardCash': rate.name,
            'sellRates.cardCash': percentage,
            'smpMaxMin.cardCash.max': isNaN(max) ? 0 : max,
            'smpType.cardCash': type
          }
        }).then(() => {}));
      });
      Promise.all(promises)
      .then(() => {
        fs.unlink(fileName);
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
  const file = req.files[0];
  const cpRates = [];
  const fileName = `${__dirname}/rates/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      let thisRecord;
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
    })
    .on('end', () => {
      const promises = [];
      if (type === 'rates') {
        cpRates.forEach(rate => {
          // Make sure we have a reasonable percentage
          let percentage = parseFloat(rate.percentage);
          if (isNaN(percentage)) {
            percentage = 0;
          } else {
            if (percentage > 1) {
              percentage = percentage / 100;
            }
          }
          promises.push(Retailer.update({
            'smpSpelling.cardPool': rate.name
          }, {
            $set: {
              'sellRates.cardPool': percentage
            }
          }).then(() => {}));
        });
      } else if (type === 'electronicPhysical') {
        cpRates.forEach(rate => {
          let type = 'physical';
          if (/both/i.test(rate.electronicPhysical)) {
            type = 'electronic';
          }
          promises.push(Retailer.update({
            'smpSpelling.cardPool': rate.name
          }, {
            $set: {
              'smpType.cardPool': type
            }
          }).then(() => {}));
        });
      }
      return Promise.all(promises)
      .then(() => {
        fs.unlink(fileName);
        return res.json();
      });
    });

  stream.pipe(csvStream);
}

/**
 * Upload Cardpool rates doc
 */
export function uploadCpRatesDoc(req, res) {
  handleCp(req, res, 'rates');
}

/**
 * Upload Cardpool electronic/physical doc
 */
export function uploadElectronicPhysical(req, res) {
  handleCp(req, res, 'electronicPhysical');
}

/**
 * Upload Giftcard Rescue rates
 */
export function uploadGcrRates(req, res) {
  const file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  const data = [];
  const fileName = `${__dirname}/rates/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      /**
       * Fields:
       * 1) Name
       * 2) Percentage
       */
      // Create record
      const thisRecord = {
        name: record[0],
        percentage: record[1]
      };
      data.push(thisRecord);
    })
    .on('end', () => {
      axios.post(`${liquidationApiUrl}:${liquidationApiPort}/${csvRatesPath}`, {
          rates: JSON.stringify(data),
          smp: 'giftcardrescue'
        }, {
          headers: {apiKey: liquidationApiKey}
        })
        .then(() => {
          return fs.unlink(fileName);
        })
        .then(() => res.json())
        .catch(err => {
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
export function uploadGcrPhysical(req, res) {
  const file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  const data = [];
  const fileName = `${__dirname}/rates/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      /**
       * Fields:
       * 1) Name
       */
      // Create record
      const thisRecord = {
        name: record[0]
      };
      data.push(thisRecord);
    })
    .on('end', () => {
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
export function uploadGcrElectronic(req, res) {
  const file = req.files[0];
  // No file
  if (!file) {
    return res.json();
  }
  const data = [];
  const fileName = `${__dirname}/rates/${file.filename}`;
  const stream = fs.createReadStream(fileName);
  const csvStream = csv()
    .on("data", function(record){
      /**
       * Fields:
       * 1) Name
       */
      // Create record
      const thisRecord = {
        name: record[0]
      };
      data.push(thisRecord);
    })
    .on('end', () => {
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
export function getAllRetailers(req, res) {
  return Retailer.find()
    .then(retailers => res.json(retailers))
    .catch(async err => {
      await ErrorLog.create({
        method: 'getAllRetailers',
        controller: 'retailer.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err
      });
      return res.status(500).json({});
    });
}

/**
 * Change the GiftSquirrel ID of a retailer
 */
export function setGsId(req, res) {
  Retailer.findByIdAndUpdate(req.params.retailerId, {
    gsId: req.body.gsId
  })
  .then(retailer => res.json(retailer))
  .catch(async err => {
    console.log('**************ERR IN SET GS ID**********');
    console.log(err);
    await ErrorLog.create({
      method: 'setGsId',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
}

/**
 * Set retailer property
 */
export function setProp(req, res) {
  const {propPath} = req.body;
  let {value} = req.body;
  Retailer.findById(req.params.retailerId)
  .then(retailer => {
    if (propPath[0] === 'sellRates' || propPath === 'sellRatesMerch') {
      value = parseFloat(value);
      // Forgotten decimal
      if (value > 1) {
        value = value / 100;
      }
    }
    _.set(retailer, propPath, value);
    return retailer.save();
  })
  .then(retailer => {
    return res.json(retailer);
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'setProp',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    console.log('**************ERR IN RETAILER SET PROP**********');
    console.log(err);
    return res.status(500).json();
  });
}

/**
 * Count the number of retailers by card
 */
export function salesStats(req, res) {
  Card.aggregate([
    {$group : {_id: "$retailer", count: {$sum: 1}}},
    {$sort : {count: -1}}
  ])
    .exec((err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      Retailer.populate(results, {path: '_id'})
        .then(retailers => {
          retailers = retailers.map(retailer => {
            retailer.name = retailer._id.name;
            return retailer;
          });
          return res.json({retailers});
        })
        .catch(err => {
          console.log('**************ERR POPULATING RETAILERS FOR COUNTING**********');
          console.log(err);
          return res.status(500).json();
        });
    });
}

/**
 * Sync retailers with BI
 */
export function syncWithBi(req, res) {
  const agentOptions = {
    host: environment.gcmgrBiIp,
    port: environment.gcmgrBiPort,
    path: '/',
    rejectUnauthorized: false
  };

  const methodFunction = environment.env === 'development' ? http : https;
  const agent = new methodFunction['Agent'](agentOptions);

  request({
    url: `${environment.gcmgrBiMethod}${environment.gcmgrBiIp}:${environment.gcmgrBiPort}/retailers`,
    method: 'GET',
    agent: agent
  }, function (err, resp, body) {
    if (err) {
      if (res.status) {
        const resResponse = res.status(500);
        if (resResponse) {
          return resResponse.json(err);
        }
      }
    }
    Retailer.update({}, {
      $unset: {
        gsId: false
      },
    }, {
      multi: true
    })
    .then(() => {
      const promises = [];
      body = JSON.parse(body);
      let totalName = '';
      body.forEach(biRetailer => {
        let name = biRetailer.name;
        name = name.replace('/', '.');
        name = name.replace(/s/g, 's?');
        name = name.replace(/\s/g, '[\/\\s\'\"]+');
        name = new RegExp(name, 'i');
        totalName = `${totalName}${name}|`;
        const toSet = {};
        // GS ID
        if (biRetailer.retailer_id) {
          toSet.gsId = biRetailer.retailer_id;
        }
        // Addtoit ID
        if (biRetailer.ai_id) {
          toSet.aiId = biRetailer.ai_id;
        }
        promises.push(Retailer.update({name: name}, {
          $set: toSet
        }).then(() => {}));
      });
      return Promise.all(promises);
    })
    .then(() => res.json());
  });
}

/**
 * Create a new retailer based on an old one (such as a merch credit retailer)
 */
export function createNewRetailerBasedOnOldOne(req, res) {
  const body = req.body.retailer;
  Retailer.findOne({
    $or: [
      {gsId: body.gsId},
      {retailerId: body.gsId}
    ]
  })
  .then(retailer => {
    if (!retailer) {
      return res.status(400).json();
    }
    const old = retailer.toObject();
    old.name = body.name;
    old.original = old._id;
    delete old._id;
    const newRetailer = new Retailer(old);
    return newRetailer.save();
  })
  .then(retailer => {
    if (!retailer) {
      return;
    }
    return res.json();
  })
  .catch(async err => {
    await ErrorLog.create({
      method: 'createNewRetailerBasedOnOldOne',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  });
}

/**
 * Create new retailer
 */
export function createRetailer(req, res){
  const body = req.body;

  Retailer.findOne({
    name: body.name
  })
    .then(result => {
      if(!result){
        let retailer = new Retailer(body);
        getActiveSmps().forEach(smp => {
          // Not decimal
          if (typeof retailer.sellRates[smp] === 'number' && retailer.sellRates[smp] > 1) {
            retailer.sellRates[smp] = (retailer.sellRates[smp] / 100).toFixed(2);
          }
        });

        retailer.save()
        .then(() => res.json({msg: "Retailer saved successfully"}));
      }else{
        res.status(400).json({
          msg:"Retailer exists"
        });
      }
    })
  .catch(async err => {
    await ErrorLog.create({
      method: 'createRetailer',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  });
}
/**
 * Toggle disable retailers for a company
 */
export function toggleDisableForCompany(req, res) {
  const body = req.body;
  Company.findOne({
    _id: body.company
  })
  .then(company => {
    body.retailers.forEach(retailer => {
      const index = company.disabledRetailers.indexOf(retailer.toString());
      // Exists, so remove
      if (index !== -1) {
        company.disabledRetailers.splice(index, 1);
      } else {
        company.disabledRetailers.push(retailer);
      }
    });
    return company.save();
  })
  .then(() => res.json())
  .catch(async err => {
    await ErrorLog.create({
      method: 'toggleDisableForCompany',
      controller: 'retailer.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json({});
  });
}
