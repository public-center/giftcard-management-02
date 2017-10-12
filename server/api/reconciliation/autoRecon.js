import moment from 'moment';
import 'moment-timezone';

import '../company/autoBuyRate.model';
import '../company/companySettings.model';
import '../inventory/InventoryCache.model';
import '../inventory/inventoryParamCache.model';
import '../log/logs.model';
import '../company/company.model';
import '../card/card.model';
import '../stores/store.model';
import '../reserve/reserve.model';

import Company from '../company/company.model';
import {reconcile, markAsReconciled} from '../company/company.controller';

const intervalLength = 3600 * 1000;

async function reconciliateCards() {
  try {
    const companies = await Company.find({}).populate('users');

    for (const company of companies) {
      const settings = await company.getSettings();
      const localTime = moment().tz(settings.timezone);

      if (localTime.hour() === 0) {
        // oshit, it's time for da midnite partaaayyyy!
        const fakeReq = {
          params: {
            companyId: company._id,
            storeId: 'all'
          },
          body: {
            userTime: localTime.format()
          },
          user: company.users[0]
        };
        const fakeRes = {
          status: function () { return this; },
          json: function () { return this; }
        };

        await reconcile(fakeReq, fakeRes);
        await markAsReconciled(fakeReq, fakeRes);
      }
    }
  } catch (e) {
    console.log('Aaargghhh, I neeed a medic baaag');
    console.log('I HAVE HAD IT WITH THESE MOTHERFUCKING SNAKES ON THIS MOTHERFUCKING PLANE!');
    console.log(e);
  }
}

export default async function autoRecon() {
  await reconciliateCards();
  setTimeout(() => {
    autoRecon();
  }, intervalLength);
}
