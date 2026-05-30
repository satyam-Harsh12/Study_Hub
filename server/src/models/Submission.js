import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
    {
        assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String }, // URL or text answer
        answers: [{ type: Number }], // For quizzes (indices)
        obtainedMarks: { type: Number },
        feedback: { type: String },
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted'
        }
    },
    { timestamps: true }
);

submissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
