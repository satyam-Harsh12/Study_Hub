import { api } from './axiosInstance.js';

export const getInstructorPerformance = () => api.get('/reports/instructor/performance');
export const getStudentPerformanceReport = (courseId) => api.get('/reports/student/performance', { params: { courseId } });
