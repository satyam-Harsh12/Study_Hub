import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Attendance } from './models/Attendance.js';

const run = async () => {
    try {
        await connectDB();
        
        console.log('Fetching students and courses...');
        const student = await User.findOne({ email: 'student@demo.com' });
        const courses = await Course.find();
        
        if (!student || courses.length === 0) {
           console.log('Student or courses not found. Cannot seed attendance.');
           process.exit(1);
        }

        console.log('Seeding student & instructor attendance data...');
        const course = courses[0];
        
        const statuses = ['Present', 'Late', 'Absent'];
        
        for(let i = 0; i < 15; i++) {
            let date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0,0,0,0);
            
            let s = statuses[Math.floor(Math.random() * statuses.length)];
            let checkIn = new Date(date);
            if(s === 'Present') checkIn.setHours(8, 55); 
            else if(s === 'Late') checkIn.setHours(9, 20);
            else checkIn = null;

            await Attendance.updateOne(
               { student: student._id, course: course._id, date },
               {
                 $set: {
                   status: s,
                   checkInTime: checkIn,
                   type: 'Full Day',
                   markedBy: 'Admin'
                 }
               },
               { upsert: true }
            );
            
            await Attendance.updateOne(
               { instructor: course.instructor, date },
               {
                 $set: {
                   status: 'Present',
                   type: 'Full Day',
                   markedBy: 'Self'
                 }
               },
               { upsert: true }
            );
        }
        
        console.log('Attendance seeding complete.');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
