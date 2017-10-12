'use strict';

var _smp = require('../../helpers/smp');

var _indexDb = require('../../config/indexDb');

var _indexDb2 = _interopRequireDefault(_indexDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var smpEnumToAttr = {
  saveya: 'saveYa',
  cardcash: 'cardCash',
  cardpool: 'cardPool',
  giftcardzen: 'giftcardZen'
};

var RetailerSchema = new Schema({
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
    giftcardZen: Number
  },
  // Spelling
  smpSpelling: {
    saveYa: { type: String },
    cardCash: { type: String },
    cardPool: { type: String },
    giftcardZen: { type: String }
  },
  // Max/min for retailers by SMP
  smpMaxMin: {
    saveYa: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    cardCash: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    cardPool: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    giftcardZen: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    }
  },
  smpMaxMinMerch: {
    saveYa: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    cardCash: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    cardPool: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    },
    giftcardZen: {
      max: { type: Number, min: 0 },
      min: { type: Number, min: 0 }
    }
  },
  // SMP type (electronic, physical, disabled)
  smpType: {
    saveYa: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    cardCash: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    cardPool: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    giftcardZen: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase }
  },
  smpTypeMerch: {
    saveYa: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    cardCash: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    cardPool: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase },
    giftcardZen: { type: String, enum: ['physical', 'electronic', 'disabled'], get: convertToLowerCase, set: convertToLowerCase }
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
  buyRateRelations: [{ type: Schema.Types.ObjectId, ref: 'BuyRate' }],
  original: { type: Schema.Types.ObjectId, ref: 'Retailer' },
  pinRequired: { type: Boolean, default: false }
});

// Indexes
var indexes = [[{ name: 1 }], [{ gsId: 1 }], [{ aiId: 1 }]];
(0, _indexDb2.default)(RetailerSchema, indexes);

/**
 * Validations
 */

// Validate empty name
RetailerSchema.path('name').validate(function (name) {
  return name.length;
}, 'Retailer name cannot be blank');

// Validate duplicate names
RetailerSchema.path('name').validate(function (name, respond) {
  var _this = this;

  this.constructor.findOne({ name: name }, function (err, company) {
    if (err) {
      throw err;
    }
    if (company) {
      if (_this.id === company.id) {
        return respond(true);
      }
      return respond(false);
    }
    respond(true);
  });
}, 'Retailer name is already taken');

RetailerSchema.methods.getSellRatesMerch = function () {
  var _this2 = this;

  var sellRates = this.sellRatesMerch || {};

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof sellRates[smpEnumToAttr[smp]] === 'undefined') {
      sellRates[smpEnumToAttr[smp]] = _this2.sellRates[smpEnumToAttr[smp]];
    }
  });

  return sellRates;
};

RetailerSchema.methods.getSmpMaxMinMerch = function () {
  var _this3 = this;

  var maxMin = this.smpMaxMinMerch || {};

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof maxMin[smpEnumToAttr[smp]] === 'undefined') {
      maxMin[smpEnumToAttr[smp]] = {};
    }

    ['max', 'min'].forEach(function (k) {
      if (typeof maxMin[smpEnumToAttr[smp]][k] === 'undefined') {
        maxMin[smpEnumToAttr[smp]][k] = _this3.smpMaxMin[smpEnumToAttr[smp]][k];
      }
    });
  });

  return maxMin;
};

RetailerSchema.methods.getSmpTypeMerch = function () {
  var _this4 = this;

  var types = this.smpTypeMerch || {};

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof types[smpEnumToAttr[smp]] === 'undefined') {
      types[smpEnumToAttr[smp]] = _this4.smpType[smpEnumToAttr[smp]];
    }
  });

  return types;
};

/**
 * Populate a retailer attached to a card or inventory with merch values if necessary
 * @param parent Card or inventory record
 */
RetailerSchema.methods.populateMerchValues = function (parent) {
  var retailer = parent.retailer;
  if (parent.merchandise) {
    // Assign merch values, assume default if not set
    var merchRates = retailer.getSellRatesMerch();
    var merchMaxMin = retailer.getSmpMaxMinMerch();
    var merchType = retailer.getSmpTypeMerch();
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
  var _this5 = this;

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof _this5.sellRates[smpEnumToAttr[smp]] === 'undefined') {
      _this5.sellRates[smpEnumToAttr[smp]] = 0;
    }
  });

  return this.sellRates;
};

RetailerSchema.methods.getSmpMaxMin = function () {
  var _this6 = this;

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof _this6.smpMaxMin[smpEnumToAttr[smp]] === 'undefined') {
      _this6.smpMaxMin[smpEnumToAttr[smp]] = { max: null, min: 0 };
    }

    ['max', 'min'].forEach(function (k) {
      if (typeof _this6.smpMaxMin[smpEnumToAttr[smp]][k] === 'undefined') {
        _this6.smpMaxMin[smpEnumToAttr[smp]][k] = k === 'min' ? 0 : null;
      }
    });
  });

  return this.smpMaxMin;
};

RetailerSchema.methods.getSmpType = function () {
  var _this7 = this;

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof _this7.smpType[smpEnumToAttr[smp]] === 'undefined') {
      _this7.smpType[smpEnumToAttr[smp]] = 'disabled';
    }
  });

  return this.smpType;
};

RetailerSchema.methods.getSmpSpelling = function () {
  var _this8 = this;

  (0, _smp.getActiveSmps)().forEach(function (smp) {
    if (typeof _this8.smpSpelling[smpEnumToAttr[smp]] === 'undefined' || _this8.smpSpelling[smpEnumToAttr[smp]] === '') {
      _this8.smpSpelling[smpEnumToAttr[smp]] = _this8.name;
    }
  });

  return this.smpSpelling;
};

function convertToLowerCase(whatever) {
  if (whatever) {
    return whatever.toLowerCase();
  }
}

RetailerSchema.set('toJSON', { getters: true });
RetailerSchema.set('toObject', { getters: true });

module.exports = mongoose.model('Retailer', RetailerSchema);
//# sourceMappingURL=retailer.model.js.map
