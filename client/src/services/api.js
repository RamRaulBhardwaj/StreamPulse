import axios from 'axios';

// Create base Axios instance (proxied via Vite in development)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle expired tokens
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: automatically clear expired credentials
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    const responseData = error.response && error.response.data;
    const firstFieldError =
      Array.isArray(responseData?.errors) && responseData.errors[0]?.message;
    const message =
      firstFieldError ||
      responseData?.message ||
      error.message ||
      'An unexpected network error occurred';

    const err = new Error(message);
    if (responseData) {
      err.errors = responseData.errors || [];
      err.response = error.response;
      err.data = responseData;
    }
    return Promise.reject(err);
  }
);

export default api;
