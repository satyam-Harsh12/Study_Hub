import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Enrollment } from './models/Enrollment.js';
import { Payment } from './models/Payment.js';
import { Assessment } from './models/Assessment.js';
import Role from './models/Role.js';

const run = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Assessment.deleteMany({});
    await Enrollment.deleteMany({});
    await Payment.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});

    console.log('Creating users...');
    let adminRole = await Role.findOne({ name: 'admin' });
    let instructorRole = await Role.findOne({ name: 'instructor' });
    let studentRole = await Role.findOne({ name: 'student' });

    if (!adminRole) adminRole = await Role.create({ name: 'admin' });
    if (!instructorRole) instructorRole = await Role.create({ name: 'instructor' });
    if (!studentRole) studentRole = await Role.create({ name: 'student' });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'Admin123!',
      role: adminRole._id
    });

    const instructor1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@demo.com',
      password: 'Instructor123!',
      role: instructorRole._id
    });

    const instructor2 = await User.create({
      name: 'Prof. David Chen',
      email: 'david@demo.com',
      password: 'Instructor123!',
      role: instructorRole._id
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@demo.com',
      password: 'Student123!',
      role: studentRole._id
    });

    console.log('Creating courses...');

    const categories = [
      {
        name: 'Web Development',
        courses: [
          { title: 'Full Stack Web Development (MERN)', description: 'Become a full-stack developer with React, Node.js, Express, and MongoDB.', price: 4999 },
          { title: 'Advanced React & Next.js Masterclass', description: 'Master modern React concepts including Hooks, Context, Redux, and Next.js.', price: 3999 },
          { title: 'Backend Engineering with Node.js', description: 'Build scalable backend systems with Node.js, microservices, and Docker.', price: 4499 }
        ]
      },
      {
        name: 'Data Science & AI',
        courses: [
          { title: 'Python for Data Science Bootcamp', description: 'Complete Python bootcamp for Data Science and Machine Learning.', price: 5999 },
          { title: 'Machine Learning A-Z: Hands-On Python', description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.', price: 6999 },
          { title: 'Deep Learning & Neural Networks', description: 'Understand deep learning and build neural networks using TensorFlow and Keras.', price: 7999 }
        ]
      },
      {
        name: 'UI/UX Design',
        courses: [
          { title: 'Google UX Design Professional Certificate', description: 'Start your career in UX design with a professional certificate from Google.', price: 2999 },
          { title: 'Figma Masterclass: UI Design from Scratch', description: 'Learn to design beautiful user interfaces for web and mobile apps using Figma.', price: 2499 }
        ]
      },
      {
        name: 'Digital Marketing',
        courses: [
          { title: 'Complete Digital Marketing Course', description: 'Master Digital Marketing Strategy, Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!', price: 1999 },
          { title: 'SEO & Social Media Marketing Strategy', description: 'Learn SEO and Social Media Marketing from beginner to advanced level.', price: 1499 }
        ]
      },
      {
        name: 'JEE Mains & Advanced',
        courses: [
          { title: 'JEE Mains 2026: Cracker Course', description: 'Comprehensive course for JEE Mains preparation with mock tests and live classes.', price: 14999 },
          { title: 'H.C. Verma Physics Masterclass', description: 'Deep dive into Physics concepts based on H.C. Verma for JEE Advanced.', price: 4999 }
        ]
      },
      {
        name: 'NEET',
        courses: [
          { title: 'NEET Biology: Complete NCERT Review', description: 'Line-by-line NCERT coverage for NEET Biology.', price: 3999 },
          { title: 'Organic Chemistry for NEET', description: 'Master Organic Chemistry concepts and reactions for NEET.', price: 3499 }
        ]
      },
      {
        name: 'UPSC CSE',
        courses: [
          { title: 'UPSC Prelims: General Studies Paper I', description: 'Comprehensive coverage of History, Geography, Polity, Economy, and Current Affairs.', price: 19999 },
          { title: 'Indian Polity by M. Laxmikanth', description: 'In-depth analysis of Indian Polity for Civil Services Examination.', price: 2999 }
        ]
      },
      {
        name: 'GATE',
        courses: [
          { title: 'GATE CS & IT: Complete Syllabus', description: 'Complete preparation for GATE Computer Science with previous year questions.', price: 12999 },
          { title: 'Engineering Mathematics for GATE', description: 'Master Engineering Mathematics for all GATE streams.', price: 2499 }
        ]
      },
      {
        name: 'Class 12 - Science',
        courses: [
          { title: 'Class 12 Physics: Electrostatics & Magnetism', description: 'Detailed explanation of Class 12 Physics Part 1.', price: 1999 },
          { title: 'Class 12 Chemistry: Solutions & Electrochemistry', description: 'Master Physical Chemistry for Class 12 Boards.', price: 1999 },
          { title: 'Class 12 Mathematics: Calculus', description: 'Complete Calculus coverage for Class 12 Board Exams.', price: 2499 }
        ]
      },
      {
        name: 'Class 12 - Commerce',
        courses: [
          { title: 'Class 12 Accountancy: Partnership Accounts', description: 'Understand Partnership Accounts concepts thoroughly.', price: 1999 },
          { title: 'Class 12 Economics: Macroeconomics', description: 'Complete guide to Macroeconomics for Class 12.', price: 1999 }
        ]
      },
      {
        name: 'Class 10 - Foundation',
        courses: [
          { title: 'Class 10 Maths: Real Numbers & Polynomials', description: 'Build a strong foundation in Mathematics for Class 10.', price: 1499 },
          { title: 'Class 10 Science: Chemical Reactions', description: 'Learn Science concepts with experiments and visual aids.', price: 1499 }
        ]
      },
      {
        name: 'Olympiads',
        courses: [
          { title: 'IMO (International Maths Olympiad) Level 1', description: 'Preparation for IMO Level 1 with tricky problems and solutions.', price: 999 },
          { title: 'NSO (National Science Olympiad) Preparation', description: 'Comprehensive guide for NSO aspirants.', price: 999 }
        ]
      }
    ];

    for (const cat of categories) {
      for (const courseData of cat.courses) {
        await Course.create({
          title: courseData.title,
          description: courseData.description,
          category: cat.name,
          price: courseData.price,
          instructor: Math.random() > 0.5 ? instructor1._id : instructor2._id,
          schedule: [
            {
              date: new Date(),
              startTime: '10:00',
              endTime: '11:00',
              topic: 'Introduction',
              link: 'https://meet.google.com/abc-defg-hij'
            }
          ],
          materials: [],
          isActive: true
        });
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();
