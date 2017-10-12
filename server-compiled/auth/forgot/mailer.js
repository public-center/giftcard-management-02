'use strict';

var helper = require('sendgrid').mail;
var fs = require('fs');
var path = require('path');

module.exports = {
  /**
   * Set SendGrid API key
   *
   * @param {String} key
   */
  setApiKey: function setApiKey(key) {
    this.apiKey = key;
  },
  /**
   * Send reset password email
   *
   * @param {String} to
   * @param {{resetLink: String}} data
   * @param {Function} callback
   */
  sendResetPasswordEmail: function sendResetPasswordEmail(to, data, callback) {
    var _this = this;

    var from = new helper.Email('noreply@cardquiry.com');
    to = new helper.Email(to);
    var subject = 'Reset Your Password';
    var templatePath = path.resolve(__dirname, '../../../mail_templates/forgot.html');
    fs.readFile(templatePath, 'utf8', function (err, template) {
      template = template.replace(/{{{RESET_LINK}}}/gi, data.resetLink);
      var content = new helper.Content('text/html', template);
      var mail = new helper.Mail(from, subject, to, content);

      var sg = require('sendgrid')(_this.apiKey);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });

      sg.API(request, callback);
    });
  }
};
//# sourceMappingURL=mailer.js.map
