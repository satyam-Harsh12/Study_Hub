import { api } from './axiosInstance.js';

export const getMyAssessmentsApi = () => api.get('/assessments/my');
export const createAssessmentApi = (data) => api.post('/assessments', data);
export const getInstructorAssessmentsApi = () => api.get('/assessments/instructor');
export const getAssessmentSubmissionsApi = (id) => api.get(`/assessments/${id}/submissions`);
export const submitAssessmentApi = (id, data) => api.post(`/assessments/${id}/submit`, data);
export const gradeSubmissionApi = (id, data) => api.put(`/assessments/submissions/${id}/grade`, data);


