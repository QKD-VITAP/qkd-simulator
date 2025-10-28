// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check for environment variables first
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl;
    }
  }
  
  // Check if we're in production (not localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not localhost, assume we're in production and use the same domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:8000`;
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here',
  API_BASE_URL: getApiBaseUrl(),
  TOKEN_KEY: 'qkd_simulator_token',
  TOKEN_EXPIRY_MINUTES: 30,
  SKIP_AUTH_IN_DEV: import.meta.env.VITE_SKIP_AUTH === 'true' || 
                    (typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
};
