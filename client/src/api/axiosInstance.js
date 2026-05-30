import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const DEFAULT_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5100/api';

// Base instance for plain JS modules
export const api = axios.create({
  baseURL: DEFAULT_API_URL
});

// Attach token from localStorage (since hooks aren't available here)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or invalid token. Redirecting to login...');
      localStorage.removeItem('tms_token');
      localStorage.removeItem('tms_user');
      // Force redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Optional React hook wrapper if you need auth inside components
export const useApi = () => {
  const { token } = useAuth();

  const instance = axios.create({
    baseURL: DEFAULT_API_URL
  });

  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};


