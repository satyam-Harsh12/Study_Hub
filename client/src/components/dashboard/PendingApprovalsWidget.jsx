
import React, { useEffect, useState } from 'react';
import { getPendingApprovals, reviewApproval } from '../../api/adminApi';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const PendingApprovalsWidget = () => {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadApprovals = async () => {
        try {
            const res = await getPendingApprovals();
            setApprovals(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
        const interval = setInterval(loadApprovals, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleReview = async (id, status) => {
        try {
            await reviewApproval(id, { status });
            setApprovals(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader className="w-5 h-5 animate-spin text-indigo-600" /></div>;
    if (approvals.length === 0) return null; // Don't show if empty

    return (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4 text-amber-800">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">Pending Approvals Needed</h3>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">{approvals.length}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approvals.map((req) => (
                    <div key={req._id} className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-white px-1.5 py-0.5 rounded border border-amber-100">
                                {req.actionType.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            Request by {req.requestedBy?.name || 'Unknown'} for {req.targetModel}
                        </p>

                        <div className="mt-auto flex gap-2">
                            <button
                                onClick={() => handleReview(req._id, 'APPROVED')}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                            >
                                <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                            <button
                                onClick={() => handleReview(req._id, 'REJECTED')}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            >
                                <XCircle className="w-3 h-3" /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingApprovalsWidget;
