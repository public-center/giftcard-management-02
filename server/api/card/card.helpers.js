import _ from 'lodash';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import {getActiveSmps} from '../../helpers/smp';
import {finalizeTransaction} from '../deferredBalanceInquiries/runDefers';
import Callback from '../callbackLog/callback';
import Card from '../card/card.model';
import Company from '../company/company.model';
import Inventory from '../inventory/inventory.model';
/**
 * Deterine who to sell the card to
 *
 * @return {
 *   rate: rate BEFORE margin
 *   type: card type
 *   smp: smp
 * }
 */
export function determineSellTo(retailer, balance, companySettings) {
  const availableSmps = getActiveSmps();
  const sellRates = retailer.sellRates;
  const types = retailer.smpType;
  // SMP hard limits
  const hardLimits = {
    saveya: {
      min: 20,
      max: 300
    },
    cardcash: {
      min: 1,
      max: 2000
    },
    cardpool: {
      min: 25,
      max: 1000
    },
    giftcardzen: {
      min: -Infinity,
      max: Infinity
    }
  };
  let thisHardLimit = {
    min: -Infinity, max: Infinity
  };

  let sellTo = {
    rate: 0,
    smp: null,
    type: null
  };

  const eligibleSmps = {};

  // Determine SMP
  _.forEach(sellRates, (rate, smp) => {
    if (typeof smp === 'string' && availableSmps.indexOf(smp.toLowerCase()) !== -1) {
      const maxMin = retailer.smpMaxMin[smp];
      let maxValid = true;
      let minValid = true;
      let hardMinValid = true;
      let hardMaxValid = true;
      // If no balance, determine best sell rate
      if (balance !== null && typeof maxMin !== 'undefined') {
        maxValid = typeof maxMin.max === 'number' ? maxMin.max >= balance : true;
        minValid = typeof maxMin.min === 'number' ? maxMin.min <= balance : true;
      }
      // Check max/min
      if (maxValid && minValid) {
        const smpLower = smp.toLowerCase();
        if (typeof rate === 'number' && rate >= sellTo.rate && availableSmps.indexOf(smpLower) !== -1 && types[smp] !== 'disabled') {
          if (companySettings && companySettings.cardType && companySettings.cardType !== 'both' &&
              companySettings.cardType !== types[smp]) {
            return;
          }

          thisHardLimit = hardLimits[smpLower];
          if (balance !== null) {
            hardMaxValid = thisHardLimit.max >= balance;
            hardMinValid = thisHardLimit.min <= balance;
          }
          if (hardMaxValid && hardMinValid) {
            sellTo.rate = rate;
            sellTo.smp = smp;
            sellTo.type = types[smp];

            if (eligibleSmps[rate]) {
              eligibleSmps[rate].push({
                smp,
                rate,
                type: types[smp]
              });
            } else {
              eligibleSmps[rate] = [{
                smp,
                rate,
                type: types[smp]
              }];
            }
          }
        }
      }
    }
  });

  // No eligible SMPs here
  if (!Object.keys(eligibleSmps).length) {
    return false;
  }

  let eligible = null;
  // Find eligible
  try {
    eligible = eligibleSmps[sellTo.rate];
  } catch (e) {
    console.log('**************NO ELIGIBLE SMPs**********');
    console.log(e);
    eligible = null;
  }
  // None found
  if (!eligible) {
    return false;
  }
  let smpPool = eligible.filter(smp => smp.type === 'electronic');
  if (!smpPool.length) {
    smpPool = eligible;
  }
  // Choose SMP randomly from highest rate
  if (smpPool && smpPool.length) {
    const smp = _.sample(smpPool);
    sellTo.smp = smp.smp;
    sellTo.type = smp.type;
  }

  // No SMP available
  if (sellTo.smp === null) {
    return false;
  }
  return sellTo;
}

/**
 * Recalculate transaction values for a transaction
 * @param inventory
 * @return {Promise.<void>}
 */
export async function recalculateTransactionAndReserve(inventory) {
  // Not a transaction
  if (!inventory.isTransaction) {
    return Promise.resolve(false);
  }
  // Undo previous reserve
  await inventory.removeReserve();
  // Get company settings
  const company = await Company.findOne(inventory.company);
  const companySettings = await company.getSettings();
  inventory = await finalizeTransaction(inventory, companySettings, true);
  // Create a new reserve
  const reserve = await inventory.createReserve();
  await Inventory.addToRelatedReserveRecords(reserve);
  const dbCard = await Card.findById(inventory.card).populate('inventory');
  // Rejected
  if (inventory.rejected) {
    await (new Callback()).sendCallback(dbCard, 'denial');
  } else if (inventory.credited) {
    await (new Callback()).sendCallback(dbCard, 'credit');
  }
  return Promise.resolve(true);
}
