import ConstantError from './errors/ConstantError';
/**
 * Constants which can be set for API interactions
 */
class constants {
  /**
   * Constants
   */
  constructor() {
    this.constants = {
      Permissions: {
        check: 'CHECK'
      },
      Auth: {
        register: 'REGISTER',
        login: 'LOGIN',
        logout: 'LOGOUT'
      },
      Admin: {
        users: 'USERS',
        changeRole: 'CHANGEROLE',
        getSingle: 'GETSINGLE',
        updateUser: 'UPDATEUSER',
        deleteUser: 'DELETEUSER',
        searchCompany: 'SEARCHCOMPANY',
        getAllRates: 'GETALLRATES',
        updateRates: 'UPDATERATES',
        getAllActivity: 'GETALLACTIVITY',
        getAllActivityRevised: 'getAllActivityRevised',
        modifyCard: 'MODIFYCARD',
        updateRatesFromLQ: 'updateRatesFromLQ',
        deleteCard: 'deleteCard',
        modifyRetailerSettingsBySmp: 'modifyRetailerSettingsBySmp',
        uploadCcRatesDoc: 'uploadCcRatesDoc',
        uploadGcrRatesDocs: 'uploadGcrRatesDocs',
        getCompany: 'getCompany',
        updateCompany: 'updateCompany',
        uploadCpRatesDoc: 'uploadCpRatesDoc',
        uploadCpDoc: 'uploadCpDoc',
        changeCardDetails: 'changeCardDetails',
        setRetailerType: 'setRetailerType',
        createFakeCards: 'createFakeCards',
        setCardStatus: 'setCardStatus',
        getAllRetailers: 'getAllRetailers',
        changeSqId: 'changeSqId',
        uploadCards: 'uploadCards',
        uploadFixes: 'uploadFixes',
        runBi: 'runBi',
        moveCardsForSale: 'moveCardsForSale',
        modifyCardBalance: 'modifyCardBalance',
        setInventoryValue: 'setInventoryValue',
        massUpdateInventories: 'massUpdateInventories',
        getParamsInRange: 'getParamsInRange',
        rejectCards: 'rejectCards',
        setRetailerProp: 'setRetailerProp'
      },
      SupplierCompany: {
        create: 'CREATE',
        getAll: 'GETALL',
        setApi: 'SETAPI',
        getCompany: 'COMPANYSETTINGS',
        updateCompany: 'UPDATESETTINGS',
        getStore: 'getStore',
        getSettings: 'getSettings',
        changeCompanySettings: 'changeCompanySettings',
        managerOverride: 'managerOverride',
        saveAutoBuyRates: 'saveAutoBuyRates',
        sellCard: 'sellCard',
        getActivity: 'getActivity',
        getAllActivityRevised: 'getAllActivityRevised',
        setInventoryValue: 'setInventoryValue',
        massUpdateInventories: 'massUpdateInventories',
        getParamsInRange: 'getParamsInRange'
      },
      Store: {
        newStore: 'NEWSTORE',
        getStores: 'GETSTORES',
        getStoreDetails: 'GETSTOREDETAILS',
        updateStoreDetails: 'UPDATESTOREDETAILS',
        newEmployee: 'NEWEMPLOYEE',
        deleteStore: 'DELETESTORE',
        deleteEmployee: 'DELETEEMPLOYEE',
        getStoreWithBuyRates: 'GETSTOREWITHBUYRATES',
        updateBuyRate: 'UPDATEBUYRATE',
        getCardsInInventory: 'GETCARDSININVENTORY',
        getLastReconciliationDate: 'GETLASTRECONCILIATIONDATE',
        reconcile: 'RECONCILE',
        getDenials: 'GETDENIALS',
        deleteInventory: 'DELETEINVENTORY',
        getLastReconciliationCompleteDate: 'GETLASTRECONCILIATIONCOMPLETEDATE',
        getCardsInReconciliation: 'GETCARDSINRECONCILIATION',
        markAsReconciled: 'MARKASRECONCILED',
        getReconciliationToday: 'GETRECONCILIATIONTODAY'
      },
      Employee: {
        employeeDetails: 'EMPLOYEEDETAILS',
        update: 'UPDATE',
        getRetailers: 'GETRETAILERS',
        searchCustomerByName: 'SEARCHCUSTOMERBYNAME',
        getCustomer: 'GETCUSTOMER',
        updateCustomer: 'UPDATECUSTOMER',
        checkBalance: 'CHECKBALANCE',
        getRetailersForIntake: 'GETRETAILERSFORINTAKE',
        newCard: 'NEWCARD',
        getCards: 'GETCARDS',
        editCard: 'EDITCARD',
        deleteCard: 'DELETECARD',
        getBuyRatesForStore: 'GETBUYRATESFORSTORE',
        addToInventory: 'ADDTOINVENTORY',
        newCustomer: 'NEWCUSTOMER',
        getCardsForReceipts: 'GETCARDSFORRECEIPTS',
        getAllCustomersThisCompany: 'getAllCustomersThisCompany',
        assignCustomer: 'assignCustomer',
        getAllActivity: 'getAllActivity',
        getReceipt: 'getReceipt',
        checkInventoryNeedReconciled: 'checkInventoryNeedReconciled',
        getStoreReceipts: 'getStoreReceipts',
        updateCardBalance: 'updateCardBalance'
      },
      Inventory: {
        getCards: 'GETCARDS'
      }
    };
  }

  /**
   * Check to verify the call is expected in the constants
   * @todo Remove this, this is dumb
   * @param auth
   */
  check(auth) {
    return auth.split(':');
  }
}

export default new constants();
