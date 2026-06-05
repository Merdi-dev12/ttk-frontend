/**
 * Application Constants
 * Global constants used across the application
 */

export const APP_CONSTANTS = {
  // API
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER: 'user',
    THEME: 'theme'
  },

  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    NOT_FOUND: '/404'
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Please check your input and try again.'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logout successful!',
    CREATE: 'Resource created successfully!',
    UPDATE: 'Resource updated successfully!',
    DELETE: 'Resource deleted successfully!'
  }
} as const;
