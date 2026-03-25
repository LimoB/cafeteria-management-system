import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000/api',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- CRITICAL CHANGE HERE ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = TOKEN EXPIRED -> LOGOUT
    if (status === 401) {
      localStorage.clear();
      window.location.href = '/auth/login';
    }

    // 403 = PERMISSION DENIED -> DO NOT LOGOUT
    // Just log it so the developer knows the endpoint is restricted
    if (status === 403) {
      console.warn("403 Forbidden: You don't have permission for this resource.");
    }

    return Promise.reject(error);
  }
);

export default api;