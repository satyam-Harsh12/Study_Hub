import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../models/Payment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Invoice } from '../models/Invoice.js';
import { logActivity } from '../utils/logActivity.js';

export const createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (!course.isPaid) {
      return res.status(400).json({ message: 'Course is free. Payment not required.' });
    }

    const payment = await Payment.create({
      student: req.user._id,
      course: course._id,
      amount: course.price,
      transactionId: `MOCK-${uuidv4()}`,
      status: 'initiated'
    });

    await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: course._id },
      { $setOnInsert: { status: 'pending', payment: payment._id } },
      { upsert: true, new: true }
    );

    await logActivity(req, 'PAYMENT_INITIATED', 'PAYMENT', `Payment initiated for course ${course.title}`, 'SUCCESS', payment._id, 'Payment');

    return res.status(201).json({
      paymentId: payment._id
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const simulateSuccess = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'success';
    payment.gatewayResponse = { mock: true, message: 'Simulated success' };
    await payment.save();

    const enrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course
    });
    if (enrollment) {
      enrollment.status = 'active';
      await enrollment.save();
    }

    const invoice = await Invoice.create({
      payment: payment._id,
      invoiceNumber: `INV-${Date.now()}`,
      issuedTo: payment.student,
      course: payment.course,
      amount: payment.amount,
      taxAmount: 0,
      totalAmount: payment.amount
    });

    await logActivity(req, 'PAYMENT_RECEIVED', 'PAYMENT', `Payment successful for course ${payment.course}`, 'SUCCESS', payment._id, 'Payment');

    return res.json({ message: 'Payment success', payment, invoice });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const simulateFailure = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'failed';
    payment.gatewayResponse = { mock: true, message: 'Simulated failure' };
    await payment.save();

    const enrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course
    });
    if (enrollment) {
      enrollment.status = 'cancelled';
      await enrollment.save();
    }

    return res.json({ message: 'Payment failed', payment });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    return res.json(payments);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};


