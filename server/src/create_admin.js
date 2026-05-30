import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { MONGO_URI } from './config/env.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await connectDB();
    try {
        const adminEmail = 'admin@demo.com';
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'Admin123!',
                role: 'admin'
            });
            console.log('Admin created: admin@demo.com / Admin123!');
        } else {
            console.log('Admin already exists.');
            // Update password to be sure if needed, but let's assume it's known or reset it
            // admin.password = 'Admin123!';
            // await admin.save();
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                await admin.save();
                console.log('Role updated to admin');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
