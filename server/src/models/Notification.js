import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        targetType: {
            type: String,
            enum: ['all', 'role', 'course', 'user'],
            required: true
        },
        targetRole: {
            type: String,
            enum: ['instructor', 'student', 'admin', 'super_admin']
        },
        targetCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        scheduledDate: {
            type: Date,
            default: Date.now
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
