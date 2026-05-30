import express from 'express';
import { getUserNotifications, getMyNotifications, markRead, deleteUserNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.get('/user', protect, getMyNotifications);
router.patch('/user/:id/read', protect, markRead);
router.delete('/user/:id', protect, deleteUserNotification);

export default router;
