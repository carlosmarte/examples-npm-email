const nodemailer = require("nodemailer");

class Mailer {
  constructor(env = "dev") {
    const config = {
      dev: {
        host: "smtp.devmail.com",
        port: 587,
        strictSSL: false,
        from: "dev@example.com",
      },
      qa: {
        host: "smtp.qamail.com",
        port: 587,
        strictSSL: false,
        from: "qa@example.com",
      },
      prod: {
        host: "smtp.prodmail.com",
        port: 465,
        strictSSL: true,
        from: "no-reply@example.com",
      },
    };

    this.env = env;
    this.settings = config[env];

    this.transporter = nodemailer.createTransport({
      host: this.settings.host,
      port: this.settings.port,
      secure: this.settings.strictSSL,
      tls: {
        rejectUnauthorized: this.settings.strictSSL,
      },
    });
  }

  /**
   * Send an email with flexible content options
   * @param {Object} options
   * @param {string} options.to
   * @param {string} options.subject
   * @param {string} [options.text]
   * @param {string} [options.html]
   * @param {function} [options.callback]
   */
  async sendMail({ to, subject, text, html, callback }) {
    let mailContent = {};

    if (typeof callback === "function") {
      mailContent = await callback();
    } else if (html) {
      mailContent.html = html;
    } else if (text) {
      mailContent.text = text;
    } else {
      throw new Error("Must provide text, html, or callback for mail content.");
    }

    const mailOptions = {
      from: this.settings.from,
      to,
      subject,
      ...mailContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error("Error sending email:", err);
      throw err;
    }
  }
}

module.exports = Mailer;
