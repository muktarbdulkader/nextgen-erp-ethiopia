const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email address
    pass: process.env.SMTP_PASS, // App Password (if using Gmail)
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('====================================================');
      console.log('⚠️  SMTP credentials not found. Mocking email send.');
      console.log(`📨 To: ${to}`);
      console.log(`🏷️  Subject: ${subject}`);
      console.log(`📄 Content: ${html.substring(0, 100)}...`);
      console.log('====================================================');
      return true;
    }

    const info = await transporter.sendMail({
      from: `"MuktiAp System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
