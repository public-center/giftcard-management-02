import FetchWrapper from './fetchWrapper';

export default function clientMiddleware(client) {
  client = new FetchWrapper(client);
  return () => {
    return next => async action => {
      const {func, types, type, ...rest} = action;
      // Sagas
      if (type && !types) {
        return next({type, ...rest});
      }

      if (typeof func !== 'function') {
        return next({types});
      }

      let response = func(client);
      let result;

      if (response instanceof Promise) {
        response = await response;
        result = await response.json();
        const [SUCCESS, FAILURE] = types;

        return next({...rest, result, type: response.ok ? SUCCESS : FAILURE});
      } else {
        result = response;
        return next({...rest, result, type: types});
      }
    };
  };
}
