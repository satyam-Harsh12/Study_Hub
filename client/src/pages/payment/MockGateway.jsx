import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { simulateFailure, simulateSuccess } from '../../api/paymentApi.js';

const MockGateway = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const handleResult = async (type) => {
    try {
      const fn = type === 'success' ? simulateSuccess : simulateFailure;
      const res = await fn(paymentId);
      navigate('/payment/result', { state: { type, data: res.data } });
    } catch {
      alert('Something went wrong while simulating payment.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Mock Payment Gateway
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          This is a demo payment screen. Choose whether the transaction should succeed
          or fail. No real payment is processed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleResult('success')}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
          >
            Simulate Success
          </button>
          <button
            onClick={() => handleResult('failure')}
            className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700"
          >
            Simulate Failure
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          On success, course access will be unlocked (backend-enforced). On failure,
          access remains restricted.
        </p>
      </div>
    </div>
  );
};

export default MockGateway;


