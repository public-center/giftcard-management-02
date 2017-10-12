import 'babel-polyfill';
import register from './register';

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import {LandingController, insipia} from './landing/index';
import {
  AuthAdminController,
  AuthService,
  ForgotPasswordController,
  ResetPasswordController
} from './auth/index';
import {
  AdminUsersListController,
  AdminUsersModifyController,
  AdminUsersController,
  AdminUsersService,
  CreateAdminController,
  AdminUsersSingleController,
  NewCompanyController,
  NewCompanyService,
  AdminSettingsController,
  AdminSettingsCompanyController,
  AdminSettingsRatesController,
  AdminSettingsRatesService,
  companyListExpand,
  SupplierCompany,
  AdminActivityNewController,
  AdminActivityNewService,
  AdminExchangeController,
  AdminExchangeService,
  AdminEditCompanyController,
  AdminEditCompanyService,
  BiIdController,
  BiIdService,
  AdminStatsController,
  AdminStatsService,
  AdminFunctionController,
  AdminFunctionService,
  CustomerDenialsController,
  CustomerDenialsService,
  biIdSelectRow,
  BiInfoController,
  BiInfoService,
  // AdminFunctions,
  adminFunctionsReactDirective,
} from './admin/index';
import { GcResource } from './Resources/GcResource';
import {PendingRequest} from './services/index';
import {
  footer,
  sidebar,
  topNav,
  cqHeader,
  headerButtons,
  listUsers,
  BodyController,
  cqError,
  CqErrorInterceptor,
  States,
  numbersOnly,
  calendarValid,
  MainController,
  ModalInheritanceService,
  cqModal,
  SocketService,
  inventoryTable,
  buyRatesTable,
  companySetting,
  reconciliation,
  onFilter,
  buyActivityTable,
  selectRow,
  activityRevised,
  denials,
  corporateStoreSwitcher,
  swipe,
  cashPayments,
  TriggerDownloadService,
  transactionsTable,
  horizontalScrollTableHeader,
  activityRevisedDenial,
  activityRevisedAdmin,
  activityRevisedCorp,
  activityRevisedExchange,
  chargeback,
  denial,
  exception,
  remittance
} from './components/index';
import {
  CorpController,
  CorpService,
  CorpStoresController,
  CorpNewStoreController,
  CorpNewStoreService,
  CorpStoreService,
  CorpNewEmployeeController,
  CorpNewEmployeeService,
  CorpStoreDetailsController,
  CorpStoreDetails,
  CorpUpdateStoreController,
  CorpUpdateStoreService,
  CorpUpdateEmployeeController,
  CorpUpdateEmployeeService,
  StoreBuyRatesController,
  StoreBuyRatesService,
  CorpSelectStoreController,
  CorpSelectStoreService,
  CorpActivityController,
  CorpTransactionsController,
  CorpActivityService,
  CorpReservesController
} from './corporate/index';
import {
  EmployeeController,
  Employee,
  EmployeeCustomerController,
  EmployeeCustomerService,
  ReconciliationNewController,
  ReconciliationNewService,
  CardInventoryNewController,
  CardInventoryNewService,
  ReconciliationCompleteController,
  ReceiptController,
  EmployeeActivityService,
  EmployeeActivityController,
  ReceiptService,
  ReceiptListController,
  EmployeeReceiptsController,
  EmployeeReceiptsService,
  CardIntakeRevisedService,
  CardIntakeRevisedController,
  employeeReceiptsReactDirective
} from './employee/index';
import {capitalize} from './filters/index';
import 'satellizer';
//import 'ng-tags-input';
import 'angular-socket-io';
import 'angularjs-datepicker';
import 'angular-permission';
import 'angular-ui-router';
import '../vendor/ui-select/dist/select';
import 'ng-file-upload';
import 'angular-smart-table'
import 'angular-loading-overlay';

// React
import 'react';
import 'react-dom'
import 'ngreact';
import 'ng-redux';

import 'whatwg-fetch';

