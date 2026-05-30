import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseApi } from '../../api/courseApi.js';
import { requestEnrollment, getMyEnrollments } from '../../api/enrollmentApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, myEnrRes] = await Promise.all([
          getCourseApi(courseId),
          isAuthenticated && user?.role === 'student' ? getMyEnrollments() : Promise.resolve({ data: [] })
        ]);

        setCourse(courseRes.data);
        const myEnr = (myEnrRes.data || []).find(e => e.course?._id === courseId);
        if (myEnr) setEnrollmentStatus(myEnr.status);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
      return;
    }

    if (course.isPaid) {
      navigate(`/checkout/${courseId}`);
      return;
    }

    setSubmitting(true);
    try {
      await requestEnrollment(courseId);
      setEnrollmentStatus('pending');
      alert('Enrollment request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit enrollment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-sm text-slate-500">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[2fr,1.1fr] lg:px-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Course detail
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{course.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
          {course.startDate && (
            <div className="flex items-center gap-1.5">
              <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {course.endDate && (
            <div className="flex items-center gap-1.5">
              <span>End: {new Date(course.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-500">{course.description}</p>

        <h2 className="mt-6 text-sm font-semibold text-slate-700">
          Schedule & timetable
        </h2>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white">
          {(course.schedule || []).length === 0 ? (
            <p className="p-3 text-xs text-slate-500">
              Schedule will be announced soon.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-xs text-slate-600">
              {course.schedule.map((s) => (
                <li
                  key={s._id || `${s.date}-${s.startTime}`}
                  className="flex justify-between px-3 py-2"
                >
                  <span>{new Date(s.date).toLocaleDateString()}</span>
                  <span>
                    {s.startTime} - {s.endTime}
                  </span>
                  <span className="text-slate-500">{s.topic}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <h2 className="mt-5 text-sm font-semibold text-slate-700">
          Study materials & resources
        </h2>
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          {(course.materials || []).length === 0 ? (
            <p className="text-xs text-slate-500">
              Materials will be available after enrollment.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-600">
              {course.materials.map((m) => (
                <li key={m._id || m.title} className="flex justify-between">
                  <span>{m.title}</span>
                  <span className="text-slate-500">{m.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Course type
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${course.isPaid
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                  }`}
              >
                {course.isPaid ? 'Paid course' : 'Free course'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Price
            </span>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {course.isPaid ? `₹${course.price}` : 'Free'}
            </p>
          </div>
        </div>

        <button
          onClick={handleEnroll}
          disabled={submitting || (enrollmentStatus && enrollmentStatus !== 'cancelled')}
          className={`mt-2 w-full rounded-md py-2 text-sm font-medium text-white shadow-sm transition-all ${enrollmentStatus === 'active' ? 'bg-emerald-600' :
              enrollmentStatus === 'pending' ? 'bg-amber-500' :
                enrollmentStatus === 'rejected' ? 'bg-rose-500' :
                  'bg-slate-900 hover:bg-slate-800'
            }`}
        >
          {submitting ? 'Processing...' :
            enrollmentStatus === 'active' ? 'Access Course' :
              enrollmentStatus === 'pending' ? 'Request Pending' :
                enrollmentStatus === 'rejected' ? 'Request Rejected' :
                  course.isPaid ? 'Buy this course' : 'Enroll for free'}
        </button>

        <p className="mt-3 text-[11px] text-slate-500">
          Paid course access will be unlocked only after a successful mock payment. Free
          courses can be accessed immediately after enrollment.
        </p>
      </aside>
    </div>
  );
};

export default CourseDetail;


