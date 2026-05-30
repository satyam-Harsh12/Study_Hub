import { ApprovalLog } from '../models/ApprovalLog.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { logActivity } from '../utils/logActivity.js';

export const getPendingApprovals = async (req, res) => {
    try {
        if (!req.user.role || req.user.role.name !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const approvals = await ApprovalLog.find({ status: 'PENDING' })
            .populate('requestedBy', 'name email')
            .sort({ createdAt: -1 });

        const enhancedApprovals = await Promise.all(approvals.map(async (app) => {
            let targetName = 'Unknown';
            if (app.targetModel === 'Course') {
                const course = await Course.findById(app.targetId).select('title');
                if (course) targetName = course.title;
                else targetName = 'Deleted Course';
            } else if (app.targetModel === 'User') {
                const user = await User.findById(app.targetId).select('name email');
                if (user) targetName = `${user.name} (${user.email})`;
                else targetName = 'Deleted User';
            }
            return {
                ...app.toObject(),
                targetName
            };
        }));

        res.json(enhancedApprovals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const reviewApproval = async (req, res) => {
    try {
        if (!req.user.role || req.user.role.name !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { status } = req.body; // status: 'APPROVED', 'REJECTED' (matching frontend usage)

        const approval = await ApprovalLog.findById(id);
        if (!approval) return res.status(404).json({ message: 'Approval request not found' });

        if (approval.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

        if (status === 'APPROVED') {
            if (approval.actionType === 'COURSE_CREATION') {
                await Course.findByIdAndUpdate(approval.targetId, { status: 'APPROVED', isActive: true });
                await logActivity(req, 'COURSE_APPROVED', 'COURSE', `Approved course creation`, 'SUCCESS', approval.targetId, 'Course');
            } else if (approval.actionType === 'COURSE_DELETION') {
                // Soft delete
                await Course.findByIdAndUpdate(approval.targetId, { isDeleted: true, deletedAt: new Date(), isActive: false });
                await logActivity(req, 'COURSE_DELETED', 'COURSE', `Approved course deletion (soft)`, 'SUCCESS', approval.targetId, 'Course');
            } else if (approval.actionType === 'INSTRUCTOR_HIRING') {
                await User.findByIdAndUpdate(approval.targetId, { status: 'APPROVED', isActive: true });
                await logActivity(req, 'INSTRUCTOR_APPROVED', 'USER', `Approved instructor hiring`, 'SUCCESS', approval.targetId, 'User');
            } else if (approval.actionType === 'INSTRUCTOR_REMOVAL') {
                // Soft delete
                await User.findByIdAndUpdate(approval.targetId, { isDeleted: true, deletedAt: new Date(), isActive: false });
                await logActivity(req, 'INSTRUCTOR_REMOVED', 'USER', `Approved instructor removal (soft)`, 'SUCCESS', approval.targetId, 'User');
            }

            approval.status = 'APPROVED';

            // Notify Requester
            await Notification.create({
                title: 'Request Approved',
                message: `Your request for ${approval.actionType.replace('_', ' ')} has been APPROVED by Super Admin.`,
                targetType: 'user',
                targetUser: approval.requestedBy,
                sender: req.user._id
            });

        } else if (status === 'REJECTED') {
            if (approval.actionType === 'COURSE_CREATION') {
                await Course.findByIdAndUpdate(approval.targetId, { status: 'REJECTED' });
            } else if (approval.actionType === 'COURSE_DELETION') {
                // Revert to Active (Cancel deletion)
                await Course.findByIdAndUpdate(approval.targetId, { isActive: true });
            } else if (approval.actionType === 'INSTRUCTOR_HIRING') {
                await User.findByIdAndUpdate(approval.targetId, { status: 'REJECTED' });
            } else if (approval.actionType === 'INSTRUCTOR_REMOVAL') {
                // Revert to Active
                await User.findByIdAndUpdate(approval.targetId, { isActive: true });
            }

            approval.status = 'REJECTED';

            // Notify Requester
            await Notification.create({
                title: 'Request Rejected',
                message: `Your request for ${approval.actionType.replace('_', ' ')} has been REJECTED by Super Admin.`,
                targetType: 'user',
                targetUser: approval.requestedBy,
                sender: req.user._id
            });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        approval.reviewedBy = req.user._id;
        approval.reviewedAt = new Date();
        await approval.save();

        return res.json(approval);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
