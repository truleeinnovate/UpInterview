import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAuthToken } from './activityTracker';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authToken = Cookies.get('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // If there's a new token in the response, update the stored token
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      const cookieOptions = {
        expires: 2 / 24, // 2 hours
        sameSite: 'None', // Required for cross-origin requests
        secure: true, // Required when sameSite is 'None'
        path: '/',
      };
      
      // Don't set domain for cross-origin requests
      // This allows cookies to be sent to the backend domain
      
      Cookies.set('authToken', newToken, cookieOptions);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Update the auth header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        window.dispatchEvent(new Event('tokenRefreshFailed'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
