import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['quiz', 'assignment'], required: true },
    description: { type: String },
    fileUrl: { type: String },
    dueDate: { type: Date },
    maxScore: { type: Number, default: 100 },
    questions: [
      {
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: Number } // Index
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Assessment = mongoose.model('Assessment', assessmentSchema);


