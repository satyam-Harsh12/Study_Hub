import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentResult = () => {
  const location = useLocation();
  const state = location.state || {};
  const isSuccess = state.type === 'success';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
        <div
          className={`mx-auto mb-3 h-12 w-12 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {isSuccess ? '✓' : '✕'}
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          {isSuccess
            ? 'Your course access will now be available based on backend enrollment rules.'
            : 'Your payment did not go through. You can try again from the course page.'}
        </p>

        {isSuccess && state.data?.invoice && (
          <div className="border border-slate-200 rounded-md p-3 mb-4 text-left text-xs text-slate-600">
            <p className="font-semibold mb-1">Invoice Summary (Demo)</p>
            <p>Invoice No: {state.data.invoice.invoiceNumber}</p>
            <p>Amount: ₹{state.data.invoice.totalAmount}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard/student"
            className="flex-1 bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary-dark text-center"
          >
            Go to Student Dashboard
          </Link>
          <Link
            to="/courses"
            className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-md text-sm font-medium hover:bg-slate-50 text-center"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;


