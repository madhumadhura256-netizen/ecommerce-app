import axios from 'axios';

const API = axios.create({ 
  baseURL: 'http://localhost:5000/api' // Make sure this matches your backend port
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
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