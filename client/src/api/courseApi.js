import { api } from './axiosInstance.js';

export const listCoursesApi = (params) => api.get('/courses', { params });
export const getCourseApi = (id) => api.get(`/courses/${id}`);
export const getCourseContentApi = (id) => api.get(`/courses/${id}/content`);
export const getMyCoursesApi = () => api.get('/courses/my');
export const updateCourseApi = (id, data) => api.put(`/courses/${id}`, data);
export const getCourseStudentsApi = (id) => api.get(`/courses/${id}/students`);
export const addLectureSessionApi = (id, data) => api.post(`/courses/${id}/schedule`, data);


