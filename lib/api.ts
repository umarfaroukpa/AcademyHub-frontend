import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Store the token for reference
let currentToken: string | null = null;

const isClient = typeof window !== 'undefined';

const getLocalStorageItem = (key: string): string | null => {
    return isClient ? localStorage.getItem(key) : null;
};

const setLocalStorageItem = (key: string, value: string): void => {
    if (isClient) {
        localStorage.setItem(key, value);
    }
};

const removeLocalStorageItem = (key: string): void => {
    if (isClient) {
        localStorage.removeItem(key);
    }
};


// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    // Check included for safety, but redundant if using isClient helper
    if (!isClient) { 
      return config;
    }

    //Using safe helper
    const token = getLocalStorageItem('token') || currentToken;
    
    console.log('🔄 API Request Interceptor - Token exists:', !!token);
    console.log('🔄 API Request Interceptor - URL:', config.url);
    
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
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

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success - Status:', response.status, 'URL:', response.config.url);
    return response;
  },
  (error) => {
    
    
    // Only handle in browser environment
    if (!isClient) { // Use isClient check
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.log('🔴 401 Unauthorized - Token might be invalid or expired');
      
      
      const hadToken = getLocalStorageItem('token') || currentToken;
      
      if (hadToken) {
        console.log('🔴 Clearing invalid token and logging out');
        // Using safe helper
        removeLocalStorageItem('token');
        removeLocalStorageItem('user');
        currentToken = null;
        
        // window.location access is guarded by the outer !isClient check
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
    // Using safe helper
    setLocalStorageItem('token', token); 
    api.defaults.headers.common = api.defaults.headers.common || {};
    (api.defaults.headers.common as Record<string, string>).Authorization = `Bearer ${token}`;
    console.log('🔑 Token set in localStorage and axios defaults');
  } else {
    // Using safe helper
    removeLocalStorageItem('token'); 
    if (api.defaults.headers.common) {
      delete (api.defaults.headers.common as Record<string, string>).Authorization;
    }
    console.log('🔑 Token cleared from localStorage and axios defaults');
  }
}

export function getAuthToken(): string | null {
  // Using safe helper
  return getLocalStorageItem('token') || currentToken; 
}

export function clearAuth(): void {
  console.log('🔑 clearAuth called');
  setAuthToken();
  // Using safe helper
  removeLocalStorageItem('user');
}

export default api;