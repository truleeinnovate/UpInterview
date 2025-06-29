// import Cookies from 'js-cookie';

// // Function to set cookies for authentication (store JWT from backend)
// export const setAuthCookies = (token) => {
//   const isLocalhost = window.location.hostname === 'localhost';
//   const domain = isLocalhost ? undefined : '.upinterview.io'; // Use undefined for localhost, parent domain for production
//   const expiresInSeconds = 25200; // Token expires in 7 hours (7 * 60 * 60 = 25200 seconds)
  
//   // Set auth token with expiration
//   const expirationDate = new Date();
//   expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
//   const expirationTime = expirationDate.getTime();

//   // Set auth token cookie
//   Cookies.set('authToken', token, {
//     expires: expirationDate,
//     secure: !isLocalhost,
//     sameSite: 'Lax',
//     domain,
//   });

//   // Set authentication flag
//   Cookies.set('isAuthenticated', 'true', {
//     expires: expirationDate,
//     secure: !isLocalhost,
//     sameSite: 'Lax',
//     domain,
//   });

//   // Set token expiration in cookie
//   Cookies.set('tokenExpiration', expirationTime.toString(), {
//     expires: expirationDate,
//     secure: !isLocalhost,
//     sameSite: 'Lax',
//     domain,
//   });
  
//   // Also store expiration in localStorage for immediate access
//   localStorage.setItem('tokenExpiration', expirationTime.toString());

//   return expirationTime;
// };

// // // Function to clear all authentication cookies
// // export const clearAuthCookies = () => {
// //   const isLocalhost = window.location.hostname === 'localhost';
// //   const domain = isLocalhost ? undefined : '.upinterview.io';

// //   Cookies.remove('authToken', { domain });
// //   Cookies.remove('userId', { domain });
// //   Cookies.remove('organizationId', { domain });
// //   Cookies.remove('token', { domain });
// // };

// export const clearAllCookies = () => {
//   const isLocalhost = window.location.hostname === 'localhost';
//   const domain = isLocalhost ? 'localhost' : '.upinterview.io';
//   const cookies = document.cookie.split("; ");
  
//   // Clear all cookies
//   cookies.forEach(cookie => {
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    
//     // Clear for current path
//     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
//     // Clear for domain
//     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    
//     // Clear for subdomains
//     if (!isLocalhost) {
//       document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain.split('.').slice(-2).join('.')}`;
//     }
//   });

//   // Clear localStorage and sessionStorage
//   localStorage.clear();
//   sessionStorage.clear();
// };

// // Function to get the auth token
// export const getAuthToken = () => {
//   // Immediate check for root path - force logout
//   if (window.location.pathname === '/') {
//     clearAllCookies();
//     localStorage.removeItem('tokenExpiration');
//     return null;
//   }
  
//   // Check if token exists and is not expired
//   const token = Cookies.get('authToken');
//   if (!token) {
//     return null;
//   }

//   // Check if token is expired using both cookie and localStorage
//   const tokenExpiration = Cookies.get('tokenExpiration') || localStorage.getItem('tokenExpiration');
//   const currentTime = Math.floor(Date.now() / 1000);
  
//   if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
//     // Token is expired, clear cookies and return null
//     clearAllCookies();
//     localStorage.removeItem('tokenExpiration');
//     return null;
//   }
  
//   return token;
// };

// // Check if user is authenticated
// export const isAuthenticated = () => {
//   const token = getAuthToken();
//   return !!token;
// };

// // Logout function
// export const logout = (isOrganization = false) => {
//   clearAllCookies();
//   // Clear any stored expiration time
//   localStorage.removeItem('tokenExpiration');
  
//   // Determine the redirect path based on user type
//   const redirectPath = isOrganization ? '/organization-login' : '/select-user-type';
  
//   // Get the current hostname
//   const currentHost = window.location.hostname;
//   const isLocalhost = currentHost === 'localhost';
  
