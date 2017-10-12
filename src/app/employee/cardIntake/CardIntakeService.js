const Resource = new WeakMap();
const Auth = new WeakMap();
const defaultBuyRate = 60;
const timeout = new WeakMap();
const upload = new WeakMap();
const EmployeeService = new WeakMap();
import moment from 'moment';
/**
 * Card Intake service
 */
export class CardIntakeService {
  constructor(GcResource, SocketService, AuthService, $timeout, Upload, Employee) {
    'ngInject';
    Resource.set(this, GcResource);
    Auth.set(this, AuthService);
    timeout.set(this, $timeout);
    upload.set(this, Upload);
    EmployeeService.set(this, Employee);
    SocketService.syncCardUpdates('card', {
      save: this.updateViaSocket.bind(this),
      outOfRuns: this.outOfRuns.bind(this)
    });
    // Display
    this.displayData = {
      // New card
      newCard: {},
      // Edit card
      editCard: {},
      // ID of card to delete
      deleteCardId: null,
      // Existing cards
      cards: [],
      // Receipt cards
      receipt: {},
      // List of available retailers
      retailers: {},
      // Retailer query
      query: '',
      // Buy rates (retailer _id as key)
      buyRates: {},
      // Maximum amount a card is allowed to sell for
      maxBuyAmount: 2000,
      // Manual verification
      manualVerificationInfo: {},
      // Cards with errors on them on submission
      errorCards: [],
      // Totals
      totals: {
        electronic: 0,
        manual: 0
      },
      // Receipt totals
      receiptTotals: {
        electronic: 0,
        manual: 0
      },
      // Customer for receipt
      customer: {},
      // Receipt date
      date: new Date(),
      // Auto-sell setting
      autoSell: true,
      // Auto set buy rates
      autoSetBuyRates: false,
      // Auto buy rates
      autoBuyRates: null,
      // Customers (for assigning customer to a card)
      customers: []
    };
    // Safe data
    this.safeData = {
      // Unmodified cards
      cards: []
    };
  }

  /**
   * Retrieve the current customer
   */
  getCustomer(customerId) {
    return Resource.get(this).resource('Employee:getCustomer', customerId)
      .then(customer => {
        this.displayData.customer = customer;
      });
  }

  /**
   * Get all available retailers
   */
  getRetailers(query) {
    return Resource.get(this).resource('Employee:getRetailersForIntake', query)
      .then(res => {
        this.displayData.retailers = res;
      });
  }

  /**
   * Input a new card
   */
  newCard(customerId) {
    const params = Object.assign(this.displayData.newCard, {customer: customerId}, {userTime: moment().format()});
    return Resource.get(this).resource('Employee:newCard', params)
      .then(card => {
        // Add to display
        this.displayData.cards.push(card);
        // Add to safe
        this.safeData.cards[card._id] = angular.copy(card);
        // Check balance
        this.checkBalance(card);
      });
  }

  /**
   * Set buy amount for a card
   * @param card
   */
  setBuyAmount(card) {
    // Set balance if we have one
    if (card.balance) {
      try {
        card.buyAmount = card.buyRate * card.balance;
      } catch (e) {
        card.buyAmount = 0;
      }
    }
  }

  /**
   * Check a card's balance
   */
  checkBalance(card) {
    // Valid balance received from API
    if (card.balanceStatus === 'received' && (card.retailer.gsId) && card.valid) {
      card.balanceDisplayWidth = this.setBalanceWidth(card.balanceStatus, card.valid);
      // If we have a valid card with no balance, check it
    } else if (card.balanceStatus !== 'received' && (card.retailer.gsId) && card.valid) {
      return Resource.get(this).resource('Employee:checkBalance', card);
      // If unsupported retailer, set as manual
    } else if (!card.retailer.gsId) {
      card.balanceStatus = 'manual';
      card.balanceDisplayWidth = this.setBalanceWidth(card.balanceStatus, card.valid);
    }
    // Set buy amount if we have
    this.setBuyAmount(card);
  }

  /**
   * Update via a socket response
   */
  updateViaSocket(updatedCard) {
    angular.forEach(this.displayData.cards, card => {
      // Update card
      if (card._id === updatedCard._id) {
        // Update card, set balance display width
        card.balance = updatedCard.balance;
        card.inventory = updatedCard.inventory;
        // Update unless the displayed card is manual
        if (card.balanceStatus !== 'manual') {
          card.balanceStatus = updatedCard.balanceStatus;
        }
        card.balanceDisplayWidth = this.setBalanceWidth(card.balanceStatus, card.valid);
      }
      // Set buy amount if we have
      this.setBuyAmount(card);
    });
    // Update totals
    this.displayTotals(this.displayData.totals, this.displayData.cards);
  }

