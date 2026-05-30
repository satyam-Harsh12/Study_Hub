import mongoose from 'mongoose';

const approvalLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['COURSE_CREATION', 'COURSE_DELETION', 'INSTRUCTOR_HIRING', 'INSTRUCTOR_REMOVAL', 'FEE_CHANGE']
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetModel: { type: String, required: true, enum: ['Course', 'User'] },
    changedData: { type: mongoose.Schema.Types.Mixed }, // Stores new values (e.g., new price)
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    comments: { type: String }
}, { timestamps: true });

export const ApprovalLog = mongoose.model('ApprovalLog', approvalLogSchema);
