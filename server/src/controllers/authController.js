import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import Role from '../models/Role.js'; // Ensure Role model is imported
import { Otp } from '../models/Otp.js';
import { generateToken } from '../utils/jwt.js';
import { logAction } from '../utils/logger.js';
import otpGenerator from 'otp-generator';
import { sendEmail } from '../utils/email.js';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone already registered' });
      }
    }

    // Find role object - strictly default to student as requested
    let roleObj = await Role.findOne({ name: 'student' });
    if (!roleObj) {
      roleObj = await Role.findOne({ name: 'student' });
    }

    const user = await User.create({ name, email, phone, password: password || 'OTP_USER_Placeholder', role: roleObj._id });
    const token = generateToken(user);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: roleObj.name },
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: email }, { userId: email }] });
    if (!user) {
      return res.status(400).json({ message: 'Account with this Email or User ID does not exist' });
    }

    if (user.isFirstLogin && user.tempPasswordExpiry && user.tempPasswordExpiry < new Date()) {
        return res.status(403).json({ message: 'Temporary password has expired. Please contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const roleDoc = await Role.findById(user.role);
      await logAction(user._id, roleDoc ? roleDoc.name : 'student', 'LOGIN', null, 'Failed login attempt - Incorrect password', 'FAIL', req);
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const populatedUser = await user.populate({ path: 'role', populate: { path: 'permissions' } });

    const token = generateToken(user);
    
    await logAction(populatedUser._id, populatedUser.role.name, 'LOGIN', null, 'User logged in successfully', 'SUCCESS', req);
    
    return res.json({
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role.name,
        permissions: populatedUser.role.permissions,
        isFirstLogin: populatedUser.isFirstLogin,
        needsProfileCompletion: populatedUser.needsProfileCompletion
      },
      token
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updatePasswordFirstLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = req.body.newPassword;
    user.isFirstLogin = false;
    user.tempPasswordExpiry = undefined; // clear expiry
    
    // We enforce profile completion next step if needed.
    // Ensure needsProfileCompletion is true so the frontend knows what to do
    user.needsProfileCompletion = true;
    
    await user.save();

    return res.json({ message: 'Password updated successfully. Please complete your profile.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating password' });
  }
};

export const completeProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { email, phone, skip } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (skip) {
      // Import Notification dynamically to avoid circular dependencies if any
      const { Notification } = await import('../models/Notification.js');
      
      await Notification.create({
        title: 'Action Required: Complete Profile',
        message: 'You have skipped onboarding. Please go to your profile settings and update your Email Address and Mobile Number to ensure you receive communications and secure account recovery options.',
        targetType: 'user',
        targetUser: user._id,
        sender: user._id 
      });

      user.needsProfileCompletion = false;
      await user.save();

      const roleName = user.role?.name || 'student';
      await logAction(user._id, roleName, 'UPDATE_PROFILE', user._id, 'Skipped profile completion', 'SUCCESS', req);

      return res.json({ message: 'Profile completion skipped.' });
    }

    // Update with new email/phone
    if (email) user.email = email;
    if (phone) user.phone = phone;
    user.needsProfileCompletion = false;
    
    await user.save();

    const roleName = user.role?.name || 'student';
    await logAction(user._id, roleName, 'UPDATE_PROFILE', user._id, 'Completed profile update', 'SUCCESS', req);

    return res.json({ message: 'Profile completed successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error completing profile' });
  }
};

export const getMe = async (req, res) => {
  return res.json(req.user);
};

// --- OTP Logic ---

export const sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array()[0].msg || "Please provide a valid email to receive OTP" 
    });
  }

  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: "Email is required" });

    // Generate 6 digit numeric OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    // 5 minutes expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to DB (overwrite existing for this identifier)
    await Otp.deleteMany({ identifier });
    await Otp.create({ identifier, otp, expiresAt });

    // Send email
    const emailSubject = "Your Login Verification Code";
    const emailText = `Your OTP for login is ${otp}. It will expire in 5 minutes.`;
    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome Back!</h2>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 5 minutes.</p>
    </div>`;

    const emailSent = await sendEmail(identifier, emailSubject, emailText, emailHtml);

    if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP to email. Please try again later." });
    }

    return res.json({ message: `OTP sent successfully to ${identifier}` }); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error sending OTP' });
  }
}

export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    const record = await Otp.findOne({ identifier, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check expiry explicitly if DB TTL lag (optional)
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid. Now find user.
    // Ensure it's treated as email ONLY
    const isEmail = identifier.includes('@');
    if (!isEmail) return res.status(400).json({ message: 'Invalid email identifier' });

    let user = await User.findOne({ email: identifier });

    if (!user) {
      // Auto-register user with default student role
      let roleObj = await Role.findOne({ name: 'student' });
      if (!roleObj) {
        // fallback just in case 'student' role is missing
        return res.status(500).json({ message: 'System error: Default role not found.' });
      }

      // Generate a simple name from the email (e.g., "jane.doe" from "jane.doe@example.com")
      const generatedName = identifier.split('@')[0];
      
      user = await User.create({
        name: generatedName,
        email: identifier,
        password: 'OTP_USER_Placeholder_' + Math.random().toString(36).substring(7),
        role: roleObj._id
      });
    }

    // Login success
    // Clean up OTP
    await Otp.deleteOne({ _id: record._id });

    const token = generateToken(user);
    // Populate role for frontend usage
    const populatedUser = await User.findById(user._id).populate('role');

    await logAction(populatedUser._id, populatedUser.role.name, 'LOGIN', null, 'User logged in successfully via OTP', 'SUCCESS', req);

    return res.json({
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role.name, // Send role name string as expected by frontend
        permissions: populatedUser.role.permissions
      },
      token
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error verifying OTP' });
  }
}