  /**
   * Card is out of deferred checks, and won't be checked again
   * @param cardId
   */
  outOfRuns(cardId) {
    // Update card for which there will be no more balance checks
    angular.forEach(this.displayData.cards, card => {
      if (card._id === cardId) {
        card.balanceStatus = 'manual';
        card.balanceDisplayWidth = this.setBalanceWidth(card.balanceStatus, card.valid);
      }
    });
  }

  /**
   * Set balance display widthac
   * @param balanceStatus
   * @param valid Card is valid
   * @returns {number}
   */
  setBalanceWidth(balanceStatus, valid) {
    let balanceDisplayWidth = 0;
    // Invalid, return no width
    if (!valid) {
      return balanceDisplayWidth;
    }
    // Set width of progress bar
    if (balanceStatus === 'received') {
      balanceDisplayWidth = 2;
    } else if (balanceStatus === 'deferred') {
      balanceDisplayWidth = 1;
    }
    return balanceDisplayWidth;
  }

  /**
   * Get existing cards on load
   */
  getCards(customerId) {
    return Resource.get(this).resource('Employee:getCards', customerId)
    .then(cards => {
      // Cards
      this.displayData.cards = cards.data || [];
      // Set balance width, query balance for cards not yet checked
      angular.forEach(this.displayData.cards, card => {
        card.balanceDisplayWidth = this.setBalanceWidth(card.balanceStatus, card.valid);
      });
      this.displayData.cards = this.displayData.cards.map(card => {
        if (typeof card.buyRate === 'number' && typeof card.balance === 'number') {
          card.buyAmount = card.buyRate * card.balance;
        }
        return card;
      });
    });
  }

  /**
   * Retrieve cards for display on receipt
   * @param customerId
   */
  getCardsForReceipt(customerId) {
    return Resource.get(this).resource('Employee:getCardsForReceipts', customerId)
      .then(inventories => {
        const cards = inventories.data.map(inventory => {
          inventory.card.retailer = inventory.retailer;
          return inventory.card;
        });
        // Cards
        this.displayData.cards = cards;
      });
  }

  /**
   * Edit an existing card
   */
  editCard() {
    return Resource.get(this).resource('Employee:editCard', this.displayData.editCard);
  }

  /**
   * Delete a card
   */
  deleteCard() {
    return Resource.get(this).resource('Employee:deleteCard', this.displayData.deleteCardId)
      .then(() => {
        // Filter out the old card
        this.displayData.cards = this.displayData.cards.filter(card => {
          return card._id !== this.displayData.deleteCardId;
        });
        this.displayData.deleteCardId = null;
        // Update totals
        this.displayTotals(this.displayData.totals, this.displayData.cards);
      });
  }

  /**
   * Determine the buy amount once buy rate has been set
   * @param card
   */
  determineBuyAmountBasedOnRate(card) {
    try {
      const balance = card.balance;
      return balance ? parseFloat(balance) * (card.buyRate / 100) : null;
    } catch (e) {
      console.log('**************DETERMINE BUY RATE ERROR**********');
      console.log(e);
      return 0;
    }
  }

  /**
   * Update a card on manual change
   * @param card
   * @param prop
   * @param value
   * @param message Message to user
   */
  updateCardOnChange(card, prop, value, message) {
    // Update this card
    angular.forEach(this.displayData.cards, existingCard => {
      try {
        if (existingCard._id === card._id) {
          existingCard[prop] = parseFloat(value.toFixed(2));
        }
      } catch (e) {
        existingCard[prop] = message || 'invalid';
      }
    });
    // Check for validity
    this.setValidity(card);
  }

  /**
   * Determine if an invalid number has been entered
   * @param number
   */
  checkIfValidNumber(number) {
    return /^[\d.]+$/.test(number);
  }

  /**
   * Determine if an invalid buy rate has been entered
   * @param number
   */
  checkIfValidBuyRate(number) {
    return number === '0' || number === '0.' || number === '.' ||  /^0?.[\d]+$/.test(number);
  }

