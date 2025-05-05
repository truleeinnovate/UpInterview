// src/utils/AuthCookieManager.jsx
import Cookies from 'js-cookie';

// Function to set cookies for authentication (store JWT from backend)
export const setAuthCookies = (token) => {
  Cookies.set('authToken', token, { expires: 7, secure: true, sameSite: 'Strict' });
};

// Function to clear all authentication cookies
export const clearAuthCookies = () => {
  Cookies.remove('authToken');
  Cookies.remove('userId'); // Clear legacy cookies if any
  Cookies.remove('organizationId');
  Cookies.remove('token');
};

// Function to get the JWT from cookies
export const getAuthToken = () => {
  return Cookies.get('authToken') || null;
};