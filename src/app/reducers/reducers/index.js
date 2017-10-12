import { combineReducers } from 'redux';

import {adminFunctionsReducer} from './adminFunctions';
import {receiptsReducer} from './receipts';
import {userReducer} from './auth';

const rootReducer = combineReducers({
  adminFunctions: adminFunctionsReducer,
  receipts      : receiptsReducer,
  user          : userReducer,
});

export default rootReducer;
