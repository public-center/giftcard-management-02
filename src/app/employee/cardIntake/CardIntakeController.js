const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new WeakMap();
const state = new WeakMap();
const Window = new WeakMap();
const authService = new WeakMap();
const employeeService = new WeakMap();
const ngTableParams = new WeakMap();
/**
 * Card Intake
 */
export class CardIntakeController {
  constructor(CardIntakeService, $scope, $timeout, $state, $window, AuthService, Employee, NgTableParams) {
    'ngInject';
    Service.set(this, CardIntakeService);
    scope.set(this, $scope);
    state.set(this, $state);
    timeout.set(this, $timeout);
    Window.set(this, $window);
    authService.set(this, AuthService);
    employeeService.set(this, Employee);
    ngTableParams.set(this, NgTableParams);
    // Reference display data
    this.displayData = CardIntakeService.displayData;
    // Init listening for retailer search
    this.searchRetailersOnType();
    // Get existing cards on load
    this.getCards();
    // Auto select retailer if only one is shown
    this.autoSelectSingleRetailer();
    // Get company settings
    this.checkCompanySettings();
    // Check if selected customer has any denials
    this.checkCustomerDenials();
  }

  /**
   * Check if customer has any denials
   */
  checkCustomerDenials() {
    if (state.get(this).params.customerId === 'default') {
      return;
    }
    Service.get(this).getCustomer(state.get(this).params.customerId);
  }

  /**
   * Check relevant company settings
   */
  checkCompanySettings() {
    if (!employeeService.get(this).displayData.company) {
      scope.get(this).$watchCollection(() => employeeService.get(this).displayData.company, newVal => {
        if (newVal) {
          this.handleSettings();
        }
      });
    } else {
      this.handleSettings();
    }
  }

  /**
   * Hide buy rates if that's what this company is set to do
   */
  handleSettings() {
    const settings = employeeService.get(this).displayData.company.settings;
    const isManager = employeeService.get(this).isManager();
    // Managers only can set buy rates
    if (!isManager && settings.managersSetBuyRates) {
      employeeService.get(this).displayData.disableSetBuyRates = true;
    }
    // Auto-set buy rates
    if (settings.autoSetBuyRates && settings.autoBuyRates) {
      // Set to true, store rates
      this.displayData.autoSetBuyRates = true;
      this.displayData.autoBuyRates = settings.autoBuyRates;
    }
    // Auto-sell
    this.displayData.autoSell = settings.autoSell;
  }