  /**
   * Change card's buy amount
   * @param card
   */
  changeBuyAmount(card) {
    let buyRate;
    // Calculate buy rate
    try {
      const balance = card.balance;
      // If not valid, don't let it be set as valid
      if (!this.checkIfValidNumber(balance)) {
        return this.updateCardOnChange(card, 'buyRate', 'invalid');
      }
      // Determine actual buy rate
      buyRate = (parseFloat(card.buyAmount) / parseFloat(balance));
      if (isNaN(buyRate)) {
        buyRate = 'invalid';
      }
      // Invalid
    } catch (e) {
      buyRate = 'invalid';
    }
    // Update this card
    this.updateCardOnChange(card, 'buyRate', buyRate);
  }

  /**
   * Change buy amount
   */
  changeBuyRate(card) {
    let buyAmount;
    // Calculate buy rate
    try {
      const balance = card.balance;
      // If not valid, don't let it be set as valid
      if (!this.checkIfValidBuyRate(card.buyRate)) {
        return this.updateCardOnChange(card, 'buyRate', 'invalid', 'Invalid -- Use decimals');
      }
      buyAmount = parseFloat(balance) * parseFloat(card.buyRate);
      if (isNaN(buyAmount)) {
        buyAmount = 'invalid';
      }
      // Invalid
    } catch (e) {
      buyAmount = 'invalid';
    }
    // Update this card
    this.updateCardOnChange(card, 'buyAmount', buyAmount);
  }

  /**
   * Change a balance for a card manually
   * @param card
   */
  changeManualBalance(card) {
    let buyAmount;
    try {
      // No buy rate specified
      if (!card.buyRate) {
        buyAmount = 'Enter a buy rate';
        // Buy rate specified
      } else {
        buyAmount = parseFloat(card.balance) * parseFloat(card.buyRate)
      }
    } catch (e) {
      buyAmount = 'invalid';
    }
    this.updateCardOnChange(card, 'buyAmount', buyAmount);
    // Update balance on backend
    Resource.get(this).resource('Employee:updateCardBalance', card);
  }

  /**
   * Search retailers on type
   * @param searchVal
   */
  searchRetailers(searchVal) {
    let timer;
    // Remove results if search is deleted
    if (!searchVal) {
      this.displayData.retailers = [];
      if (timer) {
        timeout.get(this).cancel(timer);
        timer = null;
      }
    }
    if (timer) {
      timeout.get(this).cancel(timer);
      timer = null;
    }
    timer = timeout.get(this)(() => {
      if (this.displayData.retailerQuery) {
        //this.searchRetailers(searchVal);
        // Remove selected
        this.displayData.retailer = null;
        // Search for this query
        this.getRetailers(searchVal);
      }
    }, 150);
  }

  /**
   * Check if a value exceeds the maximum buy amount
   * @param card
   * @returns {*|boolean}
   */
  exceedsMaxBuyAmount(card) {
    // Maximum amount a card can be purchased for
    const maxBuyAmount = this.displayData.maxBuyAmount;
    if (card.buyAmount && parseFloat(card.buyAmount) > maxBuyAmount) {
      return maxBuyAmount;
    }
    return null;
  }

  /**
   * Reset card changes
   */
  resetCards() {
    // Reset cards
    angular.forEach(this.displayData.cards, card => {
      // Find safe
      const safeCard = JSON.parse(JSON.stringify(this.safeData.cards[card._id]));
      // Reset other potential changes
      // card.buyRate = safeCard.buyRate;
      // card.buyAmount = safeCard.buyAmount;
    });
    // Remove from localStorage
    localStorage.removeItem('cardChanges');
  }

  /**
   * Retrieve cards with errors only
   * @returns {*}
   */
  getCardsWithErrors() {
    // Get rid of references
    const cards = angular.copy(this.displayData.cards);
    // Make sure all cards have all necessary values
    const emptyCards = cards.filter(card => {
      if (card.adminCreated) {
        return false;
      }
      return !(card.buyAmount && (card.balance) && card.buyRate);
    });
    if (emptyCards.length) {
      return {
        invalid: emptyCards
      };
    }
    // Check to see that all cards have a customer assigned
    const noCustomer = cards.filter(card => card.customer.firstName === '__default__');
    if (noCustomer.length) {
      return {
        noCustomer
      };
    }
    const genericErrors = cards.filter(card => {
      if (card.adminCreated) {
        return false;
      }
      // See if there are any errors on this card
      for (const err in card.errors) {
        if (card.errors.hasOwnProperty(err)) {
          if (!card.errors[err]) {
            delete card.errors[err];
          }
        }
      }
      return card && angular.isObject(card.errors) && Object.keys(card.errors).length;
    });
    return {
      genericErrors
    };
  }

