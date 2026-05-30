
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import Role from '../models/Role.js'; // Ensure default export or named
import { MONGO_URI } from '../config/env.js';
import { ActivityLog } from '../models/ActivityLog.js'; // Ensure correct import
import { ApprovalLog } from '../models/ApprovalLog.js';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const adminRole = await Role.findOne({ name: 'admin' });
        const superAdminRole = await Role.findOne({ name: 'super_admin' });

        const roles = [];
        if (adminRole) roles.push(adminRole._id);
        if (superAdminRole) roles.push(superAdminRole._id);

        if (roles.length === 0) {
            console.log('No Admin roles found.');
            process.exit(0);
        }

        const admins = await User.find({ role: { $in: roles } }).populate('role');

        if (admins.length === 0) {
            console.log('No admin users found.');
        }

        console.log('\n--- ADMIN USERS ---');
        for (const admin of admins) {
            const workCount = await ActivityLog.countDocuments({ user: admin._id });
            const reviewedCount = await ApprovalLog.countDocuments({ reviewedBy: admin._id });
            const requestedCount = await ApprovalLog.countDocuments({ requestedBy: admin._id });
            const lastActivity = await ActivityLog.findOne({ user: admin._id }).sort({ createdAt: -1 });

            console.log(`ID: ${admin._id}`);
            console.log(`Name: ${admin.name}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Role: ${admin.role?.name || 'Unknown'}`);
            console.log(`Activity Logs: ${workCount}`);
            console.log(`Approvals Reviewed: ${reviewedCount}`);
            console.log(`Requests Made: ${requestedCount}`);
            if (lastActivity) {
                console.log(`Last Action: ${lastActivity.action} on ${lastActivity.createdAt}`);
            }
            console.log('-------------------');
        }

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
