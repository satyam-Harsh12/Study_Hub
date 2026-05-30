import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAIL'],
        default: 'SUCCESS'
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for better query performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ role: 1, action: 1 });
auditLogSchema.index({ userId: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