  /**
   * Display totals for cards in intake
   * @param totals
   * @param cards
   */
  displayTotals(totals, cards) {
    if (Array.isArray(cards)) {
      // Reset totals
      totals.electronic = 0;
      totals.manual = 0;
      cards.forEach(card => {
        try {
          // Balance or manual balance
          let balance = parseFloat(card.balance);
          // Buy rate, default to 60
          let buyRate;
          try {
            buyRate = parseFloat(card.buyRate || card.retailer.buyRate || defaultBuyRate);
          } catch (e) {
            buyRate = defaultBuyRate;
          }
          let finalBalance = balance * buyRate;
          if (isNaN(balance)) {
            finalBalance = 0;
          }
          // Electronic
          if (card.balanceStatus === 'received') {
            totals.electronic += finalBalance;
          } else {
            totals.manual += finalBalance;
          }
        } catch (e) {
          console.log('**************ERROR IN DISPLAY TOTALS**********');
          console.log(e);
        }
      });
    }
  }

  /**
   * Check validity of card
   * @param card Card document
   * Invalid reasons:
   * No balance
   * Invalid balance
   * Buy amount is invalid
   * Buy amount not set
   * buyRate is not set
   * buyRate is invalid
   * card is not reported not valid from backend
   */
  setValidity(card) {
    const invalidReason = {};
    // No balance set
    invalidReason.noBalance = typeof card.balance === 'undefined';
    // Invalid balance
    invalidReason.invalidBalance = card.balance === 'invalid';
    // Invalid buy amount
    invalidReason.buyAmount = (!card.buyAmount || card.buyAmount === 'invalid');
    // Buy amount exceeds max buy amount
    invalidReason.maxBuyAmountExceeds = card.buyAmount > this.displayData.maxBuyAmount;
    // Corporate buy rate is invalid or blank
    invalidReason.buyRate = (!card.buyRate || card.buyRate === 'invalid');
    // Backend errors
    invalidReason.backend = !card.valid;
    // Buy rate is too high
    invalidReason.buyRateLessThanMinBuyRate = card.buyRate >= card.sellRate;
    // Preserve other errors
    if (!card.errors) {
      card.errors = invalidReason;
    } else {
      card.errors = Object.assign(card.errors, invalidReason);
    }
  }

  /**
   * Add to inventory
   */
  addToInventory() {
    // Remove from localStorage
    localStorage.removeItem('cardChanges');
    return Resource.get(this).resource('Employee:addToInventory', {
      cards: this.displayData.cards,
      userTime: moment().format(),
      receipt: true
    });
  }

  /**
   * Retrieve customers for this company
   */
  getCustomersThisCompany(params) {
    // Don't get more than once
    if (this.displayData.customers.length) {
      return new Promise(resolve => resolve());
    }
    return Resource.get(this).resource('Employee:getAllCustomersThisCompany', params)
      .then(res => {
        this.displayData.customers = res.filter(customer => customer.firstName !== '__default__');
      });
  }

  /**
   * Assign customer
   * @param params Customer and inventory
   */
  assignCustomer(params) {
    return Resource.get(this).resource('Employee:assignCustomer', params);
  }

  /**
   * Create fake cards
   */
  createFakeCards() {
    return Resource.get(this).resource('Admin:createFakeCards', {count: this.displayData.fakeCards})
      .then(res => {
        // Add to display
        this.displayData.cards = this.displayData.cards.concat(res.cards);
      });
  }

  runBi(cards) {
    return Resource.get(this).resource('Admin:runBi', {cards});
  }

  /**
   * Upload cards file
   */
  uploadCardsFile(params) {
    return Resource.get(this).resource('Admin:uploadCards', Object.assign(params, {upload: upload.get(this)}))
  }

