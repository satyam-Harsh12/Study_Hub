import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    invoiceNumber: { type: String, unique: true, required: true },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: Number,
    taxAmount: Number,
    totalAmount: Number,
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: String
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);


