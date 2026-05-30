import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Notification } from '../models/Notification.js';
import { logActivity } from '../utils/logActivity.js';

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ createdAt: -1 });
    return res.json(enrollments);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(400).json({ message: 'You are already enrolled or have a pending request for this course.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If course is free, we might auto-approve? 
    // But the user said "request enrollment" so let's keep it pending for all for now, 
    // or auto-activate if free. Let's follow "request" requirement.
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'pending'
    });

    // Notify Admins
    await Notification.create({
      title: 'New Enrollment Request',
      message: `${req.user.name} has requested to enroll in "${course.title}". Confirmation is needed.`,
      targetType: 'role',
      targetRole: 'admin',
      sender: studentId
    });

    await logActivity(req, 'ENROLLMENT_REQUESTED', 'ENROLLMENT', `Requested enrollment in ${course.title}`, 'SUCCESS', enrollment._id, 'Enrollment');
    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllEnrollmentsAdmin = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });
    return res.json(enrollments);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Notify Student
    if (status === 'active' || status === 'rejected') {
      await Notification.create({
        title: status === 'active' ? 'Enrollment Approved' : 'Enrollment Rejected',
        message: status === 'active'
          ? `Congratulations! Your enrollment in "${enrollment.course.title}" has been approved.`
          : `We regret to inform you that your enrollment request for "${enrollment.course.title}" was rejected.`,
        targetType: 'user',
        targetUser: enrollment.student,
        sender: req.user._id
      });
    }

    await logActivity(req, status === 'active' ? 'ENROLLMENT_APPROVED' : 'ENROLLMENT_UPDATED', 'ENROLLMENT', `Updated enrollment status to ${status}`, 'SUCCESS', enrollment._id, 'Enrollment');
    return res.json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


