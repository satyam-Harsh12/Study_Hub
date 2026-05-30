import express from 'express';
import { listCourses, getCourse, getCourseContent, getMyCourses, updateCourse, getCourseStudents, createCourse, addLectureSession, markLectureWatched } from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listCourses);
router.post('/', protect, authorizeRoles('course.create'), createCourse);
router.get('/my', protect, getMyCourses);

// Any authenticated user can view course details
router.get('/:id', getCourse);

// Only enrolled students or admins can view content
router.get('/:id/content', protect, getCourseContent);

// Instructors can update their own courses (checked in controller) or admins
router.put('/:id', protect, authorizeRoles('course.edit', 'instructor', 'admin', 'super_admin'), updateCourse);

// Add lecture to course
router.post('/:id/schedule', protect, authorizeRoles('course.edit', 'instructor', 'admin', 'super_admin'), addLectureSession);

// Instructors can view their students
router.get('/:id/students', protect, authorizeRoles('instructor', 'admin', 'super_admin'), getCourseStudents);

// Mark watched
router.post('/:id/schedule/:lectureId/watch', protect, markLectureWatched);

export default router;