angular.module('frontend', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'ngMessages',
  'ngAria',
  'ngResource',
  'ui.router',
  'satellizer',
  'permission',
  //'ngTagsInput',
  'ngTable',
  'ui.select',
  'btford.socket-io',
  '720kb.datepicker',
  'ngFileUpload',
  'smart-table',
  'darthwade.dwLoading',
  'react',
  'ngRedux'
])
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .controller('BodyController', BodyController)
  .service('CqErrorInterceptor', CqErrorInterceptor)
  .filter('capitalize', capitalize);

register('frontend').factory('GcResource', GcResource);
register('frontend').factory('PendingRequest', PendingRequest);
register('frontend').factory('AdminUsersService', AdminUsersService);
register('frontend').factory('AuthService', AuthService);
register('frontend').factory('NewCompanyService', NewCompanyService);
register('frontend').factory('States', States);
register('frontend').factory('SupplierCompany', SupplierCompany);
register('frontend').factory('CorpNewStoreService', CorpNewStoreService);
register('frontend').factory('CorpStoreService', CorpStoreService);
register('frontend').factory('CorpNewEmployeeService', CorpNewEmployeeService);
register('frontend').factory('CorpStoreDetails', CorpStoreDetails);
register('frontend').factory('Employee', Employee);
register('frontend').factory('CorpUpdateStoreService', CorpUpdateStoreService);
register('frontend').factory('ModalInheritanceService', ModalInheritanceService);
register('frontend').factory('CorpUpdateEmployeeService', CorpUpdateEmployeeService);
register('frontend').factory('StoreBuyRatesService', StoreBuyRatesService);
register('frontend').factory('EmployeeCustomerService', EmployeeCustomerService);
register('frontend').factory('SocketService', SocketService);
register('frontend').factory('ReconciliationNewService', ReconciliationNewService);
register('frontend').factory('CardInventoryNewService', CardInventoryNewService);
register('frontend').factory('AdminSettingsRatesService', AdminSettingsRatesService);
register('frontend').factory('CorpSelectStoreService', CorpSelectStoreService);
register('frontend').factory('AdminEditCompanyService', AdminEditCompanyService);
register('frontend').factory('CorpService', CorpService);
register('frontend').factory('EmployeeActivityService', EmployeeActivityService);
register('frontend').factory('ReceiptService', ReceiptService);
register('frontend').factory('EmployeeReceiptsService', EmployeeReceiptsService);
register('frontend').factory('BiIdService', BiIdService);
register('frontend').factory('CardIntakeRevisedService', CardIntakeRevisedService);
register('frontend').factory('CorpActivityService', CorpActivityService);
register('frontend').factory('AdminActivityNewService', AdminActivityNewService);
register('frontend').factory('AdminExchangeService', AdminExchangeService);
register('frontend').factory('AdminStatsService', AdminStatsService);
register('frontend').factory('AdminFunctionService', AdminFunctionService);
register('frontend').factory('CustomerDenialsService', CustomerDenialsService);
register('frontend').factory('TriggerDownloadService', TriggerDownloadService);
register('frontend').factory('BiInfoService', BiInfoService);
register('frontend').controller('LandingController', LandingController);
register('frontend').controller('AuthAdminController', AuthAdminController);
register('frontend').controller('ForgotPasswordController', ForgotPasswordController);
register('frontend').controller('ResetPasswordController', ResetPasswordController);
register('frontend').controller('AdminUsersListController', AdminUsersListController);
register('frontend').controller('AdminUsersModifyController', AdminUsersModifyController);
register('frontend').controller('AdminUsersController', AdminUsersController);
register('frontend').controller('CreateAdminController', CreateAdminController);
register('frontend').controller('AdminUsersSingleController', AdminUsersSingleController);
register('frontend').controller('NewCompanyController', NewCompanyController);
register('frontend').controller('AdminSettingsController', AdminSettingsController);
register('frontend').controller('AdminSettingsCompanyController', AdminSettingsCompanyController);
register('frontend').controller('CorpController', CorpController);
register('frontend').controller('CorpStoresController', CorpStoresController);
register('frontend').controller('CorpNewStoreController', CorpNewStoreController);
register('frontend').controller('CorpNewEmployeeController', CorpNewEmployeeController);
register('frontend').controller('CorpStoreDetailsController', CorpStoreDetailsController);
register('frontend').controller('EmployeeController', EmployeeController);
register('frontend').controller('MainController', MainController);
register('frontend').controller('CorpUpdateStoreController', CorpUpdateStoreController);
register('frontend').controller('CorpUpdateEmployeeController', CorpUpdateEmployeeController);
register('frontend').controller('StoreBuyRatesController', StoreBuyRatesController);
register('frontend').controller('EmployeeCustomerController', EmployeeCustomerController);
register('frontend').controller('ReconciliationNewController', ReconciliationNewController);
register('frontend').controller('CardInventoryNewController', CardInventoryNewController);
register('frontend').controller('ReconciliationCompleteController', ReconciliationCompleteController);
register('frontend').controller('ReceiptController', ReceiptController);
register('frontend').controller('AdminSettingsRatesController', AdminSettingsRatesController);
register('frontend').controller('CorpSelectStoreController', CorpSelectStoreController);
register('frontend').controller('AdminEditCompanyController', AdminEditCompanyController);
register('frontend').controller('EmployeeActivityController', EmployeeActivityController);
register('frontend').controller('ReceiptListController', ReceiptListController);
register('frontend').controller('EmployeeReceiptsController', EmployeeReceiptsController);
register('frontend').controller('BiIdController', BiIdController);
register('frontend').controller('CardIntakeRevisedController', CardIntakeRevisedController);
register('frontend').controller('CorpActivityController', CorpActivityController);
register('frontend').controller('CorpTransactionsController', CorpTransactionsController);
register('frontend').controller('AdminActivityNewController', AdminActivityNewController);
register('frontend').controller('AdminExchangeController', AdminExchangeController);
register('frontend').controller('AdminStatsController', AdminStatsController);
register('frontend').controller('AdminFunctionController', AdminFunctionController);
register('frontend').controller('CustomerDenialsController', CustomerDenialsController);
register('frontend').controller('BiInfoController', BiInfoController);
register('frontend').controller('CorpReservesController', CorpReservesController);
register('frontend').directive('insipia', insipia);
register('frontend').directive('sidebar', sidebar);
register('frontend').directive('topNav', topNav);
register('frontend').directive('cqHeader', cqHeader);
register('frontend').directive('headerButtons', headerButtons);
register('frontend').directive('footer', footer);
register('frontend').directive('listUsers', listUsers);
register('frontend').directive('cqError', cqError);
register('frontend').directive('companyListExpand', companyListExpand);
register('frontend').directive('numbersOnly', numbersOnly);
register('frontend').directive('calendarValid', calendarValid);
register('frontend').directive('cqModal', cqModal);
register('frontend').directive('inventoryTable', inventoryTable);
register('frontend').directive('buyRatesTable', buyRatesTable);
register('frontend').directive('companySetting', companySetting);
register('frontend').directive('reconciliation', reconciliation);
register('frontend').directive('buyActivityTable', buyActivityTable);
register('frontend').directive('activityRevised', activityRevised);
register('frontend').directive('activityRevisedDenial', activityRevisedDenial);
register('frontend').directive('activityRevisedAdmin', activityRevisedAdmin);
register('frontend').directive('activityRevisedCorp', activityRevisedCorp);
register('frontend').directive('activityRevisedExchange', activityRevisedExchange);
register('frontend').directive('transactionsTable', transactionsTable);
register('frontend').directive('denials', denials);
register('frontend').directive('corporateStoreSwitcher', corporateStoreSwitcher);
register('frontend').directive('biIdSelectRow', biIdSelectRow);
register('frontend').directive('swipe', swipe);
register('frontend').directive('cashPayments', cashPayments);
register('frontend').directive('horizontalScrollTableHeader', horizontalScrollTableHeader);
register('frontend').directive('chargeback', chargeback);
register('frontend').directive('denial', denial);
register('frontend').directive('exception', exception);
register('frontend').directive('remittance', remittance);
// Smart table get access to filtered results
register('smart-table').directive('onFilter', onFilter);
register('smart-table').directive('selectRow', selectRow);

// React components
register('frontend').directive('adminFunctionsReactDirective', adminFunctionsReactDirective);
register('frontend').directive('employeeReceiptsReactDirective', employeeReceiptsReactDirective);
