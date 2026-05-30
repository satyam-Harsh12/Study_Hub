import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import Role from '../models/Role.js';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config();

function generateRandomNumericId() {
    const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"
    // Generate 5 random digits not sequential
    let randomPart = '';
    while (randomPart.length < 5) {
        const digit = Math.floor(Math.random() * 10);
        // minimal effort to avoid something too sequential, though random generation is usually non-sequential naturally
        if (randomPart.length > 0 && Math.abs(parseInt(randomPart[randomPart.length - 1]) - digit) === 1) {
            continue; // Skip sequential digits
        }
        randomPart += digit;
    }
    return `1${currentYear}${randomPart}`;
}

function generateRandomPassword() {
    return 'Temp@' + crypto.randomBytes(4).toString('hex') + '!';
}

const seedAccounts = async () => {
    try {
        await connectDB();

        const adminRole = await Role.findOne({ name: 'admin' });
        const teacherRole = await Role.findOne({ name: 'instructor' });

        if (!adminRole || !teacherRole) {
            console.error('Roles not found. Make sure RBAC is seeded.');
            process.exit(1);
        }

        try {
            await mongoose.connection.db.collection('users').dropIndex('email_1');
        } catch (e) {
            // ignore if doesn't exist
        }
        await User.syncIndexes();

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48); // 48 hours expiry

        // Ensure we don't have lingering collision
        await User.deleteMany({ isFirstLogin: true, needsProfileCompletion: true });

        const accountsToCreate = [
            {
                name: 'System Admin',
                userId: generateRandomNumericId(),
                password: generateRandomPassword(),
                role: adminRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher One',
                userId: generateRandomNumericId(),
                password: generateRandomPassword(),
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher Two',
                userId: generateRandomNumericId(),
                password: generateRandomPassword(),
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            },
            {
                name: 'Teacher Three',
                userId: generateRandomNumericId(),
                password: generateRandomPassword(),
                role: teacherRole._id,
                isFirstLogin: true,
                needsProfileCompletion: true,
                tempPasswordExpiry: expiryDate
            }
        ];

        const outputData = [];
        for (const account of accountsToCreate) {
            const user = await User.create(account);
            outputData.push({ role: account.name, userId: account.userId, password: account.password });
        }

        fs.writeFileSync('credentials.json', JSON.stringify(outputData, null, 2));
        
        console.log('Seeding complete. Wrote to credentials.json');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding accounts:', error);
        process.exit(1);
    }
};

seedAccounts();
