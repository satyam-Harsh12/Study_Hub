import { api } from './axiosInstance.js';

export const getMyEnrollments = () => api.get('/enrollments/my');
export const requestEnrollment = (courseId) => api.post('/enrollments/request', { courseId });

// Admin
export const getAllEnrollmentsAdmin = () => api.get('/enrollments/admin/all');
export const updateEnrollmentStatus = (id, status) => api.patch(`/enrollments/admin/status/${id}`, { status });
