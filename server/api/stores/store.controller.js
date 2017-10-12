'use strict';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

const Retailer = require('../retailer/retailer.model');
const Card = require('../card/card.model');
import Receipt from '../receipt/receipt.model';
import ReceiptService from '../receipt/receipt.service';

import ErrorLog from '../errorLog/errorLog.model';
import {getGitRev} from '../../helpers/errors';

import _ from 'lodash';

/**
 * Retrieve store receipts
 */
export async function getReceipts(req, res) {
  const {perPage = 20, offset = 0} = req.query;

  try {
    const receiptService = new ReceiptService();
    const query = Object.assign({}, _.pick(req.query, ['created']), {store: req.user.store});
    const [totalReceipts, receipts] = await Promise.all([
      receiptService.getReceiptsCount(query),
      receiptService.getReceipts(query, {perPage: parseInt(perPage, 10), offset: parseInt(offset, 10)})
    ]);

    res.json({
      data: receipts,
      pagination: {
        total: totalReceipts
      }
    });
  } catch (err) {
    console.log('**************ERR IN GET RECEIPTS**********');
    console.log(err);
    await ErrorLog.create({
      method: 'getReceipts',
      controller: 'store.controller',
      revision: getGitRev(),
      stack: err.stack,
      error: err
    });
    return res.status(500).json(err);
  }
}
