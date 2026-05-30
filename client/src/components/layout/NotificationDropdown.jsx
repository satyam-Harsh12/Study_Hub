import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { getUserNotifications, markNotificationRead, deleteUserNotification } from '../../api/notificationApi.js';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Setup polling every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getUserNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
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

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 ring-1 ring-black/5 max-h-96 flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-500">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100/50">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification._id} 
                                        className={`p-4 flex gap-3 group transition-colors cursor-pointer ${!notification.read ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                                        onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                                    >
                                        <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                                            notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                            notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                            'bg-indigo-100 text-indigo-600'
                                        }`}>
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button onClick={(e) => handleMarkAsRead(notification._id, e)} className="text-primary hover:text-primary-dark" title="Mark Read">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={(e) => handleDelete(notification._id, e)} className="text-slate-400 hover:text-red-600" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
