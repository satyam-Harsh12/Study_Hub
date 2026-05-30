import { AuditLog } from '../models/AuditLog.js';

export const logAction = async (userId, role, action, targetId = null, description = '', status = 'SUCCESS', req = null) => {
    try {
        if (!userId || !role || !action) return;

        let ipAddress = null;
        if (req) {
            ipAddress = req.ip || req.connection?.remoteAddress;
        }

        await AuditLog.create({
            userId,
            role,
            action,
            targetId,
            description,
            status,
            ipAddress
        });
    } catch (error) {
        console.error('Error logging audit action:', error);
    }
};
