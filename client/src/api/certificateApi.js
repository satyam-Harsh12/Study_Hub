import { api } from './axiosInstance.js';

export const getMyCertificates = () => api.get('/certificates/my');
export const getCertificateById = (id) => api.get(`/certificates/${id}`);
export const issueCertificateApi = (enrollmentId) => api.post('/certificates/issue', { enrollmentId });
