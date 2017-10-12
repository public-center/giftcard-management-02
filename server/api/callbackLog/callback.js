import superagent from 'superagent';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Card from '../card/card.model';
import CallbackLog from './callbackLog.model';
import Inventory from '../inventory/inventory.model';
import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

import {recalculateTransactionAndReserve} from '../card/card.helpers';
import config from '../../config/environment';

export default class Callback {
  // Make a callback as part of a transaction
  /*
   {
   id: string <card ID>,
   number: string <last 4 digits of card>,
   claimedBalance: float <balance claimed by user>,
   verifiedBalance: float <balance verified by BI>,
   cqPaid: float <the amount CQ is paying before fees>,
   netPayout: float <the amount CQ is paying after fees>,
   prefix: string <card prefix>,
   cqAch: string<the CQ number in our payment to you>,
   finalized: boolean <whether the sale is finalized>,
   callbackType: string <type of callback>
   }
   */
  async makeCallbackFromCard(card, callbackUrl, callbackType, finalized) {
    let verifiedBalance = card.inventory.verifiedBalance;
    const data = {
      id: card._id,
      number: card.getLast4Digits(),
      claimedBalance: card.balance,
      verifiedBalance,
      cqPaid: card.inventory.transaction.cqPaid,
      netPayout: card.inventory.transaction.netPayout,
      prefix: card.inventory.transaction.prefix,
      cqAch: card.inventory.cqAch,
      finalized,
      callbackType
    };
    if (callbackType === 'cardFinalized' || callbackType === 'cqPaymentInitiated') {
      if (verifiedBalance === null || typeof verifiedBalance === 'undefined') {
        data.verifiedBalance = card.inventory.balance;
      }
    } else if (callbackType === 'needsAttention') {
      data.note = card.inventory.adminActivityNote
    }

    if (config.debug) {
      console.log('**************CALLBACK DATA FROM TRANSACTION**********');
      console.log(data);
    }

    // Save initial log entry
    let logEntry = await CallbackLog.create({
      callbackType,
      number: card.getLast4Digits(),
      pin: card.pin,
      claimedBalance: card.balance,
      verifiedBalance,
      cqPaid: card.inventory.transaction.cqPaid,
      netPayout: card.inventory.transaction.netPayout,
      prefix: card.inventory.transaction.prefix,
      cqAch: card.inventory.cqAch,
      finalized,
      success: false,
      url: callbackUrl,
      card: card._id,
      company: card.inventory.company,
      statusCode: 0
    });

    // Don't send from development
    if (config.env === 'development' || config.env === 'test') {
      return;
    }

    superagent.post(callbackUrl).send(data).end(async function (err, res) {
      if (!err) {
        if (config.debug) {
          console.log('Sent '+JSON.stringify(data)+' to '+callbackUrl);
        }
      } else {
        if (config.debug) {
          console.log('*************ERROR SENDING CALLBACK*************');
          console.log(err);
        }
      }
      let success = false;
      let text = '';
      let statusCode = 404;
      if (res) {
        success = res.status ? res.status < 300 : false;
        text = res.text ? res.text : '';
        statusCode = res.status;
      }

      logEntry.failResponse = success ? '' : text;
      logEntry.statusCode = statusCode;
      logEntry.success = success;
      logEntry.finalized = finalized;
      await logEntry.save();
    });
  }
  // Make a callback directly from a /bi requests
  /*
   {
   number: string <last 4 digits of card>,
   verifiedBalance: number <balance from BI>,
   pin: string <card pin>,
   callbackType: "balanceCB",
   prefix: string <card prefix>
   }
   */
  async makeCallbackFromLog(log, callbackUrl, callbackType) {
    let inventory = {};
    // This is actually a card, since we're using a card for BiUnavailable callbacks
    if (log.constructor.modelName === 'Card' && log.inventory) {
      inventory = await Inventory.findById(log.inventory);
    }
    const data = {
      number: log.getLast4Digits(),
      verifiedBalance: log.balance,
      pin: log.pin,
      callbackType
    };
    // BiLog callback
    if (log.prefix) {
      data.prefix = log.prefix
    // BiUnavailable callback
    } else if (inventory.isTransaction && inventory.transaction.prefix) {
      data.prefix = inventory.transaction.prefix;
    }

    if (config.debug) {
      console.log('**************CALLBACK DATA FROM LOG**********');
      console.log(data);
    }

    const logData = Object.assign(data, {
      success: false,
      url: callbackUrl,
      finalized: false,
      statusCode: 0
    });
    let logEntry = new CallbackLog(logData);
    logEntry = await logEntry.save();

    // Don't send from development
    if (config.env === 'development' || config.env === 'test') {
      return;
    }

    superagent.post(callbackUrl).send(data).end(async function (err, res) {
      if (!err) {
        console.log('Sent '+JSON.stringify(data)+' to '+callbackUrl);
      } else {
        console.log('*************ERROR SENDING CALLBACK*************');
        console.log(err);
      }

      let success = false;
      let text = '';
      let statusCode = 404;
      if (res) {
        success = res.status ? res.status < 300 : false;
        text = res.text ? res.text : '';
        statusCode = res.status;
      }
      // Update log with result
      logEntry.success = success;
      logEntry.failResponse = success ? '' : text;
      logEntry.statusCode = statusCode;
      logEntry.finalized = log.finalized;

      await logEntry.save();
    });
  }

