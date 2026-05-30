
import { api } from './axiosInstance.js';

// Attendance
export const getTodayAttendance = () => api.get('/attendance/today');
export const markAttendance = (data) => api.post('/attendance/mark', data);

// Leave
export const applyLeave = (data) => api.post('/attendance/leave', data);
export const getLeaveRequests = () => api.get('/attendance/leave');
export const updateLeaveStatus = (id, data) => api.put(`/attendance/leave/${id}`, data);
export const getMonthlyReport = (courseId, month, year) => api.get('/attendance/student/report', { params: { courseId, month, year } });
