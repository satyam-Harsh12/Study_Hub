import { api } from './axiosInstance.js';

export const getSiteConfig = () => api.get('/site');
export const updateSiteConfig = (data) => api.put('/site', data);
