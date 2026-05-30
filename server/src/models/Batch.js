import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduleDesc: {
        type: String,
        default: 'Mon-Fri 09:00 AM - 10:00 AM'
    },
    capacity: {
        type: Number,
        default: 50
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'upcoming'],
        default: 'active'
    }
}, { timestamps: true });

batchSchema.index({ course: 1, name: 1 }, { unique: true });
batchSchema.index({ instructor: 1 });

export const Batch = mongoose.model('Batch', batchSchema);
