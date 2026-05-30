
import cron from 'node-cron';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Notification } from '../models/Notification.js';
import { Course } from '../models/Course.js';

export const startAttendanceCron = () => {
    // Schedule task to run at 9:00 AM every day
    // Cron syntax: minute hour day-of-month month day-of-week
    cron.schedule('0 9 * * *', async () => {
        console.log('Running 9:00 AM Attendance Check...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Find all active instructors
            const instructors = await User.find({ role: 'instructor', isActive: true });

            // 2. Find attendance records for today
            const markedRecords = await Attendance.find({ date: today });
            const markedInstructorIds = markedRecords.map(r => r.instructor.toString());

            // 3. Identify absentees (those who haven't marked attendance)
            const absentees = instructors.filter(inst => !markedInstructorIds.includes(inst._id.toString()));

            console.log(`Found ${absentees.length} absentees.`);

            for (const absentee of absentees) {
                // A. Mark as Absent in Database
                await Attendance.create({
                    instructor: absentee._id,
                    date: today,
                    status: 'Absent',
                    type: 'Full Day',
                    markedBy: 'System',
                    remarks: 'Auto-marked absent at 9:00 AM'
                });

                // B. Notify Admin
                // We'll create a single notification per absentee for admins, or one aggregated?
                // Per user is safer for now.
                const admins = await User.find({ role: 'admin' });
                for (const admin of admins) {
                    await Notification.create({
                        title: 'Instructor Absent',
                        message: `Instructor ${absentee.name} has been marked absent today.`,
                        targetType: 'user',
                        targetUser: admin._id,
                        targetRole: 'admin',
                        sender: absentee._id // nominally "from" the absentee
                    });
                }

                // C. Notify Students
                // Find all active courses taught by this instructor
                const courses = await Course.find({
                    instructor: absentee._id,
                    isActive: true
                });

                for (const course of courses) {
                    await Notification.create({
                        title: 'Class Update: Instructor Absent',
                        message: `Instructor ${absentee.name} has been marked absent today. Please check schedule for updates.`,
                        targetType: 'course',
                        targetCourse: course._id,
                        sender: absentee._id // nominally "from" the absentee
                    });
                }
            }

        } catch (err) {
            console.error('Error in attendance cron:', err);
        }
    });
};
