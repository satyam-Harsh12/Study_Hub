
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Course } from './models/Course.js';

dotenv.config();

import { MONGO_URI } from './config/env.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedInstructorsAndAssignCourses = async () => {
    await connectDB();

    try {
        // 1. Create Instructors
        const instructors = [
            {
                name: 'John Doe Instructor',
                email: 'john.instructor@example.com',
                password: 'password123',
                role: 'instructor'
            },
            {
                name: 'Jane Smith Instructor',
                email: 'jane.instructor@example.com',
                password: 'password123',
                role: 'instructor'
            },
            {
                name: 'Bob Johnson Instructor',
                email: 'bob.instructor@example.com',
                password: 'password123',
                role: 'instructor'
            }
        ];

        const createdInstructors = [];

        for (const inst of instructors) {
            // Check if exists
            let user = await User.findOne({ email: inst.email });
            if (!user) {
                user = await User.create(inst);
                console.log(`Created instructor: ${user.email}`);
            } else {
                console.log(`Instructor already exists: ${user.email}`);
                // Ensure role is instructor
                if (user.role !== 'instructor') {
                    user.role = 'instructor';
                    await user.save();
                }
            }
            createdInstructors.push(user);
        }

        // 2. Distribute Courses
        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses to distribute.`);

        if (courses.length === 0) {
            console.log('No courses found to assign.');
        } else {
            let instructorIndex = 0;
            for (const course of courses) {
                const assignedInstructor = createdInstructors[instructorIndex];

                course.instructor = assignedInstructor._id;
                await course.save();

                console.log(`Assigned course "${course.title}" to ${assignedInstructor.name} (${assignedInstructor.email})`);

                // Rotate instructor
                instructorIndex = (instructorIndex + 1) % createdInstructors.length;
            }
        }

        console.log('\n--- Credentials ---');
        createdInstructors.forEach(inst => {
            console.log(`Email: ${inst.email} | Password: password123`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedInstructorsAndAssignCourses();
