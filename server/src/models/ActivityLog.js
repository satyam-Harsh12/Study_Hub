
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true,
        enum: ['COURSE', 'ENROLLMENT', 'ATTENDANCE', 'USER', 'PAYMENT', 'ASSESSMENT', 'CERTIFICATE', 'LOGIN']
    },
    details: {
        type: String
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    ipAddress: {
        type: String
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    relatedModel: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for better query performance on recent activities
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
