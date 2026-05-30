import express from 'express';
import {
    createAssessment,
    getInstructorAssessments,
    getAssessmentSubmissions,
    gradeSubmission,
    getCourseAssessments,
    submitAssessment,
    getMyAssessments
} from '../controllers/assessmentController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Instructor Routes
router.post('/', protect, authorizeRoles('instructor', 'admin'), createAssessment);
router.get('/instructor', protect, authorizeRoles('instructor', 'admin'), getInstructorAssessments);
router.get('/:id/submissions', protect, authorizeRoles('instructor', 'admin'), getAssessmentSubmissions);
router.put('/submissions/:id/grade', protect, authorizeRoles('instructor', 'admin'), gradeSubmission);

// Student Routes
router.get('/my', protect, authorizeRoles('student'), getMyAssessments);
router.post('/:id/submit', protect, authorizeRoles('student'), submitAssessment);

// General Routes (Authenticated)
router.get('/course/:courseId', protect, getCourseAssessments);

export default router;


