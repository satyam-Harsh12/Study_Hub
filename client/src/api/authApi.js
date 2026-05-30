import { api } from './axiosInstance.js';

export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getProfileApi = () => api.get('/auth/me');
export const sendOtpApi = (data) => api.post('/auth/send-otp', data);
export const verifyOtpApi = (data) => api.post('/auth/verify-otp', data);


