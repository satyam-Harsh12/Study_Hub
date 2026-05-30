import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Assuming gmail, change if a different provider is used
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Training Center" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
