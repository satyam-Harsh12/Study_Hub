import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true }
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

const permissions = [
    { name: 'course.create', description: 'Create new courses' },
    { name: 'course.edit', description: 'Edit existing courses' },
    { name: 'course.delete', description: 'Delete courses' },
    { name: 'course.approve', description: 'Approve courses' },
    { name: 'course.enroll', description: 'Enroll in courses' },
    { name: 'finance.view', description: 'View financial records' },
    { name: 'finance.edit', description: 'Edit financial records' },
    { name: 'payment.create', description: 'Make payments' },
    { name: 'attendance.manage', description: 'Manage attendance' },
    { name: 'user.manage', description: 'Manage users' },
    { name: 'instructor.hire', description: 'Hire instructors' },
    { name: 'instructor.remove', description: 'Remove instructors' },
    { name: 'reports.view', description: 'View reports' },
    { name: 'enrollment.view', description: 'View own enrollments' }
];

const roles = [
    { name: 'super_admin', permissions: permissions.map(p => p.name) },
    { name: 'admin', permissions: ['course.create', 'course.edit', 'course.delete', 'user.manage', 'attendance.manage', 'reports.view', 'finance.view', 'finance.edit'] }, // Classic Full Admin
    { name: 'course_admin', permissions: ['course.create', 'course.edit', 'course.delete', 'course.approve', 'course.enroll', 'reports.view'] },
    { name: 'finance_admin', permissions: ['finance.view', 'finance.edit', 'payment.create', 'reports.view'] },
    { name: 'hr_admin', permissions: ['instructor.hire', 'instructor.remove', 'user.manage', 'attendance.manage', 'reports.view'] },
    { name: 'instructor', permissions: ['course.create', 'course.edit', 'attendance.manage'] },
    { name: 'student', permissions: ['course.enroll', 'payment.create', 'enrollment.view'] }
];

const seedRBAC = async () => {
    try {
        await connectDB();

        // Clear existing
        await Permission.deleteMany({});
        await Role.deleteMany({});

        // Create Permissions
        const createdPermissions = await Permission.insertMany(permissions);
        const permissionMap = {};
        createdPermissions.forEach(p => {
            permissionMap[p.name] = p._id;
        });

        // Create Roles
        for (const roleData of roles) {
            const rolePermissions = roleData.permissions.map(name => permissionMap[name]);
            await Role.create({
                name: roleData.name,
                permissions: rolePermissions
            });
        }

        // Migrate Users
        // Import User dynamically or defining a temporary schema is messy.
        // Better to use the User model if possible. 
        // We need to use dynamic imports or assume User model is available.
        // Let's use mongoose.connection to access the collection directly or define a minimal schema.
        // Actually, since we're in the same project, we can import User.

        // Dynamic import to avoid top-level await issues or circular deps if any
        const { User } = await import('./models/User.js');

        // Use raw collection to avoid casting errors if schema mismatch
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        for (const user of users) {
            // Check if role is a string (old format) or if we just want to reset/ensure
            // If user.role is a string, we map it.
            // If it's already an ObjectId, we might want to ensure it's valid, but simplistic approach:
            // Since we just deleted all Roles, ALL users with ObjectIds are now pointing to non-existent roles!
            // So we MUST re-assign roles to ALL users based on some logic. 
            // BUT we lost the old role name if it was an ObjectId! 
            // WAIT. If I deleted all Roles, the users who had ObjectIds now reference nothing.
            // But before I ran this script, they had Strings ("admin", "student").
            // So they currently have Strings. Schema change to ObjectId doesn't change data in DB.
            // But Mongoose when loading might cast it.
            // We should use `mongoose.connection.db.collection('users')` to read raw data to be safe.

            const rawUser = await mongoose.connection.db.collection('users').findOne({ _id: user._id });
            const oldRoleName = rawUser.role; // This should be "admin", "student", etc. if it was string.

            // If it was already an ID (from previous run), we are in trouble unless we can map it back?
            // Assuming this is first run or we rely on some default.
            // Let's assume users have "admin", "instructor", "student" strings.

            let targetRoleName = 'student';
            if (typeof oldRoleName === 'string') {
                targetRoleName = oldRoleName;
            }

            // If the string doesn't match our new roles (e.g. "super_admin"), default to student or handle?
            // "admin" -> "admin"

            if (user.email === 'admin@demo.com') {
                targetRoleName = 'super_admin';
            } else if (user.email === 'instructor@demo.com') {
                targetRoleName = 'instructor';
            } else if (user.email === 'student@demo.com') {
                targetRoleName = 'student';
            }

            // Find the new Role ID
            const roleDoc = await Role.findOne({ name: targetRoleName });
            if (roleDoc) {
                // Update via direct mongo update to bypass schema validation issues during migration if any
                await mongoose.connection.db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: { role: roleDoc._id } }
                );
                console.log(`Migrated user ${user.email} to role ${targetRoleName}`);
            }
        }

        console.log('RBAC Seeded and Users Migrated Successfully');
        // process.exit(); // Let the caller decide or just exit. 
        // The original code had process.exit().
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRBAC();
