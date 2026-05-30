import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getInstructorPerformance, getStudentPerformanceReport, generateBatchResult } from '../controllers/reportController.js';

const router = express.Router();

router.get('/instructor/performance', protect, authorizeRoles('attendance.manage'), getInstructorPerformance);
router.get('/student/performance', protect, authorizeRoles('attendance.manage', 'reports.view', 'admin', 'super_admin'), getStudentPerformanceReport);
router.post('/admin/generate-results', protect, authorizeRoles('admin', 'super_admin'), generateBatchResult);

export default router;
