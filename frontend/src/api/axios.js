import axios from 'axios';

// src/api/axios.js (or wherever this file is)

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL  // ✅ was: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ✅ was: JSON.parse(localStorage.getItem('user'))?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;