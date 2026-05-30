import express from 'express';
import {
  createPayment,
  simulateFailure,
  simulateSuccess,
  getUserPayments
} from '../controllers/paymentController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, authorizeRoles('payment.create'), createPayment);
router.post('/:paymentId/success', protect, simulateSuccess); // Usually public callback or protected
router.post('/:paymentId/fail', protect, simulateFailure);
router.get('/my', protect, authorizeRoles('enrollment.view'), getUserPayments);

export default router;


