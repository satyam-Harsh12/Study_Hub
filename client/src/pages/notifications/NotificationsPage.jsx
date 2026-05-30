import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { getUserNotifications, markNotificationRead, deleteUserNotification } from '../../api/notificationApi.js';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getUserNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        if(e) e.stopPropagation();
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id, e) => {
        if(e) e.stopPropagation();
        try {
            await deleteUserNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-slate-800">My Notifications</h2>
                   <p className="text-sm text-slate-500">Stay updated with alerts and announcements.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Bell className="w-12 h-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-700">All caught up!</h3>
                        <p className="text-sm text-slate-500">You don't have any notifications at the moment.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {notifications.map(notification => (
                            <li 
                                key={notification._id} 
                                className={`p-5 flex gap-4 transition-colors ${!notification.read ? 'bg-indigo-50/40' : 'bg-white'}`}
                            >
                                <div className={`p-3 rounded-full h-fit ${
                                    notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                    notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                    'bg-indigo-100 text-indigo-600'
                                }`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-base ${!notification.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                        {notification.message}
                                    </h4>
                                    <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1 block">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {!notification.read && (
                                        <button 
                                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                                            className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors h-fit"
                                        >
                                            <Check className="w-4 h-4" /> Read
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => handleDelete(notification._id, e)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors h-fit"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
