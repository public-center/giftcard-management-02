const helper = require('sendgrid').mail;
const fs = require('fs');
const path = require('path');

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
  setApiKey: function (key) {
    this.apiKey = key;
  },

  /**
   * Send reset password email
   *
   * @param {String} to
   * @param {{resetLink: String}} data
   * @param {Function} callback
   */
  sendResetPasswordEmail: function (to, data, callback) {
    const from = new helper.Email(this.from);
    to = new helper.Email(to);
    const subject = 'Reset Your Password';
    const templatePath = path.resolve(__dirname, '../../../mail_templates/forgot.html');
    fs.readFile(templatePath, 'utf8', (err, template) => {
      template = template.replace(/{{{RESET_LINK}}}/gi, data.resetLink);
      const content = new helper.Content('text/html', template);
      const mail = new helper.Mail(from, subject, to, content);

      const sg = require('sendgrid')(this.apiKey);
      const request = sg.emptyRequest({
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
  sendAccountingEmail: function (recipients, subject, body, callback) {
    const email = new helper.Mail();
    email.setFrom(new helper.Email(this.from));
    email.setSubject(subject);

    const personalization = new helper.Personalization();
    recipients.forEach(recipient => {
      personalization.addTo(new helper.Email(recipient));
    });
    email.addPersonalization(personalization);

    const templatePath = path.resolve(__dirname, '../../../mail_templates/accounting.html')
    fs.readFile(templatePath, 'utf8', (err, template) => {
      template = template.replace(/{{{TITLE}}}/gi, subject);
      template = template.replace(/{{{CONTENT}}}/gi, body);

      email.addContent(new helper.Content('text/html', template));

      const sg = require('sendgrid')(this.apiKey);
      const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: email.toJSON(),
      });

      sg.API(request, callback);
    });
  }
};
