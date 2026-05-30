import { Assessment } from '../models/Assessment.js';
import { Submission } from '../models/Submission.js';
import { Enrollment } from '../models/Enrollment.js';
import { UserNotification } from '../models/UserNotification.js';
import { logAction } from '../utils/logger.js';

// Instructor: Create Assessment
export const createAssessment = async (req, res) => {
  try {
    const { courseId, title, type, description, fileUrl, dueDate, maxScore, questions } = req.body;

    // Validate role (Instructor or Admin)
    // Assuming middleware handles basic role check, but we should ensure they own the course?
    // Simplified for now based on request.

    const assessment = await Assessment.create({
      course: courseId,
      title,
      type,
      description,
      fileUrl,
      dueDate,
      maxScore,
      questions,
      createdBy: req.user._id
    });

    // Notify all enrolled students
    const enrollments = await Enrollment.find({ course: courseId, status: 'active' });
    const userNotifications = enrollments.map(e => ({
       userId: e.student,
       message: `New ${type} published: ${title}`,
       type: 'info'
    }));
    if (userNotifications.length > 0) {
       await UserNotification.insertMany(userNotifications);
    }

    const roleName = req.user.role?.name || req.user.role || 'teacher';
    await logAction(req.user._id, roleName, 'CREATE_CONTENT', assessment._id, `Created assessment ${title}`, 'SUCCESS', req);

    res.status(201).json(assessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Instructor: Get their assessments (across all their courses)
export const getInstructorAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Instructor: Get submissions for a specific assessment
export const getAssessmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ assessment: id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Instructor: Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params; // Submission ID
    const { marks, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { obtainedMarks: marks, feedback, status: 'graded' },
      { new: true }
    );

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const roleName = req.user.role?.name || req.user.role || 'teacher';
    await logAction(req.user._id, roleName, 'UPDATE_STUDENT_DATA', submission.student, 'Graded submission', 'SUCCESS', req);

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public/Student: Get assessments for a specific course
export const getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await Assessment.find({ course: courseId });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Student: Submit assessment
export const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params; // Assessment ID
    const { content, answers } = req.body;

    const existingSubscription = await Submission.findOne({ assessment: id, student: req.user._id });
    if (existingSubscription) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    const submission = await Submission.create({
      assessment: id,
      student: req.user._id,
      content,
      answers,
      status: 'submitted'
    });

    const roleName = req.user.role?.name || req.user.role || 'student';
    await logAction(req.user._id, roleName, 'SUBMIT_DATA', submission._id, `Submitted assessment`, 'SUCCESS', req);

    res.status(201).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student: Get my assessments (All courses) - merged with submissions
export const getMyAssessments = async (req, res) => {
  try {
    // 1. Find enrolled courses
    const enrollments = await Enrollment.find({ student: req.user._id, status: 'active' });
    const courseIds = enrollments.map(e => e.course);

    // 2. Find assessments for these courses
    const assessments = await Assessment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();

    // 3. Find my submissions
    const submissions = await Submission.find({ student: req.user._id }).lean();
    const submissionMap = new Map(submissions.map(s => [s.assessment.toString(), s]));

    // 4. Merge
    const result = assessments.map(a => {
      const sub = submissionMap.get(a._id.toString());
      return {
        ...a,
        submission: sub || null,
        status: sub ? sub.status : 'upcoming'
      };
    });

    return res.json(result);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' });
  }
};


