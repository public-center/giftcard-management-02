import _ from 'lodash';
import {smpNames, disabledSmps} from '../config/environment';

export function getActiveSmps() {
  const enabledIds = _.difference(_.keys(smpNames), _.keys(disabledSmps));
  return _.values(_.pick(smpNames, enabledIds));
}
