import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['initiated', 'success', 'failed'],
      default: 'initiated'
    },
    method: { type: String, default: 'mock-card' },
    transactionId: { type: String, unique: true },
    gatewayResponse: { type: Object }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);


