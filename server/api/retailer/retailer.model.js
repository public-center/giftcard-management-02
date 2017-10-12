'use strict';

import {getActiveSmps} from '../../helpers/smp';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
import createIndexes from '../../config/indexDb';
const Schema = mongoose.Schema;

const smpEnumToAttr = {
  saveya: 'saveYa',
  cardcash: 'cardCash',
  cardpool: 'cardPool',
  giftcardzen: 'giftcardZen'
};

const RetailerSchema = new Schema({
  // Company name
  name: {
    type: String,
    required: true
  },
  // GiftSquirrel ID
  gsId: String,
  // Addtoit ID
  aiId: String,
  image: {
    url: String,
    original: String,
    type: String
  },
  imageUrl: String,
  imageOriginal: String,
  imageType: String,
  buyRate: Number,
  sellRates: {
    saveYa: Number,
    cardCash: Number,
    cardPool: Number,
    giftcardZen: Number,
    best: Number,
    sellTo: String
  },
  sellRatesMerch: {
    saveYa: Number,
    cardCash: Number,
    cardPool: Number,
    giftcardZen: Number,
  },
  // Spelling
  smpSpelling: {
    saveYa: {type: String},
    cardCash: {type: String},
    cardPool: {type: String},
    giftcardZen: {type: String},
  },
  // Max/min for retailers by SMP
  smpMaxMin: {
    saveYa: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    cardCash: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    cardPool: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    giftcardZen: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    }
  },
  smpMaxMinMerch: {
    saveYa: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    cardCash: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    cardPool: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    },
    giftcardZen: {
      max: {type: Number, min: 0},
      min: {type: Number, min: 0}
    }
  },
  // SMP type (electronic, physical, disabled)
  smpType: {
    saveYa: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    cardCash: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    cardPool: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    giftcardZen: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase}
  },
  smpTypeMerch: {
    saveYa: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    cardCash: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    cardPool: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
    giftcardZen: {type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase},
  },
  // API IDs (the ID for SMP APIs)
  apiId: {
    saveYa: String,
    cardCash: String,
    cardPool: String,
    giftcardZen: String
  },
  // Verification info
  verification: {
    url: String,
    phone: String
  },
  // CardQuiry buy rate
  buyRates: Object,
  buyRateRelations: [{type: Schema.Types.ObjectId, ref: 'BuyRate'}],
  original: {type: Schema.Types.ObjectId, ref: 'Retailer'},
  pinRequired: {type: Boolean, default: false}
});

// Indexes
const indexes = [
  [{name: 1}],
  [{gsId: 1}],
  [{aiId: 1}],
];
createIndexes(RetailerSchema, indexes);

/**
 * Validations
 */

// Validate empty name
RetailerSchema
  .path('name')
  .validate(function (name) {
    return name.length;
  }, 'Retailer name cannot be blank');

// Validate duplicate names
RetailerSchema
  .path('name')
  .validate(function(name, respond) {
    this.constructor.findOne({name}, (err, company) => {
      if (err) {
        throw err;
      }
      if (company) {
        if (this.id === company.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
  }, 'Retailer name is already taken');

RetailerSchema.methods.getSellRatesMerch = function () {
  const sellRates = this.sellRatesMerch || {};

  getActiveSmps().forEach(smp => {
    if (typeof sellRates[smpEnumToAttr[smp]] === 'undefined') {
      sellRates[smpEnumToAttr[smp]] = this.sellRates[smpEnumToAttr[smp]];
    }
  });

  return sellRates;
};

RetailerSchema.methods.getSmpMaxMinMerch = function () {
  const maxMin = this.smpMaxMinMerch || {};

  getActiveSmps().forEach(smp => {
    if (typeof maxMin[smpEnumToAttr[smp]] === 'undefined') {
      maxMin[smpEnumToAttr[smp]] = {};
    }

    ['max', 'min'].forEach(k => {
      if (typeof maxMin[smpEnumToAttr[smp]][k] === 'undefined') {
        maxMin[smpEnumToAttr[smp]][k] = this.smpMaxMin[smpEnumToAttr[smp]][k];
      }
    });
  });

  return maxMin;
};

RetailerSchema.methods.getSmpTypeMerch = function () {
  const types = this.smpTypeMerch || {};

  getActiveSmps().forEach(smp => {
    if (typeof types[smpEnumToAttr[smp]] === 'undefined') {
      types[smpEnumToAttr[smp]] = this.smpType[smpEnumToAttr[smp]];
    }
  });

  return types;
};

/**
 * Populate a retailer attached to a card or inventory with merch values if necessary
 * @param parent Card or inventory record
 */
RetailerSchema.methods.populateMerchValues = (parent) => {
  let retailer = parent.retailer;
  if (parent.merchandise) {
    // Assign merch values, assume default if not set
    const merchRates = retailer.getSellRatesMerch();
    const merchMaxMin = retailer.getSmpMaxMinMerch();
    const merchType = retailer.getSmpTypeMerch();
    retailer = retailer.toObject();
    Object.assign(retailer.sellRates, merchRates.toObject());
    Object.assign(retailer.smpMaxMin, merchMaxMin.toObject());
    Object.assign(retailer.smpType, merchType.toObject());
    return retailer;
  } else {
    // Convert to object if necessary
    if (retailer.constructor.name === 'model') {
      return retailer.toObject();
    } else {
      return retailer;
    }
  }
};

RetailerSchema.methods.getSellRates = function () {
  getActiveSmps().forEach(smp => {
    if (typeof this.sellRates[smpEnumToAttr[smp]] === 'undefined') {
      this.sellRates[smpEnumToAttr[smp]] = 0;
    }
  });

  return this.sellRates;
};

RetailerSchema.methods.getSmpMaxMin = function () {
  getActiveSmps().forEach(smp => {
    if (typeof this.smpMaxMin[smpEnumToAttr[smp]] === 'undefined') {
      this.smpMaxMin[smpEnumToAttr[smp]] = {max: null, min: 0};
    }

    ['max', 'min'].forEach(k => {
      if (typeof this.smpMaxMin[smpEnumToAttr[smp]][k] === 'undefined') {
        this.smpMaxMin[smpEnumToAttr[smp]][k] = k === 'min' ? 0 : null;
      }
    })
  });

  return this.smpMaxMin;
};

RetailerSchema.methods.getSmpType = function () {
  getActiveSmps().forEach(smp => {
    if (typeof this.smpType[smpEnumToAttr[smp]] === 'undefined') {
      this.smpType[smpEnumToAttr[smp]] = 'disabled';
    }
  });

  return this.smpType;
};

RetailerSchema.methods.getSmpSpelling = function () {
  getActiveSmps().forEach(smp => {
    if (typeof this.smpSpelling[smpEnumToAttr[smp]] === 'undefined' || this.smpSpelling[smpEnumToAttr[smp]] === '') {
      this.smpSpelling[smpEnumToAttr[smp]] = this.name;
    }
  });

  return this.smpSpelling;
};

function convertToLowerCase(whatever) {
  if (whatever) {
    return whatever.toLowerCase();
  }
}

RetailerSchema.set('toJSON', {getters: true});
RetailerSchema.set('toObject', {getters: true});

module.exports = mongoose.model('Retailer', RetailerSchema);
