import config from '../../config/environment';
import mailer from './mailer';

mailer.setApiKey(config.sgToken);

export default mailer;
