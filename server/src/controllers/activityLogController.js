
import { ActivityLog } from '../models/ActivityLog.js';

export const getRecentActivities = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Only admins allow for now
        const roleName = req.user.role?.name || req.user.role;
        if (!['admin', 'super_admin'].includes(roleName)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const activities = await ActivityLog.find({})
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        return res.json(activities);
    } catch (err) {
        console.error('Error fetching activities:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
