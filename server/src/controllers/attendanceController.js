
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { logActivity } from '../utils/logActivity.js';

// --- Attendance ---

export const getTodayStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // For instructor requesting their own specific status
        if (req.user.role?.name === 'instructor') {
            const att = await Attendance.findOne({
                instructor: req.user._id,
                date: today
            });
            return res.json(att || { status: 'Not Marked' });
        }

        // For admin: get all instructors
        // Allow super_admin and any admin role with attendance access
        // Ideally we check permission: attendance.manage or attendance.view
        // But for dashboard summary, let's allow 'super_admin' or 'admin' or any custom admin
        const roleName = req.user.role?.name || '';
        if (roleName === 'admin' || roleName === 'super_admin' || roleName.includes('admin')) {
            // We need to fetch instructors. Instructors have role 'instructor'.
            // We need to find the Role ID for 'instructor' first.
            const Role = mongoose.model('Role');
            const instructorRole = await Role.findOne({ name: 'instructor' });

            let instructors = [];
            if (instructorRole) {
                instructors = await User.find({ role: instructorRole._id, isActive: true });
            }

            const attendanceRecords = await Attendance.find({ date: today });

            const result = instructors.map(inst => {
                const record = attendanceRecords.find(a => a.instructor.toString() === inst._id.toString());
                return {
                    instructor: { _id: inst._id, name: inst.name, email: inst.email },
                    status: record ? record.status : 'Not Marked',
                    type: record ? record.type : null,
                    hours: record ? record.hours : [],
                    recordId: record ? record._id : null
                };
            });
            return res.json(result);
        }

        return res.status(403).json({ message: 'Unauthorized' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { status, type, hours } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Rule: Self-marking only before 9 AM
        if (req.user.role === 'instructor') {
            const now = new Date();
            // Check if it's past 9 AM
            if (now.getHours() >= 9) {
                return res.status(400).json({ message: 'It is past 9:00 AM. Attendance is locked.' });
            }
            if (status !== 'Present') {
                return res.status(400).json({ message: 'You can only mark yourself Present.' });
            }

            const existing = await Attendance.findOne({ instructor: req.user._id, date: today });
            if (existing) {
                return res.status(400).json({ message: 'Attendance already marked.' });
            }

            const att = await Attendance.create({
                instructor: req.user._id,
                date: today,
                status: 'Present',
                type: 'Full Day',
                markedBy: 'Self'
            });
            await logActivity(req, 'ATTENDANCE_MARKED', 'ATTENDANCE', 'Instructor marked self as present', 'SUCCESS', att._id, 'Attendance');
            return res.json(att);
        }

        // Admin update
        if (req.user.role === 'admin') {
            const { instructorId } = req.body;
            // Upsert
            const att = await Attendance.findOneAndUpdate(
                { instructor: instructorId, date: today },
                {
                    status,
                    type,
                    hours: hours || [],
                    markedBy: 'Admin'
                },
                { new: true, upsert: true }
            );
            await logActivity(req, 'ATTENDANCE_UPDATED', 'ATTENDANCE', `Admin updated attendance`, 'SUCCESS', att._id, 'Attendance');
            return res.json(att);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// --- Leave Requests ---

export const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, leaveType, hours, reason } = req.body;

        const request = await LeaveRequest.create({
            instructor: req.user._id,
            startDate,
            endDate,
            leaveType,
            hours,
            reason
        });

        // Notify Admins
        const Role = mongoose.model('Role');
        // Find admin-like roles
        const adminRoles = await Role.find({ name: { $in: ['admin', 'super_admin', 'hr_admin'] } });
        const adminRoleIds = adminRoles.map(r => r._id);

        const admins = await User.find({ role: { $in: adminRoleIds } });
        // We could create notifications for each admin here
        // (Simplified: assuming just log or single notification record target='role' admin)

        return res.status(201).json(request);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getLeaveRequests = async (req, res) => {
    try {
        const roleName = req.user.role?.name || '';

        if (roleName === 'admin' || roleName === 'super_admin' || roleName.includes('admin')) {
            const requests = await LeaveRequest.find()
                .populate('instructor', 'name email')
                .sort({ createdAt: -1 });
            return res.json(requests);
        }

        if (roleName === 'instructor') {
            const requests = await LeaveRequest.find({ instructor: req.user._id })
                .sort({ createdAt: -1 });
            return res.json(requests);
        }

        return res.status(403).json({ message: 'Unauthorized' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params; // request ID
        const { status, adminComment } = req.body; // Approved / Rejected

        const request = await LeaveRequest.findById(id).populate('instructor');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        request.adminComment = adminComment;
        request.reviewedBy = req.user._id;
        await request.save();

        if (status === 'Approved') {
            // 1. Auto-mark attendance if strictly for today/future? 
            // The logic might be complex if it spans multiple days.
            // For simplicity, let's create Attendance records for the range.

            const start = new Date(request.startDate);
            const end = new Date(request.endDate);
            // Loop through dates
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                d.setHours(0, 0, 0, 0);
                await Attendance.findOneAndUpdate(
                    { instructor: request.instructor._id, date: d },
                    {
                        status: 'Leave',
                        type: request.leaveType,
                        hours: request.hours,
                        markedBy: 'System', // approved request
                        remarks: `Leave Approved: ${request.leaveType}`
                    },
                    { upsert: true }
                );
            }

            // 2. Notify Students of that instructor's active batches
            // Find courses taught by instructor
            const courses = await Course.find({
                instructor: request.instructor._id,
                isActive: true
            });

            // For each course, find enrollments -> notify students
            // Or use Notification target='course' and let frontend/backend logic handle distribution?
            // The Notification schema supports targetCourse. 
            // Let's create one notification per course.

            for (const course of courses) {
                await Notification.create({
                    title: 'Instructor on Leave',
                    message: `${request.instructor.name} is on leave from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}. Check schedule for updates.`,
                    targetType: 'course',
                    targetCourse: course._id,
                    sender: req.user._id
                });
            }
        }

        if (request.status === 'Approved') {
            await logActivity(req, 'LEAVE_APPROVED', 'ATTENDANCE', `Leave approved for ${request.instructor.name}`, 'SUCCESS', request._id, 'LeaveRequest');
        } else {
            await logActivity(req, 'LEAVE_REJECTED', 'ATTENDANCE', `Leave rejected for ${request.instructor.name}`, 'SUCCESS', request._id, 'LeaveRequest');
        }

        return res.json(request);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// --- Student Attendance & Real-World Features ---
import { logAction } from '../utils/logger.js';
import { UserNotification } from '../models/UserNotification.js';

const decideStatus = (checkInDate) => {
    if (!checkInDate) return 'Absent';
    const date = new Date(checkInDate);
    const time = date.getHours() * 60 + date.getMinutes();
    
    // 9:15 AM = 555 mins, 9:30 AM = 570 mins
    if (time <= 555) return 'Present';
    if (time <= 570) return 'Late';
    return 'Absent';
};

const notifyLowAttendance = async (studentId, courseId, req) => {
    const total = await Attendance.countDocuments({ student: studentId, course: courseId });
    const presentCount = await Attendance.countDocuments({ student: studentId, course: courseId, status: { $in: ['Present', 'Late'] } });
    
    if (total > 5) {
        const percentage = (presentCount / total) * 100;
        if (percentage < 75) {
            await UserNotification.create({
                userId: studentId,
                message: `Warning: Your attendance is currently ${percentage.toFixed(1)}%. Please maintain regular attendance to avoid penalties.`,
                type: 'warning'
            });
        }
    }
};

export const markStudentAttendance = async (req, res) => {
    try {
        const { studentId, courseId, status, checkInTime, checkOutTime, date } = req.body;
        const targetDate = new Date(date || Date.now());
        targetDate.setHours(0, 0, 0, 0);

        const now = new Date();
        if (Math.abs(now - targetDate) / 36e5 > 24) {
            return res.status(400).json({ message: 'Attendance records are locked after 24 hours.' });
        }

        const calculatedStatus = status || decideStatus(checkInTime);

        const att = await Attendance.findOneAndUpdate(
            { student: studentId, course: courseId, date: targetDate },
            { status: calculatedStatus, checkInTime, checkOutTime, markedBy: 'Admin' },
            { new: true, upsert: true }
        );

        if (calculatedStatus === 'Absent') {
            await UserNotification.create({
                userId: studentId,
                message: `Alert: You have been marked absent for today's session.`,
                type: 'alert'
            });
        }

        await notifyLowAttendance(studentId, courseId, req);

        const roleName = req.user.role?.name || req.user.role || 'teacher';
        await logAction(req.user._id, roleName, 'MARK_ATTENDANCE', studentId, `Marked attendance for course ${courseId}`, 'SUCCESS', req);

        return res.json(att);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const markBulkStudentAttendance = async (req, res) => {
    try {
        const { courseId, date, students } = req.body;
        if (!courseId || !students || !Array.isArray(students)) {
             return res.status(400).json({ message: 'Invalid data' });
        }

        const targetDate = new Date(date || Date.now());
        targetDate.setHours(0, 0, 0, 0);

        const now = new Date();
        if (Math.abs(now - targetDate) / 36e5 > 24) {
            return res.status(400).json({ message: 'Attendance records locked after 24 hours.' });
        }

        const ops = students.map(student => {
            const calculatedStatus = student.status || decideStatus(student.checkInTime || now);
            return {
                updateOne: {
                    filter: { student: student.id, course: courseId, date: targetDate },
                    update: { $set: { status: calculatedStatus, checkInTime: student.checkInTime || now, markedBy: 'Admin' } },
                    upsert: true
                }
            };
        });

        await Attendance.bulkWrite(ops);

        const roleName = req.user.role?.name || req.user.role || 'teacher';
        await logAction(req.user._id, roleName, 'BULK_ATTENDANCE', null, `Bulk marked attendance for course ${courseId}`, 'SUCCESS', req);

        return res.json({ message: `Bulk marked attendance for ${students.length} students` });
    } catch (err) {
        return res.status(500).json({ message: 'Server error bulk marking' });
    }
};

export const getStudentAttendanceStats = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const total = await Attendance.countDocuments({ student: studentId, course: courseId });
        const presentCount = await Attendance.countDocuments({ student: studentId, course: courseId, status: { $in: ['Present', 'Late'] } });
        
        let overallPercentage = 0;
        if (total > 0) overallPercentage = (presentCount / total) * 100;

        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyTotal = await Attendance.countDocuments({ student: studentId, course: courseId, date: { $gte: currentMonthStart } });
        const monthlyPresent = await Attendance.countDocuments({ student: studentId, course: courseId, date: { $gte: currentMonthStart }, status: { $in: ['Present', 'Late'] } });
        
        let monthlyPercentage = 0;
        if (monthlyTotal > 0) monthlyPercentage = (monthlyPresent / monthlyTotal) * 100;

        const records = await Attendance.find({ student: studentId, course: courseId }).sort({ date: -1 });

        return res.json({
            overallPercentage: overallPercentage.toFixed(1),
            monthlyPercentage: monthlyPercentage.toFixed(1),
            total,
            presentCount,
            records
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error getting student stats' });
    }
};

export const getMonthlyReport = async (req, res) => {
    try {
        const { courseId, month, year } = req.query; 
        
        const m = parseInt(month) - 1;
        const y = parseInt(year);
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0);

        const attendanceData = await Attendance.find({
            course: courseId,
            date: { $gte: start, $lte: end }
        }).populate('student', 'name email').lean();

        return res.json({
            month,
            year,
            courseId,
            data: attendanceData
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error generating report' });
    }
};
