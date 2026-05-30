import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        identifier: { type: String, required: true }, // Email or Phone
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true }
    },
    { timestamps: true }
);

// TTL Index to auto-delete expired OTPs after 5 minutes (300 seconds)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model('Otp', otpSchema);
