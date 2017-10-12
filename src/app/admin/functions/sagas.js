import {makeSelectDomain} from 'admin/functions/selectors';
import request from 'sagas/request';
import {systemTimeSuccess, systemTimeFail} from 'reducers/reducers/adminFunctions';
import {SYSTEM_TIME} from 'reducers/actions/adminFunctions';
import {STATE_CHANGE} from 'reducers/actions/app';

import {
  call,
  put,
  take,
  takeLatest,
  select,
  cancel
} from 'redux-saga/effects'

/**
 * Handle login requests
 */
export function* doUpdateSystemTime() {
  // Get necessary domain
  const domain = yield select(makeSelectDomain());
  const opts = {
    url: 'admin/systemTime',
    method: 'POST',
    body: domain
  };
  try {
    const res = yield call(request, opts);
    yield put(systemTimeSuccess(res));
  } catch (err) {
    yield put(systemTimeFail(err));
  }
}

/**
 * Saga to update the system time
 */
export function* updateSystemTime() {
  // Handle update system time
  const watcher = yield takeLatest(SYSTEM_TIME, doUpdateSystemTime);
  // On location change, cancel the current request (ui-router is dispatching the STATE_CHANGE event on each state change success)
  yield take(action => new RegExp(`${STATE_CHANGE}_main.admin.functions`).test(action.type));
  yield cancel(watcher);
  yield updateSystemTime();
}

