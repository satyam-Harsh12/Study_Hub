import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    progress: {
      completedLessons: { type: Number, default: 0 },
      totalLessons: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    watchedLectures: [{ type: String }], // Store schedule IDs or lecture IDs
    watchTime: { type: Number, default: 0 }, // in minutes
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);


