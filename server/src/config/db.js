import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
};


