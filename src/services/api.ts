import axios from 'axios';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

console.log('🌐 API Base URL:', ENV_API_BASE_URL);

export const API_BASE_URL = ENV_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced from 10s to 5s for faster failures
});

api.interceptors.request.use(
  config => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  r => {
    console.log('📥 API Response:', r.status, r.config.url);
    return r;
  },
  err => {
    console.error('❌ API Error:', err.message);
    console.error('❌ Error details:', err.response?.data || err.message);

    // Check for session expiry (User deleted or invalid)
    if (err.response?.status === 404) {
      console.log('🔍 404 Error Detected. URL:', err.config.url);
      console.log('🔍 Response Data:', JSON.stringify(err.response.data));

      const isUserNotFound =
        err.response?.data?.message === 'User not found' ||
        err.response?.data?.error === 'User not found';

      if (isUserNotFound) {
        console.log('🚪 "User not found" matched - triggering logout handler');
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          console.warn('⚠️ onSessionExpired handler is NOT set!');
        }
      }
    }

    const msg = err?.response?.data?.message || err.message;
    return Promise.reject(new Error(msg));
  },
);

let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};
