import express from 'express';
import {
    getMyEnrollments,
    requestEnrollment,
    getAllEnrollmentsAdmin,
    updateEnrollmentStatus
} from '../controllers/enrollmentController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, authorizeRoles('enrollment.view'), getMyEnrollments);
router.post('/request', protect, authorizeRoles('course.enroll'), requestEnrollment);

// Admin routes
router.get('/admin/all', protect, authorizeRoles('user.manage'), getAllEnrollmentsAdmin);
router.patch('/admin/status/:id', protect, authorizeRoles('user.manage'), updateEnrollmentStatus);

export default router;


