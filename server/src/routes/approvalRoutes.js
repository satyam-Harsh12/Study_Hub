import express from 'express';
import { getPendingApprovals, reviewApproval } from '../controllers/approvalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// The controller already checks for super_admin role internally, 
// so basic protect is sufficient here, but we can add middleware if we want.
router.get('/pending', getPendingApprovals);
router.post('/:id/review', reviewApproval);

export default router;
