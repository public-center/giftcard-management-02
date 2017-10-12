'use strict';

var helper = require('sendgrid').mail;
var fs = require('fs');
var path = require('path');

module.exports = {
  /**
   * The from address that we'll be using to send emails
   *
   * @var {String}
   */
  from: 'noreply@cardquiry.com',

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

    var from = new helper.Email(this.from);
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
  },

  /**
   * Sends an email to a list of recipients
   *
   * @param {Array} recipients
   * @param {String} subject
   * @param {String} body
   * @param {FUnction} callback
   */
  sendAccountingEmail: function sendAccountingEmail(recipients, subject, body, callback) {
    var _this2 = this;

    var email = new helper.Mail();
    email.setFrom(new helper.Email(this.from));
    email.setSubject(subject);

    var personalization = new helper.Personalization();
    recipients.forEach(function (recipient) {
      personalization.addTo(new helper.Email(recipient));
    });
    email.addPersonalization(personalization);

    var templatePath = path.resolve(__dirname, '../../../mail_templates/accounting.html');
    fs.readFile(templatePath, 'utf8', function (err, template) {
      template = template.replace(/{{{TITLE}}}/gi, subject);
      template = template.replace(/{{{CONTENT}}}/gi, body);

      email.addContent(new helper.Content('text/html', template));

      var sg = require('sendgrid')(_this2.apiKey);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: email.toJSON()
      });

      sg.API(request, callback);
    });
  }
};
//# sourceMappingURL=mailer.js.map