//   // If we're not on localhost and the hostname includes 'upinterview.io'
//   if (!isLocalhost && currentHost.includes('upinterview.io')) {
//     // Get the main domain (app.upinterview.io)
//     const mainDomain = 'app.upinterview.io';
//     // Create the full URL with https and the redirect path
//     const fullUrl = `https://${mainDomain}${redirectPath}`;
//     // Redirect to the main domain
//     window.location.href = fullUrl;
//   } else {
//     // For localhost or other domains, use the existing behavior
//     if (window.location.pathname !== redirectPath) {
//       window.location.replace(redirectPath);
//     }
//   }
// };



import Cookies from 'js-cookie';

// Function to set authentication cookies
export const setAuthCookies = ({ authToken, impersonationToken, userId, tenantId, organization, impersonatedUserId }) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? undefined : '.upinterview.io';
  const expiresInSeconds = 25200; // 7 hours
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
  const expirationTime = expirationDate.getTime();

  // Set authToken for normal user or impersonation
  if (authToken) {
    Cookies.set('authToken', authToken, {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
    Cookies.set('isAuthenticated', 'true', {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
    Cookies.set('tokenExpiration', expirationTime.toString(), {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  // Set impersonationToken for super admin
  if (impersonationToken) {
    Cookies.set('impersonationToken', impersonationToken, {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
    Cookies.set('isAuthenticated', 'true', {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
    Cookies.set('tokenExpiration', expirationTime.toString(), {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  // Set user-specific cookies
  if (userId) {
    Cookies.set('userId', userId, {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  if (tenantId) {
    Cookies.set('tenantId', tenantId, {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  if (typeof organization !== 'undefined') {
    Cookies.set('organization', organization.toString(), {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  if (impersonatedUserId) {
    Cookies.set('impersonatedUserId', impersonatedUserId, {
      expires: expirationDate,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      domain,
    });
  }

  return expirationTime;
};

// Function to clear authentication cookies selectively
export const clearAllCookies = ({ preserveSuperAdmin = false } = {}) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const domain = isLocalhost ? undefined : '.upinterview.io';
  const cookies = document.cookie.split('; ');
  const preserveCookies = preserveSuperAdmin ? ['impersonationToken', 'impersonatedUserId'] : [];

  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    if (preserveCookies.includes(name)) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    if (domain) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain.split('.').slice(-2).join('.')}`;
    }
  });

  // const preservedItems = preserveSuperAdmin ? ['impersonationToken', 'impersonatedUserId'] : [];
  // const localStorageItems = { ...localStorage };
  // localStorage.clear();
  // preservedItems.forEach(item => {
  //   if (localStorageItems[item]) {
  //     localStorage.setItem(item, localStorageItems[item]);
  //   }
  // });

  sessionStorage.clear();
};

// Function to get the auth token
export const getAuthToken = () => {
  if (window.location.pathname === '/') {
    clearAllCookies();
    return null;
  }

  const token = Cookies.get('authToken');
  if (!token) {
    return null;
  }

  const tokenExpiration = Cookies.get('tokenExpiration');
  const currentTime = Math.floor(Date.now() / 1000);

  if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
    clearAllCookies({ preserveSuperAdmin: true });
    return null;
  }

  return token;
};

// Function to get the impersonation token
export const getImpersonationToken = () => {
  if (window.location.pathname === '/') {
    clearAllCookies();
    return null;
  }

  const token = Cookies.get('impersonationToken');
  if (!token) {
    return null;
  }

  const tokenExpiration = Cookies.get('tokenExpiration');
  const currentTime = Math.floor(Date.now() / 1000);

  if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
    clearAllCookies();
    return null;
  }

  return token;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken() || !!getImpersonationToken();
};

// Logout function
export const logout = (organization = false) => {
  const isImpersonating = !!Cookies.get('impersonationToken');
  clearAllCookies({ preserveSuperAdmin: isImpersonating });

  const redirectPath = isImpersonating ? '/admin-dashboard' : organization ? '/organization-login' : '/select-user-type';
  const currentHost = window.location.hostname;
  const isLocalhost = currentHost === 'localhost';

  if (!isLocalhost && currentHost.includes('upinterview.io')) {
    const mainDomain = 'app.upinterview.io';
    window.location.href = `https://${mainDomain}${redirectPath}`;
  } else {
    if (window.location.pathname !== redirectPath) {
      window.location.replace(redirectPath);
    }
  }
};