import { api } from './axiosInstance.js';

export const getNotifications = () => api.get('/notifications');
export const getUserNotifications = () => api.get('/notifications/user');
export const markNotificationRead = (id) => api.patch(`/notifications/user/${id}/read`);
export const deleteUserNotification = (id) => api.delete(`/notifications/user/${id}`);
