import React, { useEffect, useState } from 'react';
import { getMyPayments } from '../../api/paymentApi.js';

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyPayments();
        setPayments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2">
        Payments & Invoices
      </h2>
      <p className="text-sm text-slate-500 mb-3">
        View your course purchase history, statuses, and invoice references.
      </p>

      {loading && <p className="text-xs text-slate-500">Loading payments...</p>}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
        {payments.length === 0 ? (
          <p>No payment records yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2">Course</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Transaction ID</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-2">{p.course?.title || 'N/A'}</td>
                  <td className="py-2">₹{p.amount}</td>
                  <td className="py-2 capitalize">{p.status}</td>
                  <td className="py-2">{p.transactionId}</td>
                  <td className="py-2">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentPayments;


