import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertTriangle, User, BookOpen } from 'lucide-react';
import { getPendingApprovals, reviewApproval } from '../../api/adminApi';

const AdminApprovals = () => {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        try {
            const res = await getPendingApprovals();
            setApprovals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        setProcessing(id);
        try {
            await reviewApproval(id, { action, reason: action === 'REJECT' ? 'Admin decision' : '' });
            setMessage({ type: 'success', text: `Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}` });
            fetchApprovals();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to process request' });
        } finally {
            setProcessing(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Pending Approvals</h1>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                    {approvals.length} Pending
                </span>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {approvals.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Check className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No pending approvals found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {approvals.map(app => (
                            <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${app.actionType.includes('DELETION') || app.actionType.includes('REMOVAL') ? 'bg-rose-100 text-rose-700' :
                                                app.actionType.includes('FEE') ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {app.actionType.replace('_', ' ')}
                                        </span>
                                        <span className="text-slate-400 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {app.targetName}
                                    </h3>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Requested by: <span className="font-medium text-slate-700">{app.requestedBy?.name || 'Unknown'}</span>
                                    </div>
                                    {app.changedData && app.changedData.price && (
                                        <div className="bg-slate-100 p-2 rounded-lg text-sm inline-block">
                                            New Price: <strong>${app.changedData.price}</strong>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleReview(app._id, 'APPROVE')}
                                        disabled={processing === app._id}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-emerald-200 shadow-sm"
                                    >
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReview(app._id, 'REJECT')}
                                        disabled={processing === app._id}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 font-medium"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApprovals;
