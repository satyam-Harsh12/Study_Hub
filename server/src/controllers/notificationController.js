import { Notification } from '../models/Notification.js';
import { UserNotification } from '../models/UserNotification.js';
import { Enrollment } from '../models/Enrollment.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, targetType, targetRole, targetCourse, scheduledDate } = req.body;

        if (!title || !message || !targetType) {
            return res.status(400).json({ message: 'Title, message and targetType are required' });
        }

        // Handle scheduledDate: if it's just a date string (YYYY-MM-DD),
        // and it matches today in local time, we should probably treat it as "now"
        // to avoid future-scheduling due to UTC midnight issues.
        let finalDate = scheduledDate ? new Date(scheduledDate) : new Date();

        // Simple check: if the provided date is today (UTC or near-UTC), 
        // and it was just a date string, it might be in the future for some hours.
        // If it's within the next 24 hours and lacks time info, let's just make it immediate
        // unless the targetType is specifically intending to schedule.
        if (scheduledDate && scheduledDate.length === 10) { // e.g. "2025-12-21"
            const now = new Date();
            if (finalDate > now && (finalDate - now) < 24 * 60 * 60 * 1000) {
                finalDate = now; // Make it immediate if they picked "today"
            }
        }

        const notification = await Notification.create({
            title,
            message,
            targetType,
            targetRole: targetType === 'role' ? targetRole : undefined,
            targetCourse: targetType === 'course' && targetCourse ? targetCourse : undefined,
            scheduledDate: finalDate,
            sender: req.user._id
        });

        return res.status(201).json(notification);
    } catch (err) {
        console.error('Create Announcement Error:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getAdminAnnouncements = async (req, res) => {
    try {
        const announcements = await Notification.find({})
            .populate('targetCourse', 'title')
            .sort({ createdAt: -1 });
        return res.json(announcements);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const now = new Date();

        // Get courses student is enrolled in
        let enrolledCourseIds = [];
        if (userRole === 'student') {
            const enrollments = await Enrollment.find({ student: userId, status: 'active' });
            enrolledCourseIds = enrollments.map(e => e.course);
        }

        // Find notifications matching user's criteria
        let query = {
            isActive: true,
            scheduledDate: { $lte: now }
        };

        // If not admin, apply targeting filters
        if (userRole !== 'admin') {
            query.$or = [
                { targetType: 'all' },
                { targetType: 'role', targetRole: userRole },
                { targetType: 'course', targetCourse: { $in: enrolledCourseIds } },
                { targetType: 'user', targetUser: userId }
            ];
        }

        const notifications = await Notification.find(query)
            .sort({ scheduledDate: -1 });

        return res.json(notifications);
    } catch (err) {
        console.error('Get User Notifications Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Announcement deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await UserNotification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.json(notifications);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const markRead = async (req, res) => {
    try {
        const notification = await UserNotification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        return res.json(notification);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUserNotification = async (req, res) => {
    try {
        await UserNotification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        return res.json({ message: 'Deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};
