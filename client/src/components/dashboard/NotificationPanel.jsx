import React, { useState, useEffect } from 'react';
import { Bell, Info, Calendar } from 'lucide-react';
import { getNotifications } from '../../api/notificationApi';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await getNotifications();
                setNotifications(res.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-20 bg-slate-50 rounded-lg"></div>
                <div className="h-20 bg-slate-50 rounded-lg"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Announcements
                </h3>
                {notifications.length > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {notifications.length}
                    </span>
                )}
            </div>

            <div className="p-2 max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                    <div className="py-12 px-4 text-center ">
                        <Info className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                        <p className="text-xs text-slate-400">No new announcements today.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif._id} className="p-4 hover:bg-slate-50 transition-colors rounded-xl">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{notif.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(notif.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
