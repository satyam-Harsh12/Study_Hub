import express from 'express';
import { body } from 'express-validator';
import { login, register, getMe, sendOtp, verifyOtpAndLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
  ],
  register
);

router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email or User ID is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.get('/me', protect, getMe);


router.post(
  '/send-otp',
  [body('identifier').isEmail().withMessage('Valid email is required')],
  sendOtp
);

router.post(
  '/verify-otp',
  [
    body('identifier').notEmpty(),
    body('otp').isLength({ min: 6 }).withMessage('OTP must be 6 digits')
  ],
  verifyOtpAndLogin
);

import { updatePasswordFirstLogin, completeProfile } from '../controllers/authController.js';

router.post(
  '/update-password-first-login',
  protect,
  [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  updatePasswordFirstLogin
);

router.post(
  '/complete-profile',
  protect,
  [
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
    body('phone').optional({ checkFalsy: true }).isString().withMessage('Mobile number must be a string')
  ],
  completeProfile
);

export default router;


