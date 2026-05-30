import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

const EXPIRES_IN = '7d';

export const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);