  /**
   * Search retailers as
   */
  searchRetailersOnType() {
    let timer;
    scope.get(this).$watch(() => this.displayData.retailerQuery, newVal => {
      // Remove results if search is deleted
      if (!newVal) {
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
        if (newVal) {
          Service.get(this).searchRetailers(newVal);
        }
      }, 250);
    });
  }

  /**
   * Auto select a retailer if only one remains
   */
  autoSelectSingleRetailer() {
    scope.get(this).$watchCollection(() => this.displayData.retailers, newVal => {
      // Auto select if only one left
      if (newVal.length === 1) {
        this.selectRetailer(newVal[0]);
      }
    });
  }

  /**
   * Select a retailer
   */
  selectRetailer(retailer) {
    // Internal retailer ID
    this.displayData.newCard.retailer = retailer._id;
    // Retailer UID
    this.displayData.newCard.uid = retailer.uid;
    this.displayData.retailers = this.displayData.retailers.filter(displayRetailer => {
      return displayRetailer._id === retailer._id;
    });
  }

  /**
   * Input a new card
   */
  newCard() {
    Service.get(this).newCard(state.get(this).params.customerId)
    .then(() => {
      angular.element('.modal').modal('hide');
      // Clear modal
      this.clearNewCard();
    })
    .catch(() => {
      // Clear modal
      this.clearNewCard();
      angular.element('.modal').modal('hide');
      // Display modal
      scope.get(this).$broadcast('show-modal', 'card-exists-in-system');
    });
  }

  /**
   * Close card already exists error message
   */
  closeCardExists() {
    scope.get(this).$broadcast('hide-modal', 'card-exists-in-system');
  }

  /**
   * Clear new card modal
   */
  clearNewCard() {
    this.oldRetailer = {
      retailer: this.displayData.newCard.retailer,
      uid: this.displayData.newCard.uid
    };
    this.oldRetailerQuery = this.displayData.retailerQuery;
    this.oldRetailerList = Object.assign({}, this.displayData.retailers);
    // Reset new card
    this.displayData.newCard = {};
    // Reset retailers list
    this.displayData.retailers = {};
    // Retailer query
    this.displayData.retailerQuery = '';
  }

  /**
   * Use the same brand as last time
   */
  useSameBrand() {
    // Reset new card
    this.displayData.newCard = Object.assign({}, this.oldRetailer);
    // Reset retailers list
    this.displayData.retailers = Object.assign({}, this.oldRetailerList);
    // Input query
    this.displayData.retailerQuery = this.oldRetailerQuery;
  }

  /**
   * Get cards on load
   */
  getCards() {
    Service.get(this).getCards(state.get(this).params.customerId)
      // Check if card is valid on load
    .then(() => {
      angular.forEach(this.displayData.cards, card => {
        Service.get(this).setValidity(card);
      });
    })
    // Card totals
    .then(() => {
      this.displayTotals(this.displayData.cards);
    });
  }

  /**
   * Display totals as they are received
   */
  displayTotals(cardsRecords) {
    scope.get(this).$watch(() => cardsRecords, cards => {
      Service.get(this).displayTotals(this.displayData.totals, cards);
    }, true);
  }

  /**
   * Return balance status text
   * @param balanceStatus Balance status
   * @param valid If card is valid
   */
  balanceStatusText(balanceStatus, valid) {
    if (!valid) {
      return 'Invalid card information';
    }
    switch (balanceStatus) {
      case 'received':
        return 'Balance received';
      case 'deferred':
        return 'Balance inquiry pending';
      case 'unchecked':
        return 'Balance status unchecked';
      case 'manual':
        return 'Manual balance check required';
      case 'bad':
        return 'Invalid card information';
    }
  }

  /**
   * Edit a card modal
   * @param card
   */
  editCardModal(card) {
    this.displayData.editCard = card;
    angular.element('#editCardModal').modal('show');
  }

  /**
   * Submit card edits
   */
  editCard() {
    Service.get(this).editCard()
    .then(() => {
      angular.element('#editCardModal').modal('hide');
    });
  }

  /**
   * Delete card modal
   * @param card
   */
  deleteCardModal(card) {
    this.displayData.deleteCardId = card._id;
    scope.get(this).$broadcast('show-modal', 'delete-card-confirm');
  }

  /**
   * Delete card
   */
  deleteCard() {
    Service.get(this).deleteCard()
    .then(() => {
      scope.get(this).$broadcast('hide-modal', 'delete-card-confirm');
    });
  }

  /**
   * Change a card's buy amount manually
   */
  changeBuyAmount(card) {
    Service.get(this).changeBuyAmount(card);
  }

  /**
   * Change buy rate for a specific card
   * @param card
   */
  changeBuyRate(card) {
    Service.get(this).changeBuyRate(card);
  }

  /**
   * Change manual balance for a card
   * @param card
   */
  changeManualBalance(card) {
    Service.get(this).changeManualBalance(card);
  }

  /**
   * Get the text for buy amount
   * @param card
   */
  getBuyAmountText(card) {
    let maxBuyAmount = Service.get(this).exceedsMaxBuyAmount(card);
    // Invalidity reasons
    if (card.errors) {
      if (card.errors.invalidBalance) {
        return 'Invalid balance';
      }
      if (card.errors.buyAmount) {
        return 'Invalid buy amount';
      }
      if (card.errors.buyRate) {
        return 'Invalid buy rate';
      }
      if (card.errors.backend) {
        return 'Invalid card information';
      }
      if (card.errors.maxBuyAmountExceeds) {
        maxBuyAmount = this.displayData.maxBuyAmount;
      }
    }
    // Over max amount
    if (maxBuyAmount) {
      return `Buy amount cannot exceed $${maxBuyAmount}`;
    }
    return 'Buy amount';
  }

  /**
   * Get the label class for buy amount
   * @param card
   */
  getBuyAmountLabelClass(card) {
    let invalid = false;
    // Display invalid
    if (card.errors) {
      if (card.errors.invalidBalance) {
        invalid = true;
      }
      if (card.errors.balance) {
        invalid = true;
      }
      if (card.errors.buyRate) {
        invalid = true;
      }
      if (card.errors.backend) {
        invalid = true;
      }
      if (card.errors.maxBuyAmountExceeds) {
        invalid = true;
      }
      if (invalid) {
        return invalid;
      }
    }
    return !!Service.get(this).exceedsMaxBuyAmount(card);
  }

  /**
   * Get row class for this card
   * @param card
   */
  getRowClass(card) {
    if (!card.errors) {
      return false;
    }
    return Object.values(card.errors).filter(err => err).length ? 'card-error' : '';
  }

  /**
   * Retrieve a card's balance manually
   */
  getManualBalance(card) {
    // Expose verification info
    this.displayData.manualVerificationInfo = card.retailer.verification;
    scope.get(this).$broadcast('show-modal', 'manual-balance-info');
  }

  /**
   * Determine whether to display reset button
   */
  displayReset() {
    if (localStorage.getItem('cardChanges')) {
      return true;
    }
  }

  /**
   * Confirm reset cards
   */
  confirmResetCards() {
    scope.get(this).$broadcast('show-modal', 'reset-cards');
  }

  /**
   * Reset card changes
   */
  resetCards() {
    Service.get(this).resetCards();
    scope.get(this).$broadcast('hide-modal', 'reset-cards');
  }

  /**
   * Hide manual balance check window
   */
  hideManualBalanceCheck() {
    scope.get(this).$broadcast('hide-modal', 'manual-balance-info');
  }

  /**
   * Add cards to inventory
   */
  addToInventory() {
    // Display errors or add to inventory
    if (!this.displayCardErrors()) {
      scope.get(this).$broadcast('show-modal', 'add-to-inventory');
    }
  }

  /**
   * Display errors on cards
   */
  displayCardErrors() {
    let errors = false;
    let cards = [];
    const errorCards = Service.get(this).getCardsWithErrors();
    // Invalid cards (missing values)
    if (errorCards.invalid && errorCards.invalid.length) {
      errors = 'is missing data such as balance, buy rate, or buy amount.';
      cards = errorCards.invalid;
      scope.get(this).$broadcast('show-modal', 'error-cards');
    }
    // Cards missing customers
    else if (errorCards.noCustomer && errorCards.noCustomer.length) {
      errors = 'has no customer associated with it.';
      cards = errorCards.noCustomer;
    }
    // Generic
    else if (errorCards.genericErrors && errorCards.genericErrors.length) {
      errors = 'has an error, such as too high buy rate.';
      cards = errorCards.genericErrors;
      scope.get(this).$broadcast('show-modal', 'error-cards');
    }
    // Display errors or add to inventory
    if (errors) {
      scope.get(this).$broadcast('show-modal', 'error-cards');
      this.displayData.errorType = errors;
      this.displayData.errorCards = cards;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Dismiss error cards modal
   */
  hideErrorCards() {
    scope.get(this).$broadcast('hide-modal', 'error-cards');
  }

  /**
   * Add cards to inventory
   */
  completeAddToInventory(receipt) {
    const url = authService.get(this).user.role === 'corporate-admin'? 'main.corporate.customer.receipt' : 'main.employee.customer.receipt';
    return Service.get(this).addToInventory()
    .then(thisReceipt => {
      scope.get(this).$broadcast('hide-modal', 'add-to-inventory');
      scope.get(this).$broadcast('hide-modal', 'show-receipt-confirm');
      if (receipt) {
        state.get(this).go(url, {receiptId: thisReceipt._id});
      } else {
        state.get(this).go(url);
      }
    })
    .catch(() => {
      scope.get(this).$broadcast('hide-modal', 'add-to-inventory');
      scope.get(this).$broadcast('show-modal', 'error-cards-add-to-inventory');
    });
  }

  /**
   * Close general add to inventory error
   */
  closeErrorCards() {
    scope.get(this).$broadcast('hide-modal', 'error-cards-add-to-inventory');
  }

  /**
   * Confirm show receipt
   */
  openReceiptConfirm() {
    // Display errors or add to inventory
    if (!this.displayCardErrors()) {
      scope.get(this).$broadcast('show-modal', 'show-receipt-confirm');
    }
  }

  /**
   * Open receipt
   */
  openReceipt() {
    this.completeAddToInventory(true);
  }

  /**
   * Assign a customer if one is not set
   */
  getCustomers(card) {
    const user = authService.get(this).user;
    // Assign a customer if none exists on this card
    if (card.customer && card.customer.firstName === '__default__') {
      // Keep this card in memory
      this.cardToAssign = angular.copy(card);
      scope.get(this).$broadcast('show-modal', 'assign-customer');
      // Get customers
      Service.get(this).getCustomersThisCompany({storeId: user.store._id, companyId: user.company._id})
        .then(() => {
          this.tableParams = new (ngTableParams.get(this))({
            page: 1,
            count: 20
          }, {
            filterDelay: 0,
            data: this.displayData.customers,
            counts: []
          });
        });
    }
  }

  /**
   * Confirm assign customer
   */
  assignCustomerConfirm(customer) {
    scope.get(this).$broadcast('show-modal', 'assign-customer-confirm');
    this.customerToAssign = customer;
  }

  /**
   * Handle assigning customer
   */
  assignCustomer() {
    Service.get(this).assignCustomer({
      customer: this.customerToAssign,
      card: this.cardToAssign
    })
    .then(newCard => {
      scope.get(this).$broadcast('hide-modal', 'assign-customer-confirm');
      scope.get(this).$broadcast('hide-modal', 'assign-customer');
      // Find card and update it
      this.displayData.cards = this.displayData.cards.map(card => {
        return this.updateCardWithCustomer(card, newCard);
      });
      // Update totals
      this.displayTotals(this.displayData.cards);
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'assign-customer-failure');
    });
  }

  /**
   * Update an card after assigning a customer
   * @param card
   * @param newCard
   */
  updateCardWithCustomer(card, newCard) {
    if (card._id === newCard._id) {
      this.cardToAssign.customer = newCard.customer;
      return this.cardToAssign;
    }
    return card;
  }

  /**
   * Show create fake cards modal
   */
  showCreateFakeCards() {
    scope.get(this).$broadcast('show-modal', 'fake-cards');
  }

  /**
   * Create fake cards
   */
  createFakeCards() {
    Service.get(this).createFakeCards()
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'fake-cards-fail');
      })
      .finally(() => {
        scope.get(this).$broadcast('hide-modal', 'fake-cards');
      });
  }

  /**
   * Upload cards confirmation
   */
  uploadCardsConfirm() {
    scope.get(this).$broadcast('show-modal', 'upload-cards');
  }

  /**
   * Do file upload
   */
  uploadCardsFile() {
    Service.get(this).uploadCardsFile({file: this.cardsFile, customer: state.get(this).params.customerId})
      .then(() => {
        scope.get(this).$broadcast('hide-modal', 'upload-cards');
        scope.get(this).$broadcast('show-modal', 'upload-cards-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'upload-cards-failure');
      });
  }

  /**
   * Close card upload response
   */
  closeUploadResponse() {
    scope.get(this).$broadcast('hide-modal', 'upload-cards-failure');
    scope.get(this).$broadcast('hide-modal', 'upload-cards-success');
  }

  /**
   * Run BI on cards on page
   */
  runBi() {
    const cards = angular.copy(this.displayData.cards);
    const cardIds = cards.map(card => card._id);
    Service.get(this).runBi(cardIds)
      .then(() => {
        scope.get(this).$broadcast('show-modal', 'bi-running');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'bi-running-failure');
      });
  }
}
