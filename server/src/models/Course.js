import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    date: Date,
    startTime: String,
    endTime: String,
    topic: String,
    link: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    url: String
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: Date,
    endDate: Date,
    schedule: [scheduleSchema],
    materials: [materialSchema],
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED'
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

courseSchema.pre('save', function preSave(next) {
  this.isPaid = this.price > 0;
  next();
});

export const Course = mongoose.model('Course', courseSchema);


