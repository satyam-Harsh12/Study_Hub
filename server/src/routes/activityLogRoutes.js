
import express from 'express';
import { getRecentActivities } from '../controllers/activityLogController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('admin', 'super_admin'), getRecentActivities);

export default router;
