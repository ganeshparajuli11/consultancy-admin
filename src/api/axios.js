// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// these are the only routes that must work *without* a token
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/admin/login',
  '/auth/refresh',
];

api.interceptors.request.use(config => {
  const url = config.url || '';

  // 1) if this request is for login/refresh, let it go through
  if (PUBLIC_PATHS.some(path => url.includes(path))) {
    return config;
  }

  // 2) otherwise, check for token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // redirect to login if no token
    window.location.href = '/admin/login';
    // cancel the axios request so it doesn’t hang
    return Promise.reject(new axios.Cancel('No access token'));
  }

  // 3) inject the header
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export default api;
