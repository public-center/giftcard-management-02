import _ from 'lodash';

export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
  /**
   * Landing states
   */
    .state('landing', {
      url: '/',
      templateUrl: 'app/landing/main.html',
      controller: 'LandingController',
      controllerAs: 'mainCtrl'
    })
    /**
     * Auth states
     */
    .state('auth', {
      url: '/auth',
      abstract: true,
      template: '<ui-view></ui-view>'
    })
    /***
     * Admin states
     */
    .state('auth.admin', {
      url: '/admin',
      templateUrl: 'app/auth/admin/admin.html',
      controller: 'AuthAdminController',
      controllerAs: 'authAdminCtrl',
      data: {
        permissions: {
          only: ['anonymous'],
          redirectTo: 'main.admin.users.list'
        }
      },
      resolve: {
        // Check to see if we're running in development mode
        isDevelopment: AuthService => {
          return AuthService.checkDevelopment().then(res => {
            return res.isDev;
          });
        }
      }
    })
    /**
     * Forgot password
     */
    .state('auth.forgot', {
      url: '/forgot-password',
      templateUrl: 'app/auth/forgot/forgot.html',
      controller: 'ForgotPasswordController',
      controllerAs: 'forgotPasswordCtrl',
      data: {
        permissions: {
          only: ['anonymous'],
          redirectTo: 'main.admin.users.list'
        }
      }
    })
    /**
     * Reset password
     */
    .state('auth.reset', {
      url: '/reset-password?id&token',
      templateUrl: 'app/auth/reset/reset.html',
      controller: 'ResetPasswordController',
      controllerAs: 'resetPasswordCtrl',
      data: {
        permissions: {
          only: ['anonymous'],
          redirectTo: 'main.admin.users.list'
        }
      }
    })
    .state('logout', {
      url: '/logout',
      template: '',
      controller: 'AuthAdminController',
      controllerAs: 'authAdminCtrl'
    })
    // Main layout
    .state('main', {
      abstract: true,
      templateUrl: 'app/components/main/layout.html',
      controller: 'MainController',
      controllerAs: 'layoutCtrl',
      resolve: {
        user: (AuthService) => {
          return AuthService.checkRole();
        }
      }
    })
    // Admin users
    .state('main.admin', {
      url: '/admin',
      abstract: true,
      template: '<ui-view></ui-view>',
      data: {
        permissions: {
          only: ['admin'],
          redirectTo: 'landing'
        }
      }
    })
    // List users
    .state('main.admin.users', {
      url: '/users',
      controller: 'AdminUsersController',
      controllerAs: 'usersCtrl',
      template: '<ui-view></ui-view>'
    })
    // Display activity
    .state('main.admin.activity', {
      url: '/activity',
      controller: 'AdminActivityNewController',
      controllerAs: 'activityCtrl',
      templateUrl: 'app/admin/activity/new/activity.html'
    })
    // Exchange activity
    .state('main.admin.exchange', {
      url: '/exchange',
      controller: 'AdminExchangeController',
      controllerAs: 'activityCtrl',
      templateUrl: 'app/admin/exchange/activity.html'
    })
    // Functions
    .state('main.admin.functions', {
      url: '/functions',
      controller: 'AdminFunctionController',
      controllerAs: 'functionsCtrl',
      templateUrl: 'app/admin/functions/functions.html'
    })
    // BI IDs
    .state('main.admin.biIds', {
      url: '/biIds',
      controller: 'BiIdController',
      controllerAs: 'idCtrl',
      templateUrl: 'app/admin/biIds/bi-ids.html'
    })
    .state('main.admin.biIds.createRetailer', {
      url: '/biIds/add',
      controller: 'BiIdController',
      controllerAs: 'idCtrl',
      templateUrl: 'app/admin/biIds/add.html'
    })
    // Denials by customer
    .state('main.admin.customerDenials', {
      url: '/customerDenials',
      controller: 'CustomerDenialsController',
      controllerAs: 'denialsCtrl',
      templateUrl: 'app/admin/customerDenials/denials.html'
    })
    // Statistics
    .state('main.admin.stats', {
      url: '/stats',
      controller: 'AdminStatsController',
      controllerAs: 'statsCtrl',
      templateUrl: 'app/admin/stats/stats.html'
    })
    .state('main.admin.users.list', {
      url: '/list',
      controller: 'AdminUsersModifyController',
      controllerAs: 'modifyCtrl',
      templateUrl: 'app/admin/users/modify/modify.html'
    })
    .state('main.admin.users.modify', {
      url: '/modify',
      controller: 'AdminUsersModifyController',
      controllerAs: 'modifyCtrl',
      templateUrl: 'app/admin/users/modify/modify.html'
    })
    .state('main.admin.users.modifySingle', {
      url: '/modify/:id',
      controller: 'AdminUsersSingleController',
      controllerAs: 'singleCtrl',
      templateUrl: 'app/admin/users/single/single.html'
    })
    .state('main.admin.users.create-admin', {
      url: '/create-admin',
      controller: 'CreateAdminController',
      controllerAs: 'createAdminCtrl',
      templateUrl: 'app/admin/users/newUser/create.html',
      data: {
        role: 'admin'
      }
    })
    // Need company name in addition to a contact
    .state('main.admin.users.create-buyer', {
      url: '/create-buyer',
      controller: 'CreateAdminController',
      controllerAs: 'createAdminCtrl',
      templateUrl: 'app/admin/users/newUser/create.html',
      data: {
        role: 'buyer'
      }
    })
    // Need company name in addition to a contact
    // Corporate suppliers can have sub-accounts, which are typically stores buying gift cards
    .state('main.admin.users.create-supplier', {
      url: '/create-supplier',
      controller: 'CreateAdminController',
      controllerAs: 'createAdminCtrl',
      templateUrl: 'app/admin/users/newUser/create.html',
      data: {
        role: 'supplier'
      }
    })
    /**
     * Admin settings
     */
    .state('main.admin.settings', {
      url: '/settings',
      abstract: true,
      template: '<ui-view></ui-view>',
      controller: 'AdminSettingsController',
      controllerAs: 'adminSettingsCtrl'
    })
    .state('main.admin.settings.rates', {
      url: '/rates',
      templateUrl: 'app/admin/settings/rates/rates.html',
      controller: 'AdminSettingsRatesController',
      controllerAs: 'ratesCtrl'
    })
    .state('main.admin.settings.biInfo', {
      url: '/biInfo',
      templateUrl: 'app/admin/settings/biInfo/biInfo.html',
      controller: 'BiInfoController',
      controllerAs: 'biInfoCtrl'
    })
    .state('main.admin.settings.companies', {
      url: '/companies',
      abstract: true,
      template: '<ui-view></ui-view>',
      controller: 'AdminSettingsCompanyController',
      controllerAs: 'companyCtrl'
    })
    .state('main.admin.settings.companies.list', {
      url: '/list',
      templateUrl: 'app/admin/settings/companies/companies.html'
    })
    .state('main.admin.settings.companies.new', {
      url: '/new',
      templateUrl: 'app/admin/settings/companies/new/new.html',
      controller: 'NewCompanyController',
      controllerAs: 'newCompanyCtrl'
    })
    .state('main.admin.settings.companies.edit', {
      url: '/edit/:companyId',
      templateUrl: 'app/admin/settings/companies/edit/edit.html',
      controller: 'AdminEditCompanyController',
      controllerAs: 'editCompanyCtrl'
    })
  /**
   * Corporate admin
   */
  .state('main.corporate', {
    url: '/company/:companyId',
    template: '<ui-view></ui-view>',
    controller: 'CorpController',
    controllerAs: 'corpCtrl',
    data: {
      permissions: {
        only: ['admin', 'corporate-admin'],
        redirectTo: 'landing'
      }
    },
    resolve: {
      alternativeGcmgr: function (GcResource, $stateParams) {
        return GcResource.resource('SupplierCompany:getCompany', {companyId: $stateParams.companyId})
          .then(company => {
            if (!company.settings) {
              return false;
            }
            return !!company.settings.useAlternateGCMGR;
          });
      }
    }
  })
  // Corporate customer states
  .state('main.corporate.customer', {
    url: '/customer',
    templateUrl: 'app/employee/customer/customer.html',
    controller: 'EmployeeCustomerController',
    controllerAs: 'customerCtrl'
  })
  .state('main.corporate.customer.new', {
    url: '/new',
    templateUrl: 'app/employee/customer/new/new.html'
  })
  .state('main.corporate.customer.details', {
    url: '/:customerId/details',
    templateUrl: 'app/employee/customer/customer-details.html'
  })
  .state('main.corporate.customer.edit', {
    url: '/:customerId/edit',
    templateUrl: 'app/employee/customer/edit-customer.html'
  })
  .state('main.corporate.customer.intake-revised', {
    url: '/:customerId/intake-revised',
    templateUrl: 'app/employee/cardIntake-revised/card-intake.html',
    controller: 'CardIntakeRevisedController',
    controllerAs: 'cardIntakeCtrl'
  })
  .state('main.corporate.customer.intake-revised.denials', {
    url: '/denials',
    templateUrl: 'app/corporate/activity/customer-denials.html',
    controller: 'EmployeeActivityController',
    controllerAs: 'denialsCtrl'
  })
  .state('main.corporate.customer.receipt', {
    url: '/receipt/:receiptId',
    templateUrl: 'app/employee/receipt/receipt.html',
    controller: 'ReceiptController',
    controllerAs: 'receiptCtrl'
  })
  .state('main.corporate.receipts', {
    url: '/receipts',
    templateUrl: 'app/employee/receipts/receipts.html',
    controller: 'EmployeeReceiptsController',
    controllerAs: 'receiptsCtrl'
  })
  .state('main.corporate.inventory', {
    url: '/inventory',
    templateUrl: 'app/employee/inventoryNew/card-inventory.html',
    controller: 'CardInventoryNewController',
    controllerAs: 'cardInventoryCtrl'
  })
  // Company settings
  .state('main.corporate.settings', {
    url: '/settings',
    templateUrl: 'app/corporate/settings/settings.html',
    controller: 'CorpController',
    controllerAs: 'corpCtrl'
  })
  // Company activity
  .state('main.corporate.activity', {
    url: '/activity',
    templateUrl: 'app/corporate/activity/activity.html',
    controller: 'CorpActivityController',
    controllerAs: 'corpActivityCtrl'
  })
  // Company transactions
  .state('main.corporate.transactions', {
    url: '/transactions',
    templateUrl: 'app/corporate/activity/transactions.html',
    controller: 'CorpTransactionsController',
    controllerAs: 'corpActivityCtrl'
  })
  // Company denials
  .state('main.corporate.denials', {
    url: '/denials',
    templateUrl: 'app/corporate/activity/denials.html',
    controller: 'CorpActivityController',
    controllerAs: 'corpActivityCtrl'
  })
  .state('main.corporate.customer-denials', {
    url: '/customer-denials/:customerId',
    templateUrl: 'app/corporate/activity/customer-denials.html',
    controller: 'CorpActivityController',
    controllerAs: 'corpActivityCtrl'
  })
