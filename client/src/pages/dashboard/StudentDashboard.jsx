import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import { getMyEnrollments } from '../../api/enrollmentApi';
import { getMyAssessmentsApi } from '../../api/assessmentApi';
import { getMyCertificates } from '../../api/certificateApi';
import { BookOpen, FileText, Award } from 'lucide-react';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    upcomingAssessments: 0,
    certificatesEarned: 0
  });
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [enrollmentsRes, assessmentsRes, certificatesRes] = await Promise.all([
          getMyEnrollments(),
          getMyAssessmentsApi(),
          getMyCertificates()
        ]);

        // Count active enrollments
        const activeEnrollments = enrollmentsRes.data.filter(
          enrollment => enrollment.status === 'active'
        ).length;

        // Count upcoming assessments
        const upcomingAssessments = assessmentsRes.data.filter(
          assessment => assessment.status === 'upcoming'
        ).length;

        // Count certificates
        const certificatesCount = certificatesRes.data.length;

        const activeList = enrollmentsRes.data.filter(e => e.status === 'active');
        setActiveEnrollments(activeList);

        setStats({
          enrolledCourses: activeList.length,
          upcomingAssessments: upcomingAssessments,
          certificatesEarned: certificatesCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">
        Student Overview
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        Continue your enrolled courses, view assessments, track progress, and manage
        payments.
      </p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400 rounded-xl p-5 shadow-md text-white group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-indigo-100 uppercase tracking-wider">Enrolled Courses</p>
            <BookOpen className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-indigo-400 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
          )}
          <p className="text-[10px] text-indigo-100 mt-2">Active enrollments</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400 rounded-xl p-5 shadow-md text-white group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-amber-100 uppercase tracking-wider">Upcoming Assessments</p>
            <FileText className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-amber-400 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.upcomingAssessments}</p>
          )}
          <p className="text-[10px] text-amber-100 mt-2">Pending submissions</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-400 rounded-xl p-5 shadow-md text-white group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-emerald-100 uppercase tracking-wider">Certificates Earned</p>
            <Award className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-emerald-400 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.certificatesEarned}</p>
          )}
          <p className="text-[10px] text-emerald-100 mt-2">Completed courses</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Continue Learning
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Recently accessed courses will appear here. Click below to view all your
                courses.
              </p>
              <Link
                to="/dashboard/student/courses"
                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 font-bold"
              >
                Go to My Courses →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Payments & Invoices
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Recent course purchases and generated invoices will be listed here.
              </p>
              <Link
                to="/dashboard/student/payments"
                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 font-bold"
              >
                View Payment History →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                My Active Courses
              </h2>
              <Link to="/dashboard/student/courses" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : stats.enrolledCourses === 0 ? (
              <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                You are not enrolled in any active courses.
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4 hover:border-indigo-200 transition-colors">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm">{enrollment.course?.title || 'Course Title'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${enrollment.progress?.percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{enrollment.progress?.percentage || 0}%</span>
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/student/course/${enrollment.course?._id}`}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


