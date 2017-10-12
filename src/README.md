# CardQuiry Frontend Docs

## Reselect

[Reselect](https://github.com/reactjs/reselect) is a library which is used to memoize and slice the application state so that the minimal amount of information is passed to each individual view. For example, if we have an application state with three reducers (`App`, `User`, and `Company`), reselect will allow us to only pass `User` and `App` to a view which does not need company.

```javascript
import { createSelector } from 'reselect';

/**
 * The current domain that we want to pass to the view in question
 */
const userDomain = () => (state) => state.user;
const companyDomain = () => (state) => state.company;


/**
 * Various domains which will allow minimal data to be passed to the views in question 
 */
const userDomainJs = () => createSelector(
  userDomain(),
  substate => substate.toJS()
);
const loginDomainJs = () => createSelector(
  userDomain(),
  substate => ({
    email: substate.get('username'),
    password: substate.get('password')
  })
);
const companyNameDomain = () => createSelector(
  companyDomain(),
  substate => substate.get('name')
);

export default makeSelectDomain;
export {
  userDomainJs,
  loginDomainJs,
  companyDomain
};

```

## Redux Saga

[Redux Saga](https://redux-saga.js.org/) is a way of handling side-effects gracefully within the application. Redux Saga follows a "pull" rather than "push" philosophy, wherein actions are pulled from the application state at the appropriate time, rather than simply responding to what is in the redux cycle. 

All sagas which are created must be exported into the root saga, which is then added to the redux middleware. Simply import any new sagas into `src/app/sagas/index.js`, as such:

```javascript
import {saga1, saga2} from 'admin/functions/sagas';

export default function* root() {
  yield all([
    fork(saga1),
    fork(saga2)
  ])
}
```

### Sagas as generators

Sagas make use of generator functions to stop execution of a function until it is needed. Take the following:

```javascript
/**
 * Saga to update the system time
 */
export function* updateSystemTime() {
  yield take(SYSTEM_TIME);
  // Handle update system time
  const watcher = yield takeLatest(CHANGE_SYSTEM_TIME, doUpdateSystemTime);
  // // On location change, cancel the current request (ui-router is dispatching the STATE_CHANGE event on each state change success)
  yield take(STATE_CHANGE);
  yield cancel(watcher);
}

function* doUpdateSystemTime() {
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
```

In the above example, `updateSystemTime` is the saga, so this is the function which is imported into the root saga and passed to the middleware. Note that when this is passed to the middleware, nothing in the function runs until an action with type `SYSTEM_TIME` is dispatched. This is due to the call to [take](https://redux-saga.js.org/docs/api/), which will wait for a specific action before continuing. Once `SYSTEM_TIME` has been dispatched, it will then begin listening for any calls to `CHANGE_SYSTEM_TIME`, and execute the associated function `doUpdateSystemTime`. Data for the saga helper function is from the application state using [reselect](https://github.com/reactjs/reselect), so there is no need to pass data around between functions.

After the saga helper function has `yield`ed a result, the saga continues to execute up until the next call to `take`, which causes the function to pause. If `STATE_CHANGE` is dispatched through the redux cycle, then the function will continue, and [cancel](https://redux-saga.js.org/docs/api/#canceltask) will be called on the saga helper function. In other words, if the state changes during the course of the saga's execution, then execution will be cancelled.

Please familiarize yourself with the [saga API](https://redux-saga.js.org/docs/api/), as it contains numerous helpful functions to assist with data flow and function triggering. Sagas can perform [non-blocking calls](https://redux-saga.js.org/docs/api#forkfn-args), [join multiple tasks](https://redux-saga.js.org/docs/api#jointask), [dispatch actions into the redux cycle](https://redux-saga.js.org/docs/api#putaction), as well as many other things.

### Handling State Change

When the user changes state away from a state in which a saga could be running, we want to cancel that saga so that we're not needlessly incurring data transfer or processing that won't benefit anyone. As such, running sagas should be canceled. This can be accomplished by listening to a dispatched event that follows this pattern: `STATE_CHANGE_<ui-router-pattern>`. For example, the admin functions state is `main.admin.functions`, so the dispatched state change action would be `STATE_CHANGE_main.admin.functions`.

Since we do not currently have a way of dynamically injecting sagas, they are loaded when the application is loaded. So, if a saga such as `takeEvery` is `cancel`ed, then it will no longer run, even if the user leaves the current view and then comes back. To deal with this, after `cancel`ing an action, the same saga should be yielded.

Complete example:

```javascript
export function* updateSystemTime() {
  // Handle update system time
  const watcher = yield takeLatest(SYSTEM_TIME, doUpdateSystemTime);
  // On location change, cancel the current request (ui-router is dispatching the STATE_CHANGE event on each state change success)
  yield take(action => new RegExp(`${STATE_CHANGE}_main.admin.functions`).test(action.type));
  yield cancel(watcher);
  yield updateSystemTime();
}
```
