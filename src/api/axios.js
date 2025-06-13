import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalReq = err.config;

    // 1) if it’s already the refresh endpoint, give up
    if (originalReq.url?.includes('/auth/refresh')) {
      return Promise.reject(err);
    }

    // 2) only retry once on 401
    if (err.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        // 3) hit the correct refresh path
        const { data } = await api.get('/auth/refresh');

        // 4) persist and apply the new token
        localStorage.setItem('accessToken', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        originalReq.headers['Authorization']    = `Bearer ${data.token}`;

        // 5) retry original request
        return api(originalReq);
      } catch (refreshError) {
        // 6) if refresh fails → force full login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
