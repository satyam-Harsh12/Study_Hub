
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getTodayStatus,
    markAttendance,
    applyLeave,
    getLeaveRequests,
    updateLeaveStatus,
    markStudentAttendance,
    markBulkStudentAttendance,
    getStudentAttendanceStats,
    getMonthlyReport
} from '../controllers/attendanceController.js';

const router = express.Router();

// Attendance Status (Admin & Instructor)
router.get('/today', protect, getTodayStatus);
router.post('/mark', protect, markAttendance);

// Leave Requests
router.post('/leave', protect, authorizeRoles('attendance.manage'), applyLeave);
router.get('/leave', protect, getLeaveRequests); // Admin gets all, Instructor gets own
router.put('/leave/:id', protect, authorizeRoles('attendance.manage'), updateLeaveStatus);

// Student Attendance
router.post('/student/mark', protect, authorizeRoles('attendance.manage'), markStudentAttendance);
router.post('/student/bulk-mark', protect, authorizeRoles('attendance.manage'), markBulkStudentAttendance);
router.get('/student/:courseId/:studentId', protect, getStudentAttendanceStats);
router.get('/student/report', protect, authorizeRoles('attendance.manage'), getMonthlyReport);

export default router;
