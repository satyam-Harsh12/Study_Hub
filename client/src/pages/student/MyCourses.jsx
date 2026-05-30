import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCoursesApi } from '../../api/courseApi.js';

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  completed: 'bg-sky-50 text-sky-700 ring-sky-100',
  cancelled: 'bg-red-50 text-red-700 ring-red-100'
};

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyCoursesApi();
        setEnrollments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getNextSession = (course) => {
    if (!course?.schedule || course.schedule.length === 0) return null;
    const upcoming = course.schedule
      .map((s) => ({ ...s, dateObj: new Date(s.date) }))
      .filter((s) => !Number.isNaN(s.dateObj.getTime()))
      .sort((a, b) => a.dateObj - b.dateObj)[0];
    return upcoming || null;
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">My Courses</h2>
      <p className="mb-3 text-sm text-slate-500">
        Continue your enrolled trainings, track your progress, and view upcoming
        sessions.
      </p>

      {loading && <p className="text-xs text-slate-500">Loading your courses...</p>}
      {error && (
        <p className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {enrollments.map((enrollment) => {
          const { course } = enrollment;
          if (!course) return null;

          const status = enrollment.status || 'pending';
          const statusClass =
            statusStyles[status] || 'bg-slate-50 text-slate-700 ring-slate-100';

          const total = enrollment.progress?.totalLessons || 0;
          const completed = enrollment.progress?.completedLessons || 0;
          const percentage =
            total > 0
              ? Math.round((completed / total) * 100)
              : enrollment.progress?.percentage || 0;

          const nextSession = getNextSession(course);

          return (
            <div
              key={enrollment._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {course.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Progress</span>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                    <span>{percentage}%</span>
                  </div>

                  {nextSession && (
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-700">Next session:</span>
                      <span>
                        {nextSession.dateObj.toLocaleDateString()} • {nextSession.startTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ring-1 ${statusClass}`}
                >
                  {status}
                </span>
                <Link
                  to={status === 'active' ? `/courses/${course._id}/content` : `/courses/${course._id}`}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all ${status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                >
                  {status === 'active' ? 'Go to Course' : 'View Details'}
                </Link>
                <Link
                  to="/dashboard/student/assessments"
                  className="text-[11px] text-sky-700 hover:text-sky-800"
                >
                  Go to assessments →
                </Link>
              </div>
            </div>
          );
        })}

        {!loading && !error && enrollments.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            You are not enrolled in any courses yet. Browse the{' '}
            <Link to="/courses" className="font-medium text-sky-700 hover:text-sky-800">
              course catalog
            </Link>{' '}
            to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyCourses;


