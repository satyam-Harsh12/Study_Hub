import { api } from './axiosInstance.js';

export const getAdminInstructors = () => api.get('/admin/instructors');
export const createAdminInstructor = (data) => api.post('/admin/instructors', data);

export const getAdminCourses = () => api.get('/admin/courses');
export const createAdminCourse = (data) => api.post('/admin/courses', data);
export const updateAdminCourse = (id, data) => api.put(`/admin/courses/${id}`, data);
export const updateCourseSchedule = (id, schedule) => api.put(`/admin/courses/${id}/schedule`, { schedule });

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminStudents = () => api.get('/admin/students');
export const getAdminUsers = () => api.get('/admin/users');


export const getAdminAnnouncements = () => api.get('/admin/announcements');
export const createAnnouncement = (data) => api.post('/admin/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`);

// New Admin Actions
export const deleteAdminCourse = (id) => api.delete(`/admin/courses/${id}`);
export const toggleCourseStatus = (id) => api.patch(`/admin/courses/${id}/status`);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/status`);

// Approvals
export const getPendingApprovals = () => api.get('/approvals/pending');
export const reviewApproval = (id, data) => api.post(`/approvals/${id}/review`, data);

// Activity Logs
export const getActivityLogs = (limit = 20) => api.get(`/activities?limit=${limit}`);
