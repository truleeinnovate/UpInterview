import Cookies from 'js-cookie';

// Function to set cookies for authentication (store JWT from backend)
export const setAuthCookies = (token) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? undefined : '.upinterview.io'; // Use undefined for localhost, parent domain for production
  const expiresInSeconds = 25200; // Token expires in 7 hours (7 * 60 * 60 = 25200 seconds)
  
  // Set auth token with expiration
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
  const expirationTime = expirationDate.getTime();

  // Set auth token cookie
  Cookies.set('authToken', token, {
    expires: expirationDate,
    secure: !isLocalhost,
    sameSite: 'Lax',
    domain,
  });

  // Set authentication flag
  Cookies.set('isAuthenticated', 'true', {
    expires: expirationDate,
    secure: !isLocalhost,
    sameSite: 'Lax',
    domain,
  });

  // Set token expiration in cookie
  Cookies.set('tokenExpiration', expirationTime.toString(), {
    expires: expirationDate,
    secure: !isLocalhost,
    sameSite: 'Lax',
    domain,
  });
  
  // Also store expiration in localStorage for immediate access
  localStorage.setItem('tokenExpiration', expirationTime.toString());

  return expirationTime;
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
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? 'localhost' : '.upinterview.io';
  const cookies = document.cookie.split("; ");
  
  // Clear all cookies
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    
    // Clear for current path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    // Clear for domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    
    // Clear for subdomains
    if (!isLocalhost) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain.split('.').slice(-2).join('.')}`;
    }
  });

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
};

// Function to get the auth token
export const getAuthToken = () => {
  // Immediate check for root path - force logout
  if (window.location.pathname === '/') {
    clearAllCookies();
    localStorage.removeItem('tokenExpiration');
    return null;
  }
  
  // Check if token exists and is not expired
  const token = Cookies.get('authToken');
  if (!token) {
    return null;
  }

  // Check if token is expired using both cookie and localStorage
  const tokenExpiration = Cookies.get('tokenExpiration') || localStorage.getItem('tokenExpiration');
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
    // Token is expired, clear cookies and return null
    clearAllCookies();
    localStorage.removeItem('tokenExpiration');
    return null;
  }
  
  return token;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Logout function
export const logout = () => {
  clearAllCookies();
  // Clear any stored expiration time
  localStorage.removeItem('tokenExpiration');
  
  // If we're not already on the root path, navigate there
  if (window.location.pathname !== '/') {
    // Use window.location.replace to prevent back button from returning to protected routes
    window.location.replace('/');
  }
};