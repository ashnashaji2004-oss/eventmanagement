import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('schoolfest_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('schoolfest_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh/', { refresh: refreshToken });
          if (res.data.access) {
            localStorage.setItem('schoolfest_access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('schoolfest_access_token');
          localStorage.removeItem('schoolfest_refresh_token');
          localStorage.removeItem('schoolfest_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