  // /**
  //  * Write any manual card changes to local storage
  //  */
  // writeChangesToLocalStorage(card) {
  //   try {
  //     const cardChanges = localStorage.getItem('cardChanges') ?
  //                         JSON.parse(localStorage.getItem('cardChanges')) : {};
  //     const changesThisCard = {};
  //     console.log('**************CARD**********');
  //     console.log(card);
  //     // Manual balance
  //     if (card.balance) {
  //       changesThisCard.balance = card.balance;
  //     }
  //     // Buy rate and amount
  //     changesThisCard.buyRate = card.buyRate;
  //     changesThisCard.buyAmount = card.buyAmount;
  //     // Save changes
  //     cardChanges[card._id] = changesThisCard;
  //     // Write to localStorage
  //     localStorage.setItem('cardChanges', JSON.stringify(cardChanges));
  //   } catch (e) {
  //     console.log('**************ERROR WRITING TO LOCAL STORAGE**********');
  //     console.log(e);
  //   }
  // }
  //
  // /**
  //  * Get changes to card from localStorage
  //  */
  // getChangesFromLocalStorage() {
  //   const cardChanges = JSON.parse(localStorage.getItem('cardChanges'));
  //   console.log('**************CARD CHANGES**********');
  //   console.log(cardChanges);
  //   // For each change, update card with changes
  //   angular.forEach(cardChanges, (change, cardId) => {
  //     this.displayData.cards.forEach(card => {
  //       if (card._id === cardId) {
  //         // Object.assign(card, change);
  //         console.log('**************CHANGE**********');
  //         console.log(change);
  //         console.log(card);
  //       }
  //     });
  //   });
  // }

  // /**
  //  * Determine if buy rate is too high
  //  * @param card
  //  */
  // determineBuyRateValid(card) {
  //   try {
  //     const bestRate = card.retailer.sellRate;
  //     const buyRate = parseFloat(card.buyRate);
  //     const margin = this.displayData.user.company.margin;
  //     return (bestRate - margin) < (buyRate / 100);
  //   } catch (e) {
  //     return false;
  //   }
  // }
  //
  // /**
  //  * Set the buy rates based on the set auto-buy rates
  //  */
  // determineBuyRate(card) {
  //   if (this.displayData.autoSetBuyRates) {
  //     // Already set
  //     if (card.buyRate) {
  //       return card.buyRate;
  //     }
  //     const bestSellRate = card.retailer.sellRate;
  //     const nearestRoundDown = Math.floor(bestSellRate * 100 / 5) * 5;
  //     const key = `_${nearestRoundDown}_${nearestRoundDown + 5}`;
  //     const customerMargin = this.displayData.autoBuyRates[key];
  //     return (bestSellRate - customerMargin) * 100;
  //   } else {
  //     // No auto-set
  //     if (this.displayData.buyRates[card.retailer._id]) {
  //       card.buyRate = this.displayData.buyRates[card.retailer._id] * 100;
  //     } else {
  //       card.buyRate = defaultBuyRate;
  //     }
  //   }
  // }
  //
  // /**
  //  * Map buy rates to cards which have not been manually altered
  //  */
  // mapBuyRatesToCards() {
  //   // Map buy rates to cards on this customer
  //   angular.forEach(this.displayData.cards, card => {
  //     // Don't mess with previously modified cards
  //     if (!card.buyRate) {
  //       // Set buy rate
  //       card.buyRate = this.determineBuyRate(card);
  //       // Set buy amount
  //       card.buyAmount = this.determineBuyAmountBasedOnRate(card);
  //     } else {
  //       // Set buy amount
  //       card.buyAmount = this.determineBuyAmountBasedOnRate(card);
  //     }
  //   });
  // }
  //
  // /**
  //  * Get buy rates for this company
  //  *
  //  * @todo This is inefficient
  //  */
  // getBuyRates() {
  //   const user = Auth.get(this).user;
  //   return Resource.get(this).resource('Employee:getBuyRatesForStore', {
  //       storeId: user.store._id,
  //       companyId: user.company._id
  //     })
  //   .then(res => {
  //     // Store buy rate in hash map, using retailer _id as key
  //     angular.forEach(res.buyRateRelations, buyRate => {
  //       this.displayData.buyRates[buyRate.retailerId] = buyRate.buyRate;
  //     });
  //     // Map buy rates to cards on this customer
  //     // this.mapBuyRatesToCards();
  //     // Store safe cards before any modification
  //     angular.forEach(JSON.parse(JSON.stringify(this.displayData.cards)), card => {
  //       this.safeData.cards[card._id] = card;
  //     });
  //   });
  // }
}
