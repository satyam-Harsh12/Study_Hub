import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const seedAccounts = async () => {
    try {
        await connectDB();

        const adminRole = await Role.findOne({ name: 'admin' });
        const teacherRole = await Role.findOne({ name: 'instructor' });

        if (!adminRole || !teacherRole) {
            console.error('Roles not found. Make sure RBAC is seeded.');
            process.exit(1);
        }

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48); // 48 hours expiry

        const accountsToCreate = [
            {
                name: 'System Admin',
                email: 'admin.new@demo.com',
                password: 'TempAdminPassword123!',
                role: adminRole._id,
                isFirstLogin: true,
                needsProfileCompletion: false, // Admin might just need password reset
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher One',
                email: 'teacher1@demo.com',
                password: 'TempPassword123!',
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher Two',
                email: 'teacher2@demo.com',
                password: 'TempPassword123!',
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher Three',
                email: 'teacher3@demo.com',
                password: 'TempPassword123!',
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            }
        ];

        for (const account of accountsToCreate) {
            await User.deleteOne({ email: account.email }); // Clear if exists
            const user = await User.create(account);
            console.log(`Created ${account.email} with Temporary Password: ${account.password}`);
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding accounts:', error);
        process.exit(1);
    }
};

seedAccounts();
