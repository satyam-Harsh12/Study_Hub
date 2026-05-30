import express from 'express';
import {
  listInstructors,
  createInstructor,
  listCoursesAdmin,
  createCourseAdmin,
  getAdminStats,
  listStudentsWithEnrollments,
  updateCourseSchedule,
  deleteCourse,
  toggleCourseStatus,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  getAllUsers,
  getAuditLogs
} from '../controllers/adminController.js';
import { updateCourse } from '../controllers/courseController.js';
import {
  createAnnouncement,
  getAdminAnnouncements,
  deleteAnnouncement
} from '../controllers/notificationController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Courses management
router.get('/courses', authorizeRoles('course.edit'), listCoursesAdmin);
router.post('/courses', authorizeRoles('course.create'), createCourseAdmin);
router.put('/courses/:id', authorizeRoles('course.edit'), updateCourse);
router.put('/courses/:id/schedule', authorizeRoles('course.edit'), updateCourseSchedule);
router.delete('/courses/:id', authorizeRoles('course.delete'), deleteCourse);
router.patch('/courses/:id/status', authorizeRoles('course.approve'), toggleCourseStatus);

// Users (Students/Instructors) management
router.get('/stats', authorizeRoles('reports.view'), getAdminStats);
router.get('/students', authorizeRoles('user.manage'), listStudentsWithEnrollments);
router.get('/instructors', authorizeRoles('user.manage'), listInstructors);
router.post('/instructors', authorizeRoles('instructor.hire'), createInstructor);

// Generic User Management
router.get('/users', authorizeRoles('user.manage'), getAllUsers);
router.delete('/users/:id', authorizeRoles('user.manage'), deleteUser);
router.patch('/users/:id/role', authorizeRoles('user.manage'), updateUserRole);
router.patch('/users/:id/status', authorizeRoles('user.manage'), toggleUserStatus);

// Announcements management
router.get('/announcements', authorizeRoles('user.manage'), getAdminAnnouncements);
router.post('/announcements', authorizeRoles('user.manage'), createAnnouncement);
router.delete('/announcements/:id', authorizeRoles('user.manage'), deleteAnnouncement);

// Audit Logs
router.get('/audit-logs', authorizeRoles('reports.view'), getAuditLogs);

export default router;


