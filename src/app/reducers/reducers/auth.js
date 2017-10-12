import Immutable from 'immutable';

const initialSetUser = Immutable.fromJS({user: {}});

/**
 * Save the currently logged in user
 *
 * @param {Object} user
 */
export function setUser(user) {
  return {
    types: 'auth/set_user',
    func: () => user
  };
}

export function userReducer(state = initialSetUser, action) {
  switch (action.type) {
    case 'auth/set_user':
      return state.set('user', Immutable.fromJS(action.result));
    default:
      return state;
  }
}
