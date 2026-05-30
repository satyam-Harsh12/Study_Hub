import dotenv from 'dotenv';

dotenv.config();

// Use a non-standard port to avoid conflicts with other local services
export const PORT = process.env.PORT || 5100;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/training_mgmt';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

