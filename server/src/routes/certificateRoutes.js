import express from 'express';
import {
    issueCertificate,
    getMyCertificates,
    getCertificateById
} from '../controllers/certificateController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, authorizeRoles('student'), getMyCertificates);
router.post('/issue', protect, authorizeRoles('admin'), issueCertificate);
router.get('/:id', protect, getCertificateById);

export default router;
