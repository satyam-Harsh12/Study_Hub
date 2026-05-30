import React, { useEffect, useState } from 'react';
import { getAllEnrollmentsAdmin, updateEnrollmentStatus } from '../../api/enrollmentApi.js';
import { issueCertificateApi } from '../../api/certificateApi';
import { CheckCircle, XCircle, Clock, AlertCircle, Award } from 'lucide-react';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const res = await getAllEnrollmentsAdmin();
            setEnrollments(res.data || []);
        } catch (err) {
            setError('Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setSubmittingId(id);
        try {
            await updateEnrollmentStatus(id, status);
            fetchEnrollments();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleIssueCert = async (enrId) => {
        setSubmittingId(enrId);
        try {
            await issueCertificateApi(enrId);
            alert('Certificate issued successfully!');
            fetchEnrollments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to issue certificate; check if student completed course');
        } finally {
            setSubmittingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle size={12} /> Approved</span>;
            case 'pending': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
            case 'rejected': return <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>;
            case 'completed': return <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle size={12} /> Completed</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full w-fit capitalize">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Enrollment Management</h1>
                <p className="text-sm text-slate-500">Review and manage student enrollment requests.</p>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">Loading enrollments...</td>
                                </tr>
                            ) : enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No enrollment requests found.</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => (
                                    <tr key={enr._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{enr.student?.name}</div>
                                            <div className="text-xs text-slate-400">{enr.student?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {enr.course?.title}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(enr.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold">
                                            {getStatusBadge(enr.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {enr.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(enr._id, 'active')}
                                                            disabled={submittingId === enr._id}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(enr._id, 'rejected')}
                                                            disabled={submittingId === enr._id}
                                                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {enr.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(enr._id, 'completed')}
                                                        disabled={submittingId === enr._id}
                                                        className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                )}
                                                {enr.status === 'completed' && (
                                                    <button
                                                        onClick={() => handleIssueCert(enr._id)}
                                                        disabled={submittingId === enr._id}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <Award size={14} />
                                                        Issue Cert
                                                    </button>
                                                )}
                                                {(enr.status === 'rejected' || enr.status === 'cancelled') && (
                                                    <span className="text-xs text-slate-300 italic">No actions available</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminEnrollments;
