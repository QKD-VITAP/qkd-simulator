export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TOKEN_KEY: 'qkd_simulator_token',
  TOKEN_EXPIRY_MINUTES: 30
};
