

/**
 * Save user data and token to localStorage and notify all components
 * This triggers the header to update immediately without refresh
 */
export const saveUserAndNotify = (user: any, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  
  // Dispatch custom event to notify all listening components
  window.dispatchEvent(new Event('userChanged'));
};

/**
 * Clear user data and token from localStorage and notify all components
 * This triggers the header to update immediately when user logs out
 */
export const clearUserAndNotify = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // Dispatch custom event to notify all listening components
  window.dispatchEvent(new Event('userChanged'));
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get current token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken() && !!getCurrentUser();
};
