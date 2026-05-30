
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional for student attendance
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Used when marking student attendance
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: false
        },
        date: {
            type: Date,
            required: true // Should be just the date part (e.g., set to midnight)
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false // Optional for backward compatibility, identifies a specific lecture/session
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late', 'Leave', 'Pending'],
            default: 'Pending'
        },
        checkInTime: {
            type: Date
        },
        checkOutTime: {
            type: Date
        },
        type: {
            type: String,
            enum: ['Full Day', 'Half Day', 'Hourly'],
            default: 'Full Day'
        },
        hours: [String], // e.g. ["10:00 AM", "11:00 AM"] if Hourly/Half Day
        markedBy: {
            type: String,
            enum: ['Self', 'Admin', 'System'],
            required: true
        },
        remarks: String
    },
    { timestamps: true }
);

// Removing the strictly unique index since we can have student+course+date or instructor+date
// Keeping no unique index here and will handle uniqueness in controllers.
// attendanceSchema.index({ instructor: 1, date: 1 }, { unique: true });
attendanceSchema.index({ instructor: 1, date: 1 });
attendanceSchema.index({ student: 1, course: 1, date: 1, sessionId: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
