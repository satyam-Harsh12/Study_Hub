import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Payment } from '../models/Payment.js';
import { Enrollment } from '../models/Enrollment.js';
import Role from '../models/Role.js';
import { ApprovalLog } from '../models/ApprovalLog.js';
import { Notification } from '../models/Notification.js';
import { UserNotification } from '../models/UserNotification.js';
import { logActivity } from '../utils/logActivity.js';
import { logAction } from '../utils/logger.js';
import { AuditLog } from '../models/AuditLog.js';

export const listInstructors = async (req, res) => {
  try {
    const Role = mongoose.model('Role');
    const roleDoc = await Role.findOne({ name: 'instructor' });
    if (!roleDoc) return res.json([]); // No instructor role, no instructors

    const instructors = await User.find({ role: roleDoc._id, isDeleted: false })
      .select('name email isActive status createdAt')
      .sort({ createdAt: -1 });
    return res.json(instructors);
  } catch (err) {
    console.error("List Instructors Error", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const Role = mongoose.model('Role');
    const roleDoc = await Role.findOne({ name: 'instructor' });
    if (!roleDoc) {
      return res.status(500).json({ message: 'Instructor role configuration missing' });
    }

    const roleName = req.user.role?.name || req.user.role;
    const isSuperAdmin = roleName === 'super_admin';
    const status = isSuperAdmin ? 'APPROVED' : 'PENDING';
    const isActive = isSuperAdmin;

    const user = await User.create({
      name,
      email,
      password,
      role: roleDoc._id,
      status,
      isActive
    });

    if (!isSuperAdmin) {
      await ApprovalLog.create({
        actionType: 'INSTRUCTOR_HIRING',
        targetId: user._id,
        targetModel: 'User',
        requestedBy: req.user._id,
        status: 'PENDING'
      });
      await Notification.create({
        title: 'Instructor Hiring Approval Pending',
        message: `Admin ${req.user.name} requested to hire instructor "${user.name}".`,
        targetRole: 'super_admin',
        targetType: 'role',
        sender: req.user._id
      });
      return res.status(201).json({
        message: 'Instructor created and submitted for approval',
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'instructor'
      });
    }

    await logActivity(req, 'INSTRUCTOR_ADDED', 'USER', `Hired instructor ${user.name} (${user.email})`, 'SUCCESS', user._id, 'User');
    await logAction(req.user._id, roleName, 'CREATE_USER', user._id, `Created instructor ${user.email}`, 'SUCCESS', req);

    await UserNotification.create({
      userId: user._id,
      message: 'Welcome! Your instructor account has been created successfully.',
      type: 'info'
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'instructor'
    });
  } catch (err) {
    console.error("Create Instructor Error", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({ isDeleted: false })
      .populate('instructor', 'name email')
      .populate('schedule.instructor', 'name email')
      .sort({ createdAt: -1 });
    return res.json(courses);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createCourseAdmin = async (req, res) => {
  try {
    const { title, description, category, price, instructorId, isActive = true, startDate, endDate, schedule, materials } = req.body;
    if (!title || !instructorId) {
      return res.status(400).json({ message: 'Title and instructor are required' });
    }

    const instructor = await User.findById(instructorId).populate('role');
    if (!instructor || !instructor.role || instructor.role.name !== 'instructor') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    const roleName = req.user.role?.name || req.user.role;
    const isSuperAdmin = roleName === 'super_admin';
    const status = isSuperAdmin ? 'APPROVED' : 'PENDING';
    const isActiveVal = isSuperAdmin ? isActive : false;

    const course = await Course.create({
      title,
      description,
      category,
      price: price || 0,
      instructor: instructorId,
      isActive: isActiveVal,
      startDate,
      endDate,
      schedule: schedule || [],
      materials: materials || [],
      status
    });

    if (!isSuperAdmin) {
      await ApprovalLog.create({
        actionType: 'COURSE_CREATION',
        targetId: course._id,
        targetModel: 'Course',
        requestedBy: req.user._id,
        status: 'PENDING'
      });
      await Notification.create({
        title: 'Course Creation Approval Pending',
        message: `Admin ${req.user.name} requested to create course "${course.title}".`,
        targetRole: 'super_admin',
        targetType: 'role',
        sender: req.user._id
      });

      // Return populated dummy or partial
      const populated = await Course.findById(course._id).populate('instructor', 'name email');
      return res.status(201).json({ message: 'Course submitted for approval', ...populated.toObject() });
    }

    const populated = await Course.findById(course._id).populate('instructor', 'name email');

    await logActivity(req, 'COURSE_CREATED', 'COURSE', `Created course ${course.title}`, 'SUCCESS', course._id, 'Course');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Create Course Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const Role = mongoose.model('Role');
    const studentRole = await Role.findOne({ name: 'student' });
    const instructorRole = await Role.findOne({ name: 'instructor' });

    const [
      studentCount,
      instructorCount,
      courseCount,
      revenueAgg,
      revenueByMonth,
      courseStats,
      watchTimeStats
    ] = await Promise.all([
      studentRole ? User.countDocuments({ role: studentRole._id }) : 0,
      instructorRole ? User.countDocuments({ role: instructorRole._id }) : 0,
      Course.countDocuments({}),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'success' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Enrollment.aggregate([
        {
          $group: {
            _id: '$course',
            totalEnrolled: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        { $unwind: '$courseInfo' },
        {
          $project: {
            title: '$courseInfo.title',
            totalEnrolled: 1,
            completed: 1,
            successRate: {
              $multiply: [{ $divide: ['$completed', '$totalEnrolled'] }, 100]
            }
          }
        }
      ]),
      Enrollment.aggregate([
        {
          $group: {
            _id: '$course',
            totalWatchTime: { $sum: '$watchTime' }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        { $unwind: '$courseInfo' },
        {
          $project: {
            title: '$courseInfo.title',
            totalWatchTime: 1
          }
        }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return res.json({
      students: studentCount,
      instructors: instructorCount,
      courses: courseCount,
      totalRevenue,
      revenueByMonth,
      courseStats,
      watchTimeStats
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listStudentsWithEnrollments = async (req, res) => {
  try {
    const Role = mongoose.model('Role');
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) return res.json([]);

    const [students, enrollments] = await Promise.all([
      User.find({ role: studentRole._id, isDeleted: false })
        .select('name email isActive createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Enrollment.find({})
        .populate('course', 'title')
        .select('student course status progress')
        .lean()
    ]);

    const enrollmentsByStudent = enrollments.reduce((acc, enr) => {
      const key = String(enr.student);
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        courseId: enr.course?._id,
        courseTitle: enr.course?.title || 'Unknown course',
        status: enr.status,
        progress: enr.progress?.percentage || 0
      });
      return acc;
    }, {});

    const result = students.map((s) => ({
      ...s,
      enrollments: enrollmentsByStudent[String(s._id)] || []
    }));

    return res.json(result);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateCourseSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule data' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.schedule = schedule;
    await course.save();

    const updated = await Course.findById(id)
      .populate('instructor', 'name email')
      .populate('schedule.instructor', 'name email');

    return res.json(updated);
  } catch (err) {
    console.error('Update Schedule Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const roleName = req.user.role?.name || req.user.role;

    if (roleName === 'super_admin') {
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Soft Delete
      course.isDeleted = true;
      course.deletedAt = new Date();
      course.isActive = false; // Optionally hide it
      await course.save();

      // We should arguably also mark enrollments as 'cancelled' or similar, but keeping them for history might be better. 
      // If we hard deleted, we used to delete enrollments. 
      // For soft delete, we keep enrollments but maybe flag them?
      // Let's keep logic simple: course is "gone" from active views.

      await logActivity(req, 'COURSE_DELETED', 'COURSE', `Soft deleted course ${course.title}`, 'SUCCESS', course._id, 'Course');
      return res.json({ message: 'Course deleted successfully' });
    } else {
      // Admin: Submit for approval
      const course = await Course.findById(id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      course.isActive = false; // Hide it
      await course.save();

      await ApprovalLog.create({
        actionType: 'COURSE_DELETION',
        targetId: course._id,
        targetModel: 'Course',
        requestedBy: req.user._id,
        status: 'PENDING'
      });
      await Notification.create({
        title: 'Course Deletion Approval Pending',
        message: `Admin ${req.user.name} requested to delete course "${course.title}".`,
        targetRole: 'super_admin',
        targetType: 'role',
        sender: req.user._id
      });
      return res.json({ message: 'Course deletion submitted for approval' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.isActive = !course.isActive;
    await course.save();
    return res.json({ message: `Course ${course.isActive ? 'published' : 'unpublished'}` });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const roleName = req.user.role?.name || req.user.role;

    // Check if user is instructor
    const userToDelete = await User.findById(id).populate('role');
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });

    const isInstructor = userToDelete.role && userToDelete.role.name === 'instructor';

    if (roleName === 'super_admin' || !isInstructor) {
      // Super admin deletes anyone, or Admin deleting non-instructor (student)
      await User.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      });
      // We do NOT delete enrollments, so we keep history. But student can't login (isActive: false).

      await logActivity(req, 'USER_DELETED', 'USER', `Soft deleted user`, 'SUCCESS', userToDelete._id, 'User');
      await logAction(req.user._id, roleName, 'DELETE_USER', userToDelete._id, `Soft deleted user ${userToDelete.email}`, 'SUCCESS', req);
      return res.json({ message: 'User deleted successfully' });
    } else {
      // Admin deleting Instructor -> Approval
      userToDelete.isActive = false;
      await userToDelete.save();

      await ApprovalLog.create({
        actionType: 'INSTRUCTOR_REMOVAL',
        targetId: userToDelete._id,
        targetModel: 'User',
        requestedBy: req.user._id,
        status: 'PENDING'
      });
      await Notification.create({
        title: 'Instructor Removal Approval Pending',
        message: `Admin ${req.user.name} requested to remove instructor "${userToDelete.name}".`,
        targetRole: 'super_admin',
        targetType: 'role',
        sender: req.user._id
      });
      return res.json({ message: 'Instructor removal submitted for approval' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select('name email role isActive createdAt')
      .populate('role', 'name') // Populate role name from Role model
      .sort({ createdAt: -1 });

    const transformed = users.map(u => {
      // Handle case where role might be null or not populated correctly
      const roleName = u.role && u.role.name ? u.role.name : 'student';
      return {
        ...u.toObject(),
        role: roleName
      };
    });

    return res.json(transformed);
  } catch (err) {
    console.error("Get All Users Error", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // sending role name string: 'course_admin'

    // Need to find Role ID
    // We should import Role model at top if not present? 
    // But `adminController.js` doesn't import Role model yet.
    // It imports User, Course, Payment, Enrollment.
    // I need to add Role import.

    // Check allow list
    const validRoles = ['student', 'instructor', 'admin', 'super_admin', 'course_admin', 'finance_admin', 'hr_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Dynamic import to avoid messing up top level if I can, or just add it.
    // Let's assume I can add it or use mongoose model.
    const Role = mongoose.model('Role');
    const roleDoc = await Role.findOne({ name: role });

    if (!roleDoc) {
      return res.status(400).json({ message: 'Role not found in system' });
    }

    const user = await User.findByIdAndUpdate(id, { role: roleDoc._id }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const roleName = req.user.role?.name || req.user.role || 'admin';
    await logAction(req.user._id, roleName, 'ROLE_UPDATE', user._id, `Updated user role to ${role}`, 'SUCCESS', req);

    return res.json({ message: 'User role updated', user: { ...user.toObject(), role: role } });
  } catch (err) {
    console.error("Update Role Error", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    
    const roleName = req.user.role?.name || req.user.role || 'admin';
    await logAction(req.user._id, roleName, user.isActive ? 'UNBLOCK_USER' : 'BLOCK_USER', user._id, `${user.isActive ? 'Activated' : 'Deactivated'} user`, 'SUCCESS', req);
    
    return res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, action, startDate, endDate } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .populate('targetId', 'name email title')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    return res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalLogs: total
    });
  } catch (err) {
    console.error('Get Audit Logs Error:', err);
    return res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
};
