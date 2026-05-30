
import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '../../api/adminApi';
import { Clock, BookOpen, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Activity } from 'lucide-react';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const res = await getActivityLogs(10);
            setActivities(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getIcon = (module) => {
        switch (module) {
            case 'COURSE': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'USER': return <Users className="w-4 h-4 text-purple-500" />;
            case 'PAYMENT': return <DollarSign className="w-4 h-4 text-green-500" />;
            case 'ATTENDANCE': return <Calendar className="w-4 h-4 text-orange-500" />;
            case 'ENROLLMENT': return <CheckCircle className="w-4 h-4 text-teal-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Recent Activity
                </h3>
                <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">No recent activity</div>
                ) : (
                    activities.map((log) => (
                        <div key={log._id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                    {getIcon(log.module)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {log.details}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500 font-medium">
                                            {log.user?.name || 'Unknown User'}
                                        </span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(log.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
