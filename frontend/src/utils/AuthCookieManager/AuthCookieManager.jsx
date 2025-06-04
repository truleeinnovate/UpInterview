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

// // Function to clear all authentication cookies
// export const clearAuthCookies = () => {
//   const isLocalhost = window.location.hostname === 'localhost';
//   const domain = isLocalhost ? undefined : '.upinterview.io';

//   Cookies.remove('authToken', { domain });
//   Cookies.remove('userId', { domain });
//   Cookies.remove('organizationId', { domain });
//   Cookies.remove('token', { domain });
// };

export const clearAllCookies = () => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    // Remove for current path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    // Remove for root domain (if any)
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
  }
};

// Function to get the JWT from cookies
export const getAuthToken = () => {
  return Cookies.get('authToken') || null;
};