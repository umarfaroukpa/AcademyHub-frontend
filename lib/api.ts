import axios from 'axios';


const api = axios.create({ 
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api' });

//adding auth token request automatically to headers
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

//auth token request interceptor
export function setAuthToken(token?: string) {
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
else delete api.defaults.headers.common['Authorization'];
}


export default api;