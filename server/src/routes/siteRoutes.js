import express from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/siteController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSiteConfig);
router.put('/', protect, authorizeRoles('user.manage'), updateSiteConfig);

export default router;
