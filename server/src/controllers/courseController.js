import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApprovalLog } from '../models/ApprovalLog.js';
import { Notification } from '../models/Notification.js';
import { UserNotification } from '../models/UserNotification.js';
import { logActivity } from '../utils/logActivity.js';
import { logAction } from '../utils/logger.js';

export const listCourses = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      if (category.includes(',')) {
        filter.category = { $in: category.split(',') };
      } else {
        filter.category = category;
      }
    }
    const courses = await Course.find(filter).select('-materials').lean();
    return res.json(courses);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'instructor') {
      filter = { instructor: _id };
    } else if (role === 'student' || (req.user.role && req.user.role.name === 'student')) {
      // Find enrollments first
      const enrollments = await Enrollment.find({ student: _id, status: 'active' });
      const courseIds = enrollments.map(e => e.course);
      filter = { _id: { $in: courseIds } };
    } else if (role === 'admin' || (req.user.role && req.user.role.name === 'admin')) {
      filter = {}; // Admin sees all
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .populate('schedule.instructor', 'name email')
      .lean();

    // For instructor, maybe attach enrollment count?
    if (role === 'instructor') {
      const enhancedCourses = await Promise.all(courses.map(async (c) => {
        const count = await Enrollment.countDocuments({ course: c._id });
        return { ...c, studentCount: count };
      }));
      return res.json(enhancedCourses);
    }

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.json(course);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Example secured content endpoint (not yet used on frontend but ready)
export const getCourseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.isPaid) {
      const enrollment = await Enrollment.findOne({
        course: id,
        student: req.user._id,
        status: 'active'
      });
      if (!enrollment) {
        return res
          .status(403)
          .json({ message: 'Access denied. Please purchase this course.' });
      }
    }

    return res.json({
      materials: course.materials,
      schedule: course.schedule
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const roleName = req.user.role?.name || req.user.role;
    // Only admin or super_admin can create courses
    if (roleName !== 'admin' && roleName !== 'super_admin') {
      return res.status(403).json({ message: 'Only admins can create courses' });
    }

    const { title, description, category, price, instructor, startDate, endDate, schedule } = req.body;

    const isSuperAdmin = roleName === 'super_admin';
    const approvalStatus = isSuperAdmin ? 'APPROVED' : 'PENDING';
    const isActive = isSuperAdmin;

    const course = await Course.create({
      title,
      description,
      category,
      price,
      instructor: instructor || req.user._id,
      startDate,
      endDate,
      schedule,
      status: approvalStatus,
      isActive
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
        title: 'New Course Approval Pending',
        message: `Admin ${req.user.name} requested to create course "${course.title}".`,
        targetRole: 'super_admin',
        targetType: 'role',
        sender: req.user._id
      });
      return res.status(201).json({ message: 'Course created and submitted for approval', course });
    }

    await logActivity(req, 'COURSE_CREATED', 'COURSE', `Created course ${course.title}`, 'SUCCESS', course._id, 'Course');

    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Authorization check
    const roleName = req.user.role?.name || req.user.role;
    if (roleName !== 'admin' && roleName !== 'super_admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'price', 'isPaid', 'startDate', 'endDate', 'schedule', 'materials', 'isActive', 'instructor'];

    const isSuperAdmin = roleName === 'super_admin';

    // Handle Fee Changes
    if (updates.price !== undefined && updates.price !== course.price) {
      if (!isSuperAdmin && roleName === 'admin') {
        await ApprovalLog.create({
          actionType: 'FEE_CHANGE',
          targetId: course._id,
          targetModel: 'Course',
          changedData: { price: updates.price },
          requestedBy: req.user._id,
          status: 'PENDING'
        });
        await Notification.create({
          title: 'Fee Change Approval Pending',
          message: `Admin ${req.user.name} requested fee change for course "${course.title}".`,
          targetRole: 'super_admin',
          targetType: 'role',
          sender: req.user._id
        });
        delete updates.price; // Prevent immediate update
      }
    }

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        course[key] = updates[key];
      }
    });

    await course.save();

    await logActivity(req, 'COURSE_UPDATED', 'COURSE', `Updated course ${course.title}`, 'SUCCESS', course._id, 'Course');
    
    await logAction(req.user._id, roleName, 'UPDATE_CONTENT', course._id, `Updated course ${course.title}`, 'SUCCESS', req);

    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view students for this course' });
    }

    const enrollments = await Enrollment.find({ course: id })
      .populate('student', 'name email')
      .lean();

    return res.json(enrollments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const addLectureSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, topic, link } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course.schedule.push({ date, startTime, endTime, topic, link, instructor: req.user._id });
    await course.save();

    const enrollments = await Enrollment.find({ course: course._id, status: 'active' });
    const userNotifications = enrollments.map(e => ({
       userId: e.student,
       message: `New content added for ${course.title}: ${topic}`,
       type: 'info'
    }));
    
    if (userNotifications.length > 0) {
       await UserNotification.insertMany(userNotifications);
    }

    const roleName = req.user.role?.name || req.user.role || 'teacher';
    await logAction(req.user._id, roleName, 'CREATE_CONTENT', course._id, `Added lecture session for ${topic}`, 'SUCCESS', req);

    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const markLectureWatched = async (req, res) => {
    try {
        const { id, lectureId } = req.params; // id is courseId
        const enrollment = await Enrollment.findOne({ course: id, student: req.user._id });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

        if (!enrollment.watchedLectures.includes(lectureId)) {
            enrollment.watchedLectures.push(lectureId);
            
            // Recalculate percentage
            const course = await Course.findById(id);
            const totalLectures = course.schedule ? course.schedule.length : 0;
            enrollment.progress.completedLessons = enrollment.watchedLectures.length;
            enrollment.progress.totalLessons = totalLectures;
            enrollment.progress.percentage = totalLectures > 0 ? (enrollment.watchedLectures.length / totalLectures) * 100 : 0;

            await enrollment.save();
        }
        res.json({ message: 'Marked watched', progress: enrollment.progress });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
