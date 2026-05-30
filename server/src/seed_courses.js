import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Course } from './models/Course.js';
import { User } from './models/User.js';
import Role from './models/Role.js';

dotenv.config();

const domains = [
    { title: 'Web Development', category: 'Web Development', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600', description: 'Master Frontend, Backend, and Full Stack development.', isPaid: true, price: 4999 },
    { title: 'Data Science & AI', category: 'Data Science & AI', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600', description: 'Learn Python, Machine Learning, and Analytics.', isPaid: true, price: 5999 },
    { title: 'UI/UX Design', category: 'UI/UX Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600', description: 'Design beautiful interfaces with Figma.', isPaid: false, price: 0 },
    { title: 'Digital Marketing', category: 'Digital Marketing', image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=600', description: 'Master SEO, Ads, and Social Media Marketing.', isPaid: true, price: 2999 },
    { title: 'JEE Mains & Advanced', category: 'JEE Mains & Advanced', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600', description: 'Comprehensive preparation for engineering entrance.', isPaid: true, price: 9999 },
    { title: 'NEET', category: 'NEET', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600', description: 'Medical entrance exam preparation course.', isPaid: true, price: 9999 },
    { title: 'UPSC CSE', category: 'UPSC CSE', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600', description: 'Civil Services Examination preparation.', isPaid: true, price: 14999 },
    { title: 'GATE', category: 'GATE', image: 'https://images.unsplash.com/photo-1517245386807-bb43f820637c?auto=format&fit=crop&q=80&w=600', description: 'Graduate Aptitude Test in Engineering.', isPaid: true, price: 7999 },
    { title: 'Class 12 - Science', category: 'Class 12 - Science', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600', description: 'Physics, Chemistry, Maths, and Biology.', isPaid: true, price: 3999 },
    { title: 'Class 12 - Commerce', category: 'Class 12 - Commerce', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', description: 'Accountancy, Economics, and Business Studies.', isPaid: true, price: 3999 },
    { title: 'Class 10 - Foundation', category: 'Class 10 - Foundation', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600', description: 'Strong foundation for secondary education.', isPaid: true, price: 2999 },
    { title: 'Olympiads', category: 'Olympiads', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600', description: 'Prepare for International Math and Science Olympiads.', isPaid: false, price: 0 }
];

const seedCourses = async () => {
    try {
        await connectDB();

        let instructor = await User.findOne({ email: 'instructor@demo.com' });

        if (!instructor) {
            const instructorRole = await Role.findOne({ name: 'instructor' });
            if (instructorRole) {
                instructor = await User.findOne({ role: instructorRole._id });
            }
        }

        if (!instructor) {
            console.log("No instructor or specific demo instructor found. Trying admin.");
            instructor = await User.findOne({ email: 'admin@demo.com' });
        }

        if (!instructor) {
            instructor = await User.findOne({});
        }

        if (!instructor) {
            console.error("Critical: No user found to assign as course instructor.");
            process.exit(1);
        }

        console.log(`Assigning courses to instructor: ${instructor.email} (${instructor._id})`);

        for (const domain of domains) {
            const exists = await Course.findOne({ title: domain.title });
            if (!exists) {
                await Course.create({
                    title: domain.title,
                    description: domain.description,
                    category: domain.category,
                    instructor: instructor._id,
                    price: domain.price,
                    isPaid: domain.isPaid,
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    isActive: true
                });
                console.log(`Created course: ${domain.title}`);
            } else {
                console.log(`Course exists: ${domain.title}`);
            }
        }

        console.log("Course seeding completed.");
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedCourses();
