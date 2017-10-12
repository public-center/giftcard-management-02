const Service = new WeakMap();
const scope = new WeakMap();
const timeout = new WeakMap();
const state = new WeakMap();
const Window = new WeakMap();
const authService = new WeakMap();
const employeeService = new WeakMap();
const ngTableParams = new WeakMap();
const corpSettings = new WeakMap();
const rootScope = new WeakMap();
import moment from 'moment';
// Limit violation warning message
const warningMessage = 'Cards under $25 or over $1,000 face value may sell at a lower rate';
/**
 * Card Intake
 */
export class CardIntakeRevisedController {
  constructor(
    CardIntakeRevisedService, $scope, $timeout, $state, $window, AuthService, Employee, NgTableParams,
    CorpService, $rootScope) {
    'ngInject';
    Service.set(this, CardIntakeRevisedService);
    scope.set(this, $scope);
    state.set(this, $state);
    timeout.set(this, $timeout);
    Window.set(this, $window);
    authService.set(this, AuthService);
    employeeService.set(this, Employee);
    ngTableParams.set(this, NgTableParams);
    corpSettings.set(this, CorpService);
    rootScope.set(this, $rootScope);
    // Reference display data
    this.displayData = CardIntakeRevisedService.displayData;

    CorpService.getCompany(AuthService.user.company._id.toString()).then(() => {
      if (CorpService.displayData.company.settings.useAlternateGCMGR) {
        if (AuthService.user.role !== 'corporate-admin') {
          $state.go('main.employee.customer');
          return;
        }
      }

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
      // Listen for swipe
      this.listenForSwipe();
    });

    // Cards
    $scope.displayData = {
      display: [],
      safe: [],
      cards: [],
      disableReceipt: false
    };

    // Uploads
    this.fixesFile = null;
    this.cardsFile = null;
    this.cardsToInventoryAdmin = null;
    // Modified denials amount
    this.thisSaleDenials = null;
    // User role
    this.role = AuthService.user.role;

    $scope.$on('hide-modal', function (event, modalId) {
      if (modalId === 'scan-card') {
        $(document).off('keydown');
        $(document).off('keypress');
      }
    });

    this.storeSelected = null;
    this.storeId = null;
    // Check to make sure we have a store set
    const authStore = authService.get(this).store;
    try {
      this.storeSelected = authStore._id && authStore._id !== 'all';
      this.storeId = authStore._id;
    } catch (e) {
      this.storeSelected = null;
    }
    $scope.$on('corpStoreSelected', (event, thisStoreId) => {
      this.storeSelected = thisStoreId !== 'all';
      this.storeId = thisStoreId;
    });
  }

  /**
   * Listen for card swipe
   */
  listenForSwipe() {
    scope.get(this).$on('cqSwipe', (event, swipeString) => {
      const mcDonalds = /mcdonalds/i.test(swipeString);
      if (mcDonalds) {
        this.displayData.retailerQuery = 'McDonald\'s';
        scope.get(this).$broadcast('show-modal', 'cardIntakeModal');
        this.displayData.scanModalTitle = 'Enter the first four digits of the McDonalds gift card';
        scope.get(this).$broadcast('show-modal', 'scan-card', true);
        // Event to attach to listen for typing first few numbers of card
        const handleScap = this.handleScan.bind(this, swipeString);
        // Detach event when modal is hidden so we stop listening here and can hear the next card swipe
        $('#scan-card').on('hidden.bs.modal', () => {
          $(document).off('keydown', handleScap);
        });

        // Listen for input
        $(document).on('keydown', handleScap);
        // Remove on destroy
        scope.get(this).$on('$destroy', () => {
          $(document).off('keydown', handleScap);
          rootScope.get(this).$broadcast('stopSwipe');
        });
      }
    });
  }

  /**
   * Handle card scan
   * @param stripeData Mag stripe data
   * @param key
   */
  handleScan(stripeData, key) {
    const firstDigits = this.displayData.cardScanBegin;
    // Delete
    if ([8, 46].indexOf(key.keyCode) !== -1) {
      this.displayData.cardScanBegin = firstDigits.slice(0, firstDigits.length - 1);
      scope.get(this).$apply();
    }
    // Only allow 4
    if (firstDigits.length > 3) {
      return;
    }
    // Add new digit
    if (key.key.length === 1 && /[0-9]{1}/.test(key.key)) {
      this.displayData.cardScanBegin += key.key;
      // See if we have four digits
      if (this.displayData.cardScanBegin.length === 4) {
        this.displayData.allowScan = true;
        Service.get(this).handleMagStripe(this.displayData.cardScanBegin, stripeData);
        scope.get(this).$broadcast('hide-modal', 'scan-card');
        // Disable inputs so values aren't changed
        this.displayData.disableInputsOnSwipe = true
      }
      scope.get(this).$apply();
    }
  }

