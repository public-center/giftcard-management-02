import createSagaMiddleware from 'redux-saga';

import rootReducer from 'reducers/reducers';
import clientMiddleware from 'reducers/middlewares/clientMiddleware';

export const sagaMiddleware = createSagaMiddleware();

export function config($logProvider, $authProvider, $locationProvider, $httpProvider, $ngReduxProvider) {
  'ngInject';
  // Satellizer configuration
  $authProvider.loginUrl = 'http://localhost:9000/api/authenticate';
  // HTML5 mode
  $locationProvider.html5Mode(true);

  // Enable log
  $logProvider.debugEnabled(true);

  // Handle backend errors
  $httpProvider.interceptors.push('CqErrorInterceptor');

  // Use redux devtools if available
  const enhancers = [];
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION__ === 'function') {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  $ngReduxProvider.createStoreWith(rootReducer, [sagaMiddleware, clientMiddleware(fetch.bind(window))], enhancers);
}
