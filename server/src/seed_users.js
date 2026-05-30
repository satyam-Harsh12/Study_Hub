
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

const seedUsers = async () => {
    try {
        await connectDB();

        const users = [
            {
                name: 'Admin User',
                email: 'admin@demo.com',
                password: 'Admin123!',
                role: 'admin'
            },
            {
                name: 'John Instructor',
                email: 'instructor@demo.com',
                password: 'Instructor123!',
                role: 'instructor'
            },
            {
                name: 'Jane Student',
                email: 'student@demo.com',
                password: 'Student123!',
                role: 'student'
            }
        ];

        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                await User.create(u);
                console.log(`Created user: ${u.email}`);
            } else {
                console.log(`User already exists: ${u.email}`);
            }
        }

        console.log('User seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