// Store buy rates
  .state('main.corporate.buyRates', {
    url: '/buyRates',
    templateUrl: 'app/corporate/store/buyRates/buyRates.html',
    controller: 'StoreBuyRatesController',
    controllerAs: 'storeBuyRatesCtrl'
  })
  // Company reserves
  .state('main.corporate.reserves', {
    url: '/reserves',
    templateUrl: 'app/corporate/reserves/reserves.html',
    controller: 'CorpReservesController',
    controllerAs: 'corpReservesCtrl'
  })
  // Main store state
  .state('main.corporate.store', {
    url: '/store',
    abstract: true,
    template: '<ui-view></ui-view>',
    controller: 'CorpSelectStoreController',
    controllerAs: 'corpSelectStoreCtrl'
  })
  // List stores
  .state('main.corporate.store.list', {
    url: '/list',
    templateUrl: 'app/corporate/store/store.html',
    controller: 'CorpStoresController',
    controllerAs: 'storeCtrl'
  })
  // Details about a store
  .state('main.corporate.store.details', {
    url: '/:storeId/details',
    templateUrl: 'app/corporate/store/details/store.html',
    controller: 'CorpStoreDetailsController',
    controllerAs: 'storeCtrl'
  })
    // Update store details
  .state('main.corporate.store.update', {
    url: '/:storeId/update',
    templateUrl: 'app/corporate/store/update/update.html',
    controller: 'CorpUpdateStoreController',
    controllerAs: 'updateStoreCtrl'
  })
  // New employee
  .state('main.corporate.store.newEmployee', {
    url: '/:storeId/employee/create',
    templateUrl: 'app/corporate/store/employee/new/new.html',
    controller: 'CorpNewEmployeeController',
    controllerAs: 'newEmployeeCtrl'
  })
  .state('main.corporate.store.updateEmployee', {
    url: '/:storeId/employee/:employeeId/update',
    templateUrl: 'app/corporate/store/employee/update/update.html',
    controller: 'CorpUpdateEmployeeController',
    controllerAs: 'updateEmployeeCtrl'
  })
  // New store
  .state('main.corporate.store.new', {
    url: '/new',
    templateUrl: 'app/corporate/store/new/new.html',
    controller: 'CorpNewStoreController',
    controllerAs: 'newStoreCtrl'
  })
  .state('main.corporate.store.inventory', {
    url: '/:storeId/inventory',
    templateUrl: 'app/employee/inventoryNew/card-inventory.html',
    controller: 'CardInventoryNewController',
    controllerAs: 'cardInventoryCtrl'
  })
  .state('main.corporate.reconciliation', {
    url: '/:storeId/reconciliation',
    templateUrl: 'app/employee/reconciliationNew/reconciliation.html',
    controller: 'ReconciliationNewController',
    controllerAs: 'reconciliationCtrl'
  })
  // Reconciliation packing slip
  .state('main.corporate.reconciliationComplete', {
    url: '/:storeId/reconciliation/complete/:type',
    templateUrl: 'app/employee/reconciliationComplete/complete.html',
    controller: 'ReconciliationCompleteController',
    controllerAs: 'reconciliationCompleteCtrl'
  })
  /**
   * Employee states
   */
  .state('main.employee', {
    url: '/employee',
    abstract: true,
    templateUrl: 'app/employee/employee.html',
    controller: 'EmployeeController',
    controllerAs: 'employeeCtrl',
    resolve: {
      alternativeGcmgr: function (GcResource, $stateParams, user) {
        let companyId;
        if (!user.company) {
          return false;
        }
        if (typeof user.company === 'string') {
          companyId = user.company;
        } else if (_.isPlainObject(user.company)) {
          companyId = user.company._id;
        } else {
          return false;
        }
        return GcResource.resource('SupplierCompany:getCompany', {companyId: companyId})
        .then(company => {
          if (!company.settings) {
            return false;
          }
          return !!company.settings.useAlternateGCMGR;
        });
      }
    }
  })
  .state('main.employee.buyRates', {
    url: '/buyRates',
    templateUrl: 'app/employee/buyRates/buyRates.html'
  })
  .state('main.employee.inventory', {
    url: '/inventory',
    templateUrl: 'app/employee/inventoryNew/card-inventory.html',
    controller: 'CardInventoryNewController',
    controllerAs: 'cardInventoryCtrl'
  })
  .state('main.employee.reconciliation', {
    url: '/reconciliation',
    templateUrl: 'app/employee/reconciliationNew/reconciliation.html',
    controller: 'ReconciliationNewController',
    controllerAs: 'reconciliationCtrl'
  })
  .state('main.employee.receipts', {
    url: '/receipts',
    templateUrl: 'app/employee/receipts/receipts.html',
    controller: 'EmployeeReceiptsController',
    controllerAs: 'receiptsCtrl'
  })
  .state('main.employee.denials', {
    url: '/denials',
    templateUrl: 'app/employee/activity/denials.html',
    controller: 'EmployeeActivityController',
    controllerAs: 'denialsCtrl'
  })
  .state('main.employee.customer-denials', {
    url: '/customer-denials/:customerId',
    templateUrl: 'app/employee/activity/customer-denials.html',
    controller: 'EmployeeActivityController',
    controllerAs: 'denialsCtrl'
  })
  .state('main.employee.activity', {
    url: '/activity',
    templateUrl: 'app/employee/activity/activity.html',
    controller: 'EmployeeActivityController',
    controllerAs: 'activityCtrl'
  })
  .state('main.employee.customer', {
    url: '/customer',
    templateUrl: 'app/employee/customer/customer.html',
    controller: 'EmployeeCustomerController',
    controllerAs: 'customerCtrl'
  })
  .state('main.employee.customer.new', {
    url: '/new',
    templateUrl: 'app/employee/customer/new/new.html'
  })
  .state('main.employee.customer.details', {
    url: '/:customerId/details',
    templateUrl: 'app/employee/customer/customer-details.html'
  })
  .state('main.employee.customer.edit', {
    url: '/:customerId/edit',
    templateUrl: 'app/employee/customer/edit-customer.html'
  })
  .state('main.employee.customer.intake-revised', {
    url: '/:customerId/intake-revised',
    templateUrl: 'app/employee/cardIntake-revised/card-intake.html',
    controller: 'CardIntakeRevisedController',
    controllerAs: 'cardIntakeCtrl'
  })
  .state('main.employee.customer.intake-revised.denials', {
    url: '/denials',
    templateUrl: 'app/employee/activity/customer-denials.html',
    controller: 'EmployeeActivityController',
    controllerAs: 'denialsCtrl'
  })
  .state('main.employee.customer.receipt', {
    url: '/receipt/:receiptId',
    templateUrl: 'app/employee/receipt/receipt.html',
    controller: 'ReceiptController',
    controllerAs: 'receiptCtrl'
  })
  .state('main.employee.customer.receiptList', {
    url: '/receiptList',
    templateUrl: 'app/employee/receipt/receiptList.html',
    controller: 'ReceiptController',
    controllerAs: 'receiptCtrl'
  })
  // Reconciliation packing slip
  .state('main.employee.reconciliationComplete', {
    url: '/employee/reconciliation/complete/:type',
    templateUrl: 'app/employee/reconciliationComplete/complete.html',
    controller: 'ReconciliationCompleteController',
    controllerAs: 'reconciliationCompleteCtrl'
  })
  /**
   * Manager
   */
  .state('main.employee.store', {
    url: '/:companyId/:storeId',
    abstract: true,
    template: '<ui-view></ui-view>',
    controller: 'CorpStoreDetailsController',
    controllerAs: 'storeCtrl'
  })
  .state('main.employee.store.details', {
    url: '/details',
    templateUrl: 'app/corporate/store/details/store.html'
  })
  // New employee
  .state('main.employee.store.newEmployee', {
    url: '/employee/create',
    templateUrl: 'app/corporate/store/employee/new/new.html',
    controller: 'CorpNewEmployeeController',
    controllerAs: 'newEmployeeCtrl'
  })
  // Update exists
  .state('main.employee.store.updateEmployee', {
    url: '/employee/:employeeId/update',
    templateUrl: 'app/corporate/store/employee/update/update.html',
    controller: 'CorpUpdateEmployeeController',
    controllerAs: 'updateEmployeeCtrl'
  })
  ;

  $urlRouterProvider.otherwise('/');
}
