import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, company, message } = req.body;
        
        // 1. Save to a file within the project
        // 1. Save to a file within the project that nodemon ignores by default (dotfile)
        const dataDir = path.join(__dirname, '../../');
        
        const messageData = {
            id: Date.now(),
            name,
            email,
            company,
            message,
            date: new Date().toISOString()
        };
        
        const filePath = path.join(dataDir, '.messages.json');
        let messages = [];
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8');
            if(rawData) {
               messages = JSON.parse(rawData);
            }
        }
        messages.push(messageData);
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

        // 2. Send email notification using nodemailer
        // You'll need to set EMAIL_USER and EMAIL_PASS in your .env
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'ayushraj1y2@gmail.com', // Sent to this specific email as requested
                subject: `New Contact Sales Submission from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`,
            };

            transporter.sendMail(mailOptions)
                .then(info => console.log('Email sent silently in background:', info.messageId))
                .catch(err => console.error('Silent email send error:', err));
        } else {
            console.log("Email not sent: EMAIL_USER or EMAIL_PASS missing from environment variables.");
        }

        res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, message: 'An error occurred while sending your message.' });
    }
};