  /**
   * Check if customer has any denials
   */
  checkCustomerDenials() {
    if (state.get(this).params.customerId === 'default') {
      return;
    }
    Service.get(this).getCustomer(state.get(this).params.customerId)
    .then(() => {
      // Current customer has rejections
      if (this.customerHasDenials()) {
        scope.get(this).$broadcast('show-modal', 'has-rejections');
      }
    });
  }

  /**
   * Current customer has denials
   */
  customerHasDenials() {
    return this.displayData.customer.rejectionTotal && this.displayData.customer.rejectionTotal > 0;
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
    // Can only scan mcDonalds right now
    this.displayData.canScan = /mcdonald/i.test(retailer.name);
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
    Service.get(this).newCard({
      customerId: state.get(this).params.customerId,
      storeId: this.storeId
    })
    .then(() => {
      angular.element('.modal').modal('hide');
      this.displayData.intakeTotal = this.displayData.intakeTotal + 1;
    })
    .catch(err => {
      angular.element('.modal').modal('hide');
      const reason = err.data.reason;
      if (reason === 'noSmp') {
        scope.get(this).$broadcast('show-modal', 'no-smp');
      }
      else if (reason === 'cardExists') {
        // Display modal
        scope.get(this).$broadcast('show-modal', 'card-exists-in-system');
      }
    })
    .finally(() => {
      // Clear modal
      this.clearNewCard();
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
      uid: this.displayData.newCard.uid,
      merchandise: this.displayData.newCard.merchandise
    };
    this.oldRetailerQuery = this.displayData.retailerQuery;
    this.oldRetailerList = Object.assign({}, this.displayData.retailers);
    // Reset new card
    this.displayData.newCard = {};
    // Reset retailers list
    this.displayData.retailers = {};
    // Retailer query
    this.displayData.retailerQuery = '';
    this.displayData.disableInputsOnSwipe = false;
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
    })
    .then(() => {
      scope.get(this).displayData.cards = this.displayData.cards;
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
    .then(cards => {
      scope.get(this).$broadcast('hide-modal', 'delete-card-confirm');
      scope.get(this).displayData.cards = cards;
      this.displayData.intakeTotal = this.displayData.intakeTotal - 1;
    });
  }

  /**
   * Change a card's buy amount manually
   */
  changeBuyAmount(card, isManager = false) {
    Service.get(this).changeBuyAmount(card, isManager && this.displayData.managerValueOverride);
  }

  /**
   * Change buy rate for a specific card
   * @param card
   * @param isManager Manager user
   */
  changeBuyRate(card, isManager = false) {
    Service.get(this).changeBuyRate(card, isManager && this.displayData.managerValueOverride);
  }

  /**
   * Change manual balance for a card
   * @param card
   * @param isManager Manager user
   */
  changeManualBalance(card, isManager = false) {
    Service.get(this).changeManualBalance(card, isManager && this.displayData.managerValueOverride);
  }

  /**
   * Get the text for buy amount
   * @param card
   */
  getBuyAmountText(card) {
    let maxBuyAmount = Service.get(this).exceedsMaxBuyAmount(card);
    let showWarning = false;
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
        // Show warning, if no hard violation, but soft limit violation
      } else if (card.errors.balanceWarning) {
        showWarning = true;
      }
    }
    // Over max amount
    if (maxBuyAmount) {
      return `Buy amount cannot exceed $${maxBuyAmount}`;
    }
    // Soft limit violation
    if (showWarning) {
      return warningMessage;
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
      if (card.errors.balanceWarning) {
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
   * Hide manual balance check window
   */
  hideManualBalanceCheck() {
    scope.get(this).$broadcast('hide-modal', 'manual-balance-info');
  }

  /**
   * Add cards to inventory
   * @param isManager Manager user
   */
  addToInventory(isManager = false) {
    // Display errors or add to inventory (non-manager user)
    if (!this.displayCardErrors()) {
      scope.get(this).$broadcast('show-modal', 'add-to-inventory');
      this.displayData.intakeTotal++;
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
   * Get URL for transitioning to receipt
   * @return {string}
   */
  getReceiptUrl() {
    return authService.get(this).user.role === 'corporate-admin' ? 'main.corporate.customer.receipt' :
                       'main.employee.customer.receipt';
  }

  /**
   * Add cards to inventory
   */
  completeAddToInventory(receipt) {
    // Always go to receipt if customer has denials
    const receiptUrl = this.getReceiptUrl();
    return Service.get(this).addToInventory(this.cardsToInventoryAdmin, parseFloat(this.thisSaleDenials))
    .then(thisReceipt => {
      scope.get(this).$broadcast('hide-modal', 'add-to-inventory');
      scope.get(this).$broadcast('hide-modal', 'show-receipt-confirm');
      state.get(this).go(receiptUrl, {receiptId: thisReceipt._id});
    })
    .catch(err => {
      scope.get(this).$broadcast('hide-modal', 'add-to-inventory');
      if (err.data && err.data.reason) {
        if (err.data.reason === 'noSmp') {
          scope.get(this).$broadcast('show-modal', 'no-smp');
          // Display cards
          this.displayData.noSmpCards = err.data.cards.map(card => {
            return {retailer: card.retailer.name, balance: card.balance, number: card.number};
          });

          return;
        }
      }

      scope.get(this).$broadcast('show-modal', 'error-cards-add-to-inventory');
    })
    .finally(() => {
      scope.get(this).$broadcast('hide-modal', 'move-to-inventory-admin');
      this.cardsToInventoryAdmin = null;
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
    this.displayData.disableReceipt = true;
    this.completeAddToInventory(true).then(() => {
      this.displayData.disableReceipt = false;
    });
  }

  /**
   * Retrieve current store
   */
  getStoreId() {
    const user = authService.get(this).user;
    return user.role === 'corporate-admin' ? corpSettings.get(this).displayData.selectedStore : user.store._id;
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
      const store = this.getStoreId();
      // Get customers
      Service.get(this).getCustomersThisCompany({storeId: store, companyId: user.company._id})
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
    Service.get(this).createFakeCards({customer: state.get(this).params.customerId, count: this.displayData.fakeCards})
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
    const cardIds = cards.filter(card => card.retailer.gsId)
      .filter(card => typeof card.balance === 'undefined').map(card => card._id);
    Service.get(this).runBi(cardIds)
      .then(() => {
        scope.get(this).$broadcast('show-modal', 'bi-running');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'bi-running-failure');
      });
  }

  /**
   * Move cards with balances for sale
   */
  moveCardsConfirm() {
    scope.get(this).$broadcast('show-modal', 'move-cards');
  }

  /**
   * Move cards with balances over for sale
   */
  moveCardsForSale() {
    Service.get(this).moveCardsForSale({customerId: state.get(this).params.customerId})
      .then(() => {
        scope.get(this).$broadcast('show-modal', 'move-cards-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'move-cards-fail');
      })
      .finally(err => {
        console.log('**************ERR**********');
        console.log(err);
        scope.get(this).$broadcast('hide-modal', 'move-cards');
      });
  }

  /**
   * Move all cards with balances over to inventory (admin override)
   */
  confirmAddToInventoryAllAdmin() {
    this.cardsToInventoryAdmin = this.displayData.cards.filter(card => typeof card.balance !== 'undefined');
    scope.get(this).$broadcast('show-modal', 'move-to-inventory-admin');
  }

  /**
   * Refresh page when done moving
   */
  refreshPage() {
    window.location.reload();
  }

  /**
   * Upload fixes confirmation
   */
  uploadFixesConfirm() {
    scope.get(this).$broadcast('show-modal', 'upload-fixes');
  }

  /**
   * Upload fixes file
   */
  uploadFixesFile() {
    Service.get(this).uploadFixesFile({file: this.fixesFile})
      .then(() => {
        scope.get(this).$broadcast('hide-modal', 'upload-fixes');
        scope.get(this).$broadcast('show-modal', 'upload-fixes-success');
      })
      .catch(() => {
        scope.get(this).$broadcast('show-modal', 'upload-fixes-failure');
      });
  }

  /**
   * Change denial amount
   */
  changeDenialAmountConfirm() {
    scope.get(this).$broadcast('show-modal', 'change-denial-amount');
  }

  /**
   * Change the denial amount for this order
   */
  changeDenialAmount() {
    this.thisSaleDenials = this.checkValidDenialAmount(this.displayData.customer.rejectionTotal, this.newDenialAmount);
    scope.get(this).$broadcast('hide-modal', 'change-denial-amount');
  }

  /**
   * Make sure we have a valid figure to work with for new denials
   * @param rejectionTotal Customer rejection total
   * @param newAmount New denial amount this sale
   * @returns number | string
   */
  checkValidDenialAmount(rejectionTotal, newAmount) {
    const parsed = parseFloat(newAmount);
    // Make sure this doesn't exceed the total rejection amount
    if (rejectionTotal < parsed) {
      return rejectionTotal.toFixed(2);
    }
    if (parsed < 0) {
      return 0;
    }
    // Make sure the amount selected isn't greater than the entire purchase
    if (parsed > (this.displayData.totals.electronic + this.displayData.totals.manual)) {
      return rejectionTotal.toFixed(2);
    }
    if (isNaN(newAmount)) {
      return rejectionTotal;
    }
    // Only allow two decimal places
    if (/^\d*\.\d{3,}$/.test(newAmount)) {
      return newAmount.match(/(\d*\.\d{2})/)[1];
    }
    return newAmount;
  }

  /**
   * Validate rejection input
   * @param rejectionTotal Total amount customer owes
   * @param newAmount Amount subtracted from this sale
   * @param minAmount Minimum amount that the rejection value can be
   * @returns string
   */
  validateRejection(rejectionTotal, newAmount, minAmount) {
    const parsed = parseFloat(newAmount);
    const invalidPattern = 'Value must contain only digits (may include a decimal place followed by 2 digits).';
    // Gotta be a valid number, at least
    if (isNaN(newAmount)) {
      return invalidPattern;
    }
    if (typeof minAmount === 'number') {
      if (newAmount < minAmount) {
        return `Due to company settings, a value greater than $${minAmount.toFixed(2)} must be chosen.`;
      }
    }
    // Make sure this doesn't exceed the total rejection amount
    if (rejectionTotal < parsed) {
      return 'Value cannot exceed the maximum amount the customer owes.';
    }
    if (parsed < 0) {
      return 'Must be a number greater than zero.';
    }
    // Make sure the amount selected isn't greater than the entire purchase
    if (parsed > (this.displayData.totals.electronic + this.displayData.totals.manual)) {
      return 'Value cannot be greater than the amount owed to the customer for this sale.';
    }
    // Check for validity
    if (isNaN(newAmount) || /^\d*\.(\d{3,}|\d{0,1})$/.test(newAmount)) {
      return invalidPattern;
    }
    return '';
  }

  /**
   * Change the amount that's coming in for this sale
   */
  changeDenialValue() {
    const rejectionTotal = this.displayData.customer.rejectionTotal;
    const minRate = this.displayData.minimumAdjustedDenialAmount;
    let minAmount = null;
    if (typeof minRate === 'number') {
      minAmount = rejectionTotal * minRate;
    }
    const newAmount = this.newDenialAmount;
    if (!this.newDenialAmount.length || this.newDenialAmount === '.') {
      return;
    }
    this.newDenialAmount = newAmount;
    // Validate denial amount
    this.rejectionValidation = this.validateRejection(rejectionTotal, newAmount, minAmount);
  }

  /**
   * Disable modal submit if validation fails
   * @returns {boolean}
   */
  checkRejectValidation() {
    return !!this.rejectionValidation;
  }

  /**
   * Toggle whether manager account should auto-calculate values
   */
  toggleModifyValuesIndividually() {
    this.displayData.managerValueOverride = !this.displayData.managerValueOverride;
  }

  /**
   * Open cash payment modal
   */
  openCashPayment() {
    scope.get(this).$broadcast('show-modal', 'cash-payment');
  }

  /**
   * Cash payment
   */
  cashPayment() {
    // Disable button during processing
    this.displayData.cashPaymentsSubmitDisabled = true;
    const amount = parseFloat(this.displayData.denialCashPayment);
    const params = {
      customerId: state.get(this).params.customerId,
      amount: amount,
      userTime: moment().format(),
      rejectionTotal: this.displayData.customer.rejectionTotal,
      store: this.getStoreId(),
      company: authService.get(this).user.company._id
    };
    Service.get(this).cashPayment(params)
    .then(res => {
      state.get(this).go(this.getReceiptUrl(), {receiptId: res.data._id});
    })
    .catch(() => {
      scope.get(this).$broadcast('show-modal', 'cash-payment-fail');
    })
    .finally(() => {
      this.displayData.cashPaymentsSubmitDisabled = false;
      scope.get(this).$broadcast('hide-modal', 'cash-payment');
    });
  }

  /**
   * Make sure we have a value
   */
  cashPaymentDisableSubmit() {
    return !this.displayData.denialCashPayment || this.displayData.cashPaymentsSubmitDisabled;
  }
}
