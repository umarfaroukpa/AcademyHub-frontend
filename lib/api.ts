import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Store the token for reference
let currentToken: string | null = null;

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return config;
    }

    // Get token from localStorage or use current token
    const token = localStorage.getItem('token') || currentToken;
    
    console.log('🔄 API Request Interceptor - Token exists:', !!token);
    console.log('🔄 API Request Interceptor - URL:', config.url);
    
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔄 API Request Interceptor - Added Authorization header');
    } else {
      console.log('🔄 API Request Interceptor - No token available');
    }
    
    return config;
  },
  (error) => {
    console.error('🔴 API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Handle token expiration - but don't logout immediately
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success - Status:', response.status, 'URL:', response.config.url);
    return response;
  },
  (error) => {
    console.error('🔴 API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.error,
      hasToken: !!(localStorage.getItem('token') || currentToken)
    });

    // Only handle in browser environment
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.log('🔴 401 Unauthorized - Token might be invalid or expired');
      
      // Only logout if we actually had a token
      const hadToken = localStorage.getItem('token') || currentToken;
      
      if (hadToken) {
        console.log('🔴 Clearing invalid token and logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentToken = null;
        
        // Use replace instead of href to avoid full page reload issues
        if (window.location.pathname !== '/') {
          setTimeout(() => {
            window.location.replace('/');
          }, 1000);
        }
      } else {
        console.log('🔴 401 received but no token was set - this might be a backend issue');
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth token management
export function setAuthToken(token?: string): void {
  console.log('🔑 setAuthToken called with token:', !!token);
  currentToken = token || null;
  
  if (token) {
    localStorage.setItem('token', token);
    // Ensure headers object exists before setting authorization
    api.defaults.headers.common = api.defaults.headers.common || {};
    (api.defaults.headers.common as Record<string, string>).Authorization = `Bearer ${token}`;
    console.log('🔑 Token set in localStorage and axios defaults');
  } else {
    localStorage.removeItem('token');
    if (api.defaults.headers.common) {
      delete (api.defaults.headers.common as Record<string, string>).Authorization;
    }
    console.log('🔑 Token cleared from localStorage and axios defaults');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token') || currentToken;
}

export function clearAuth(): void {
  console.log('🔑 clearAuth called');
  setAuthToken();
  localStorage.removeItem('user');
}

export default api;