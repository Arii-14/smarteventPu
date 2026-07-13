import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartevent_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 and not on login page, we might want to log them out or clear token
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('smartevent_token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
