import Cookies from 'js-cookie';

// Function to set cookies for authentication (store JWT from backend)
export const setAuthCookies = (token) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? undefined : '.upinterview.io'; // Use undefined for localhost, parent domain for production

  Cookies.set('authToken', token, {
    expires: 7, // Cookie expires in 7 days
    secure: !isLocalhost, // Use secure cookies only in production
    sameSite: 'Lax', // Allow cookies to be sent with top-level navigation
    domain, // Set domain dynamically
  });
};

// Function to clear all authentication cookies
export const clearAuthCookies = () => {
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? undefined : '.upinterview.io';

  Cookies.remove('authToken', { domain });
  Cookies.remove('userId', { domain });
  Cookies.remove('organizationId', { domain });
  Cookies.remove('token', { domain });
};

// Function to get the JWT from cookies
export const getAuthToken = () => {
  return Cookies.get('authToken') || null;
};