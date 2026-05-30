
import { ActivityLog } from '../models/ActivityLog.js';

export const logActivity = async (req, action, module, details, status = 'SUCCESS', relatedId = null, relatedModel = null) => {
    try {
        const user = req.user ? req.user._id : null;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!user) return; // Only log for authenticated users for now

        await ActivityLog.create({
            user,
            action,
            module,
            details,
            status,
            ipAddress,
            relatedId,
            relatedModel
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't fail the main request if logging fails
    }
};
