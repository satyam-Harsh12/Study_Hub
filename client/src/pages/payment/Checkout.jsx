import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseApi } from '../../api/courseApi.js';
import { createPayment } from '../../api/paymentApi.js';

const Checkout = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseApi(courseId);
        setCourse(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleCheckout = async () => {
    if (!course?.isPaid) {
      alert('This course is free. Payment is not required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await createPayment({ courseId });
      const { paymentId } = res.data;
      navigate(`/payment/mock/${paymentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-slate-500">Loading checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Checkout</h1>
        <p className="text-sm text-slate-500 mb-4">
          Confirm your purchase and proceed to the demo payment gateway.
        </p>

        <div className="border border-slate-200 rounded-md p-4 mb-4">
          <p className="text-sm font-semibold text-slate-800 mb-1">{course.title}</p>
          <p className="text-xs text-slate-500 mb-2">{course.description}</p>
          <p className="text-xs text-slate-500 mb-1">
            Category: {course.category || 'General'}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            Amount: {course.isPaid ? `₹${course.price}` : 'Free'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 text-xs text-slate-600">
          <p className="font-semibold mb-1">Demo Payment Notice</p>
          <p>
            This project uses a mock payment gateway. No real money is charged. You
            will be able to simulate both successful and failed transactions on the next
            screen.
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Redirecting to Mock Gateway...' : 'Proceed to Mock Payment'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;


