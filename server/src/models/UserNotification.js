import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'alert'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const UserNotification = mongoose.model('UserNotification', userNotificationSchema);
