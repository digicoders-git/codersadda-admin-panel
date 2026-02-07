import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API token
http.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('admin-token');
    const instructorToken = localStorage.getItem('instructor-token');
    const token = adminToken || instructorToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., logout user)
      // localStorage.removeItem('admin-token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
