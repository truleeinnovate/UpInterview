// src/utils/AuthCookieManager.jsx
import Cookies from 'js-cookie';

// Function to set cookies for authentication (store JWT from backend)
export const setAuthCookies = (token) => {
  Cookies.set('authToken', token, {
    expires: 7, // Cookie expires in 7 days
    secure: true, // Use secure cookies only in production
    sameSite: 'Lax', // Allow cookies to be sent with top-level navigation
    domain: '.upinterview.io', // Set cookie for the parent domain
  });
};

// Function to clear all authentication cookies
export const clearAuthCookies = () => {
  Cookies.remove('authToken', { domain: '.upinterview.io' });
  Cookies.remove('userId', { domain: '.upinterview.io' });
  Cookies.remove('organizationId', { domain: '.upinterview.io' });
  Cookies.remove('token', { domain: '.upinterview.io' });
};

// Function to get the JWT from cookies
export const getAuthToken = () => {
  return Cookies.get('authToken') || null;
};