  /**
   * Update inventory with the type of callback being made
   * @param inventory Inventory
   * @param callbackType Callback type
   * @return {Promise.<void>}
   */
  async updateInventory(inventory, callbackType) {
    if (!Array.isArray(inventory.transaction.callbacks)) {
      inventory.transaction.callbacks = [];
    }
    if (inventory.transaction.callbacks.indexOf(callbackType) === -1) {
      inventory.transaction.callbacks.push(callbackType);
      return await inventory.save();
    }
    return Promise.resolve(inventory);
  }
  /**
   * Notifies the company of a certain card
   *
   * @param {Object} card
   * @param {String} callbackType One of "balanceCB", "biComplete", "cardFinalized", "cqPaymentInitiated"
   * @param {String} callbackUrl Send a callback directly to this URL
   * @param {Boolean} resend Resend a callback which has already potentially been sent
   */
  async sendCallback(card, callbackType, callbackUrl = null, resend = false) {
    try {
      // BI callbacks
      if (callbackUrl) {
        return this.makeCallbackFromLog(card, callbackUrl, callbackType)
      }
      if (card.constructor.name !== 'model' || !card.inventory) {
        card = await Card.findOne({_id: card._id}).populate('inventory');
      }
      if (!card) {
        return;
      }
      if (card.inventory && card.inventory.isTransaction) {
        // Don't send the callback again unless we're purposely resending
        if (resend || card.inventory.transaction.callbacks.indexOf(callbackType) === -1) {
          // Update inventory with this type of callback
          card.inventory = await this.updateInventory(card.inventory, callbackType);
          const callbackUrl = await card.inventory.getCallbackUrl();
          if (callbackUrl) {
            let finalized = false;
            if (['receivedSmp', 'sendToSmp', 'rejected'].indexOf(card.inventory.activityStatus) > -1 || card.inventory.cqAch) {
              finalized = true;
              // Recalculate card to see if anything has changes
              await recalculateTransactionAndReserve(card.inventory);
              card = await Card.findById(card._id).populate('inventory');
            }
            await this.makeCallbackFromCard(card, callbackUrl, callbackType, finalized);
          }
        }
      }
    } catch (err) {
      await ErrorLog.create({
        method: 'refireCallbackFromList',
        controller: 'callbackLog.controller',
        revision: getGitRev(),
        stack: err.stack,
        error: err
      });
    }
  }
}
