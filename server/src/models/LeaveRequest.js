
import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
    {
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        leaveType: {
            type: String,
            enum: ['Full Day', 'Half Day', 'Hourly'],
            required: true
        },
        hours: [String], // if hourly
        reason: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        adminComment: String,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
