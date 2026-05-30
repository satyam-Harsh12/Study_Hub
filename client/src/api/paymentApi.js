import { api } from './axiosInstance.js';

export const createPayment = (data) => api.post('/payments/create', data);
export const simulateSuccess = (paymentId) => api.post(`/payments/${paymentId}/success`);
export const simulateFailure = (paymentId) => api.post(`/payments/${paymentId}/fail`);
export const getMyPayments = () => api.get('/payments/my');


