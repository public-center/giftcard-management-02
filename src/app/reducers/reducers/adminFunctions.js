import Immutable from 'immutable';

import {SYSTEM_TIME, SYSTEM_TIME_SUCCESS, SYSTEM_TIME_FAIL} from 'reducers/actions/adminFunctions';

const initialAdminFunctions = Immutable.fromJS({user: {}});

/**
 * Recreate rejection history
 */
export function rejectionHistoryConfirm() {
  return {
    types: ['adminFunctions/rejectionHistoryConfirm/success', 'adminFunctions/rejectionHistoryConfirm/fail'],
    func: async client => client.get(`api/admin/recreateRejectionHistory`)
  };
}

/**
 * Fix LQ API customer in regards to the company they're in
 */
export function fixLqApiCustomerCompany(params) {
  return {
    types: ['adminFunctions/fixLqApiCustomerCompany/success', 'adminFunctions/fixLqApiCustomerCompany/fail'],
    func: async client => client.get(`api/admin/lq/customer/fix`, params)
  };
}

// /**
//  * System time functions
//  * @param successValue Whether success or fail saga
//  * @return {Function}
//  */
// function systemTime(successValue = null) {
//   let type = SYSTEM_TIME;
//   return function (result = {}) {
//     if (successValue) {
//       type += `/${successValue}`
//     }
//     console.log('**************FINAL RESULT**********');
//     console.log(Object.assign({
//       type,
//     }, result));
//     return Object.assign({
//       type,
//     }, result);
//   }
// }

export function systemTime() {
  return {
    type: SYSTEM_TIME
  };
}

export function systemTimeSuccess(res) {
  return {
    type: SYSTEM_TIME_SUCCESS,
    res
  };
}

export function systemTimeFail(err) {
  return {
    type: SYSTEM_TIME_FAIL,
    err
  };
}

export function adminFunctionsReducer(state = initialAdminFunctions, action) {
  switch (action.type) {
    case 'adminFunctions/rejectionHistoryConfirm/success':
      return state;
    case 'adminFunctions/rejectionHistoryConfirm/fail':
      return state;
    case 'adminFunctions/systemTime/success':
      console.log('**************SUCCESS IN REDUCER**********');
      return state;
    case 'adminFunctions/systemTime/fail':
      console.log('**************FAIL IN REDUCER**********');
      return state;
    case 'adminFunctions/fixLqApiCustomerCompany/success':
      return state;
    case 'adminFunctions/fixLqApiCustomerCompany/fail':
      return state;
    default:
      return state;
  }
}
