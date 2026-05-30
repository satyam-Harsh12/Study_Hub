import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true }, // Sparse allows unique validation to ignore nulls if phone isn't provided (e.g. email only)
    userId: { 
      type: String, 
      unique: true, 
      sparse: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // Format: 1 + YY + 5 random digits. 
          // Check strict current year only on creation.
          if (this && this.isNew) {
            const currentYear = new Date().getFullYear().toString().slice(-2);
            return new RegExp(`^1${currentYear}\\d{5}$`).test(v);
          }
          return /^1\d{2}\d{5}$/.test(v);
        },
        message: props => `${props.value} is not a valid User ID format!`
      }
    },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED'
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    isFirstLogin: { type: Boolean, default: false },
    tempPasswordExpiry: { type: Date },
    needsProfileCompletion: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);


