import {all, fork} from 'redux-saga/effects';

import {updateSystemTime} from 'admin/functions/sagas';

export default function* root() {
  yield all([
    fork(updateSystemTime)
  ])
}
