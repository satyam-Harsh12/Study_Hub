import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Course } from './models/Course.js';

const run = async () => {
    try {
        await connectDB();

        console.log('Seeding batches...');

        // Find the instructor to assign courses to
        let instructor = await User.findOne({ email: 'instructor@demo.com' });
        if (!instructor) {
            console.log('Instructor not found, creating one...');
            instructor = await User.create({
                name: 'John Instructor',
                email: 'instructor@demo.com',
                password: 'Instructor123!',
                role: 'instructor'
            });
        }

        const batches = [
            // JEE
            { title: 'JEE Mains Crash Course 2026', category: 'JEE', price: 4999, description: 'Intensive crash course for JEE Mains attempt 1.' },
            { title: 'JEE Advanced Physics Mastery', category: 'JEE', price: 6999, description: 'Deep dive into rotational mechanics and electromagnetism.' },
            { title: 'Organic Chemistry for JEE', category: 'JEE', price: 3499, description: 'Master organic chemistry reactions and mechanisms.' },
            { title: 'JEE Mathematics - Calculus', category: 'JEE', price: 3999, description: 'Calculus from basics to advanced level for JEE aspirants.' },

            // NEET
            { title: 'NEET Biology Complete Bundle', category: 'NEET', price: 5999, description: 'Complete biology syllabus coverage for NEET.' },
            { title: 'Physics for Medical Entrances', category: 'NEET', price: 4499, description: 'Physics concepts simplified for medical students.' },
            { title: 'NEET Chemistry Series', category: 'NEET', price: 4999, description: 'Physical, Inorganic and Organic chemistry for NEET.' },

            // MBA
            { title: 'CAT 2026 Comprehensive Prep', category: 'MBA', price: 14999, description: 'Full syllabus coverage for Common Admission Test.' },
            { title: 'MBA Interview Preparation', category: 'MBA', price: 2999, description: 'Mock interviews and group discussion practice.' },
            { title: 'Data Interpretation & Logical Reasoning', category: 'MBA', price: 4999, description: 'Master DILR for CAT, XAT, and other MBA exams.' },
            { title: 'Quantitative Aptitude for MBA', category: 'MBA', price: 5499, description: 'Speed math and detailed quant concepts.' },

            // 10th Board
            { title: 'Class 10 Science - Board Booster', category: '10th Board', price: 1999, description: 'Physics, Chemistry, and Biology fast track revision.' },
            { title: 'Class 10 Maths - Exam Ready', category: '10th Board', price: 1999, description: 'Important questions and previous year papers solved.' },
            { title: 'Class 10 Social Science - History & Civics', category: '10th Board', price: 1499, description: 'Detailed explanation of all chapters.' },

            // 12th Board
            { title: 'Class 12 Physics - Board Special', category: '12th Board', price: 2499, description: 'Derivations and numericals for board exams.' },
            { title: 'Class 12 Chemistry - Organic & Inorganic', category: '12th Board', price: 2499, description: 'Score 95+ in Chemistry with our proven methods.' },
            { title: 'Class 12 Mathematics - Calculus & Vectors', category: '12th Board', price: 2999, description: 'Complete coverage of part 1 and part 2 NCERT.' },
            { title: 'English Core - Class 12', category: '12th Board', price: 999, description: 'Literature and writing skills for board exams.' }
        ];

        for (const batch of batches) {
            await Course.create({
                title: batch.title,
                description: batch.description,
                category: batch.category,
                price: batch.price,
                instructor: instructor._id,
                isActive: true,
                isPaid: batch.price > 0
            });
            console.log(`Created course: ${batch.title}`);
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

run();
