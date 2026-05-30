
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import Role from './models/Role.js'; // Ensure Role is registered
import { connectDB } from './config/db.js';

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ email: 'admin@demo.com' }).populate('role');
        if (!user) {
            console.log('User admin@demo.com NOT FOUND');
        } else {
            console.log('User found:', user.email, user._id);
            if (!user.role) {
                console.log('User has NO RULE assigned (or role populate failed)');
            } else {
                console.log('User Role:', user.role.name || user.role);
                // Check permissions
                if (user.role.permissions && user.role.permissions.length > 0) {
                    console.log('Permissions count:', user.role.permissions.length);
                } else {
                    console.log('No permissions populated or empty');
                }
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
