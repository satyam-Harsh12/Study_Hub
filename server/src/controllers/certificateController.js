import { Certificate } from '../models/Certificate.js';
import { Enrollment } from '../models/Enrollment.js';
import { v4 as uuidv4 } from 'uuid';

export const issueCertificate = async (req, res) => {
    try {
        const { enrollmentId } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('student', 'name')
            .populate('course', 'title');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Check if progress is 100% or if already issued
        if (enrollment.status !== 'completed' && enrollment.progress?.percentage < 100) {
            return res.status(400).json({ message: 'Course not yet completed' });
        }

        const existing = await Certificate.findOne({
            student: enrollment.student._id,
            course: enrollment.course._id
        });

        if (existing) {
            return res.json(existing);
        }

        const certificate = await Certificate.create({
            student: enrollment.student._id,
            course: enrollment.course._id,
            certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`,
            issueDate: new Date()
        });

        return res.status(201).json(certificate);
    } catch (err) {
        console.error('Issue Certificate Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getMyCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ student: req.user._id })
            .populate({
                path: 'course',
                select: 'title instructor',
                populate: {
                    path: 'instructor',
                    select: 'name'
                }
            })
            .populate('student', 'name')
            .sort({ createdAt: -1 });
        return res.json(certs);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getCertificateById = async (req, res) => {
    try {
        const { id } = req.params;
        const cert = await Certificate.findById(id)
            .populate('student', 'name')
            .populate('course', 'title');

        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        return res.json(cert);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};
