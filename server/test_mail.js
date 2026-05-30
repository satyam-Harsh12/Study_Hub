import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'ayushraj1y2@gmail.com',
    subject: 'Test connection',
    text: 'If you see this, Nodemailer is working!'
})
.then(info => console.log('Email sent successfully:', info.response))
.catch(err => console.error('Error sending email:', err));
