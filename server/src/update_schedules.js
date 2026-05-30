import { connectDB } from './config/db.js';
import { Course } from './models/Course.js';

const updateSchedules = async () => {
    await connectDB();

    try {
        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses. Updating schedules...`);

        // Available 1-hour slots: 9 AM to 5 PM (ending at 5 PM)
        // Mandatory break: 1 PM - 2 PM
        const availableStartTimes = [9, 10, 11, 12, 14, 15, 16];

        let courseIndex = 0;
        for (const course of courses) {
            const schedule = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Assign a specific 1-hour slot to each course to ensure no instructor overlap
            // and stay within 9am-5pm.
            const sessionStartHour = availableStartTimes[courseIndex % availableStartTimes.length];
            // Assign a specific day offset based on course index to rotate sessions if needed,
            // but since we have 7 slots and 24 courses, we can have ~3 courses per slot per week.
            // To be safe, let's just assign ONE hour per day for each course but offset the starting day.

            for (let week = 0; week < 2; week++) {
                for (let dayOffset = 1; dayOffset <= 6; dayOffset++) { // Mon-Sat
                    const date = new Date(today);
                    date.setDate(today.getDate() + (week * 7) + dayOffset);

                    if (date.getDay() === 0) continue; // Strict Sunday Skip

                    const courseDayFactor = Math.floor(courseIndex / availableStartTimes.length);
                    // Use modulo 5 to spread across Mon-Sat effectively
                    if (dayOffset % 5 === (courseDayFactor % 5)) {
                        schedule.push({
                            date: new Date(date),
                            startTime: `${sessionStartHour % 12 || 12}:00 ${sessionStartHour >= 12 ? 'PM' : 'AM'}`,
                            endTime: `${(sessionStartHour + 1) % 12 || 12}:00 ${(sessionStartHour + 1) >= 12 ? 'PM' : 'AM'}`,
                            topic: `Lecture: ${course.category} deep dive`
                        });
                    }
                }
            }

            course.schedule = schedule;
            await course.save();
            console.log(`Updated schedule (9-5, break aware, no conflicts) for: ${course.title}`);
            courseIndex++;
        }

        console.log('All course schedules updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schedules:', err);
        process.exit(1);
    }
};

updateSchedules();
