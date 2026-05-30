import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Assessment } from '../models/Assessment.js';
import { Submission } from '../models/Submission.js';
import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';

export const getInstructorPerformance = async (req, res) => {
    try {
        const instructorId = req.user._id;

        // 1. Get Courses
        const courses = await Course.find({ instructor: instructorId }).select('_id title');
        const courseIds = courses.map(c => c._id);

        // 2. Progress Distribution (Bucket)
        // Ranges: 0-25, 25-50, 50-75, 75-100
        const progressBuckets = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, status: { $in: ['active', 'completed'] } } },
            {
                $bucket: {
                    groupBy: "$progress.percentage",
                    boundaries: [0, 26, 51, 76, 101], // 0-25, 26-50, 51-75, 76-100
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Map buckets to labels
        const distribution = [
            { name: '0-25%', value: 0 },
            { name: '26-50%', value: 0 },
            { name: '51-75%', value: 0 },
            { name: '76-100%', value: 0 }
        ];

        progressBuckets.forEach(b => {
            if (b._id === 0) distribution[0].value = b.count;
            if (b._id === 26) distribution[1].value = b.count;
            if (b._id === 51) distribution[2].value = b.count;
            if (b._id === 76) distribution[3].value = b.count;
        });

        // 3. Assessment Stats
        const assessmentStats = await Submission.aggregate([
            {
                $lookup: {
                    from: 'assessments',
                    localField: 'assessment',
                    foreignField: '_id',
                    as: 'assessmentInfo'
                }
            },
            { $unwind: '$assessmentInfo' },
            {
                $match: { 'assessmentInfo.course': { $in: courseIds }, status: 'graded' }
            },
            {
                $project: {
                    obtainedMarks: 1,
                    maxScore: '$assessmentInfo.maxScore',
                    percentage: {
                        $cond: [
                            { $eq: ['$assessmentInfo.maxScore', 0] },
                            0,
                            { $multiply: [{ $divide: ['$obtainedMarks', '$assessmentInfo.maxScore'] }, 100] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$percentage' },
                    totalSubmissions: { $sum: 1 },
                    passed: { $sum: { $cond: [{ $gte: ['$percentage', 40] }, 1, 0] } } // Assuming 40% is pass
                }
            }
        ]);

        const assessmentData = assessmentStats[0] || { avgScore: 0, totalSubmissions: 0, passed: 0 };

        // 4. Attendance Summary (Instructor's Own)
        // Since we don't have student attendance model, providing Instructor's own attendance visualization
        const attendanceStats = await Attendance.aggregate([
            { $match: { instructor: instructorId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const attendanceData = [
            { name: 'Present', value: 0, color: '#10b981' },
            { name: 'Absent', value: 0, color: '#ef4444' },
            { name: 'Leave', value: 0, color: '#f59e0b' }
        ];

        attendanceStats.forEach(stat => {
            const idx = attendanceData.findIndex(d => d.name === stat._id);
            if (idx !== -1) attendanceData[idx].value = stat.count;
        });

        const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } }).then(ids => ids.length);

        return res.json({
            distribution,
            assessment: {
                avg: Math.round(assessmentData.avgScore || 0),
                passRate: assessmentData.totalSubmissions > 0
                    ? Math.round((assessmentData.passed / assessmentData.totalSubmissions) * 100)
                    : 0,
                total: assessmentData.totalSubmissions
            },
            attendance: attendanceData,
            overview: {
                totalStudents,
                totalCourses: courses.length
            }
        });

    } catch (err) {
        console.error('Report Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStudentPerformanceReport = async (req, res) => {
    try {
        const { courseId } = req.query;
        let matchQuery = { status: { $in: ['active', 'completed'] } };
        if (courseId) {
            matchQuery.course = courseId;
        }

        const enrollments = await Enrollment.find(matchQuery)
            .populate('student', 'name email')
            .populate('course', 'title');

        const studentIds = enrollments.map(e => e.student?._id);

        const submissions = await Submission.find({ student: { $in: studentIds } }).populate('assessment');
        
        const report = enrollments.map(enrol => {
            const studentSubs = submissions.filter(s => s.student.toString() === enrol.student?._id?.toString());
            let totalMax = 0;
            let totalObtained = 0;
            studentSubs.forEach(s => {
                if(s.assessment && s.obtainedMarks != null) {
                    totalMax += s.assessment.maxScore || 100;
                    totalObtained += s.obtainedMarks;
                }
            });

            return {
                student: enrol.student?.name,
                email: enrol.student?.email,
                course: enrol.course?.title,
                progress: enrol.progress?.percentage || 0,
                grade: totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0,
                submissionsCount: studentSubs.length
            };
        });

        return res.json(report);
    } catch (err) {
        console.error('Performance Report Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const generateBatchResult = async (req, res) => {
    try {
        const { courseId } = req.body; // or batchId later

        const enrollments = await Enrollment.find({ course: courseId, status: { $in: ['active', 'completed'] } })
            .populate('student', 'name email');

        const course = await Course.findById(courseId);
        const studentIds = enrollments.map(e => e.student?._id);
        const submissions = await Submission.find({ student: { $in: studentIds } }).populate('assessment');

        const results = enrollments.map(enrol => {
            const studentSubs = submissions.filter(s => s.student.toString() === enrol.student?._id?.toString());
            let totalMax = 0;
            let totalObtained = 0;

            studentSubs.forEach(s => {
                if (s.assessment && s.obtainedMarks != null) {
                    totalMax += s.assessment.maxScore || 100;
                    totalObtained += s.obtainedMarks;
                }
            });

            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            return {
                studentId: enrol.student?._id,
                name: enrol.student?.name,
                email: enrol.student?.email,
                courseName: course?.title,
                totalMax,
                totalObtained,
                percentage: parseFloat(percentage.toFixed(2)),
                grade
            };
        });

        // Store this historically if needed, or just return JSON array.
        return res.json({ message: 'Result generated successfully', results });
    } catch (err) {
        console.error('Generate Result Error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

