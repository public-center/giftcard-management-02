const helper = require('sendgrid').mail;
const fs = require('fs');
const path = require('path');

module.exports = {
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
    const from = new helper.Email('noreply@cardquiry.com');
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
  }
};
