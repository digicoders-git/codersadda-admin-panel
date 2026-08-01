import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://coders-adda-backend.onrender.com',

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
    
    // Let the browser automatically set the correct multipart/form-data boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
