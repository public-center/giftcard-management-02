import { createSelector } from 'reselect';

/**
 * Direct selector to the login state domain
 */
const selectDomain = () => (state) => state.user;


/**
 * Default selector used by Login
 */
const makeSelectDomain = () => createSelector(
  selectDomain(),
  substate => substate.toJS()
);

export default makeSelectDomain;
export {
  makeSelectDomain
};
