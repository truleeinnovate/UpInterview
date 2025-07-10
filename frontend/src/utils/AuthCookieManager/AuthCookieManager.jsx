import Cookies from 'js-cookie';

export const setAuthCookies = ({ authToken, impersonationToken, userId, tenantId, organization, impersonatedUserId }) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const expiresInSeconds = 25200; // 7 hours
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
  const expirationTime = expirationDate.getTime();

  console.log('[setAuthCookies] Setting cookies with params:', {
    hasAuthToken: !!authToken,
    hasImpersonationToken: !!impersonationToken,
    userId,
    tenantId,
    organization,
    impersonatedUserId,
    isLocalhost
  });

  // Set authToken for normal user or impersonation
  if (authToken) {
    console.log('[setAuthCookies] Setting authToken cookie');
    console.log('[setAuthCookies] AuthToken length:', authToken.length);
    
    // Check if backend has already set the cookie
    const existingAuthToken = Cookies.get('authToken');
    if (existingAuthToken) {
      console.log('[setAuthCookies] Backend has already set authToken cookie, skipping frontend set');
    } else {
      console.log('[setAuthCookies] Backend has not set authToken cookie, setting via frontend');
      
      // Try setting the token without encoding first
      console.log('[setAuthCookies] Token preview:', authToken.substring(0, 50) + '...');
      
      // Test if we can set any cookie at all
      try {
        document.cookie = 'testCookie=working; path=/';
        const testCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('testCookie='));
        console.log('[setAuthCookies] Test cookie result:', testCookie ? 'WORKING' : 'FAILED');
      } catch (error) {
        console.error('[setAuthCookies] Test cookie failed:', error);
      }
      
      // Try multiple approaches to set the cookie
      let cookieSet = false;
      
      // Method 1: Try js-cookie without encoding first
      try {
        Cookies.set('authToken', authToken, {
          expires: expirationDate,
          path: '/'
        });
        cookieSet = true;
        console.log('[setAuthCookies] AuthToken set via js-cookie (unencoded)');
        
        // Verify immediately
        const verifyCookie = Cookies.get('authToken');
        console.log('[setAuthCookies] Immediate verification - AuthToken from Cookies.get:', verifyCookie ? 'EXISTS' : 'MISSING');
        
      } catch (error) {
        console.error('[setAuthCookies] Error setting authToken via js-cookie (unencoded):', error);
      }
      
      // Method 2: Try with base64 encoding if unencoded failed
      if (!cookieSet) {
        const base64Token = btoa(authToken);
        console.log('[setAuthCookies] Base64 encoded token length:', base64Token.length);
        
        try {
          Cookies.set('authToken', base64Token, {
            expires: expirationDate,
            path: '/'
          });
          cookieSet = true;
          console.log('[setAuthCookies] AuthToken set via js-cookie (base64)');
          
          // Verify immediately
          const verifyCookie = Cookies.get('authToken');
          console.log('[setAuthCookies] Immediate verification - AuthToken from Cookies.get (base64):', verifyCookie ? 'EXISTS' : 'MISSING');
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via js-cookie (base64):', error);
        }
      }
      
      // Method 3: Try with URL encoding if base64 failed
      if (!cookieSet) {
        const encodedToken = encodeURIComponent(authToken);
        console.log('[setAuthCookies] URL encoded token length:', encodedToken.length);
        
        try {
          Cookies.set('authToken', encodedToken, {
            expires: expirationDate,
            path: '/'
          });
          cookieSet = true;
          console.log('[setAuthCookies] AuthToken set via js-cookie (URL encoded)');
          
          // Verify immediately
          const verifyCookie = Cookies.get('authToken');
          console.log('[setAuthCookies] Immediate verification - AuthToken from Cookies.get (URL encoded):', verifyCookie ? 'EXISTS' : 'MISSING');
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via js-cookie (URL encoded):', error);
        }
      }
      
      // Method 4: Try document.cookie with explicit attributes (unencoded first)
      if (!cookieSet) {
        try {
          const cookieString = `authToken=${authToken}; expires=${expirationDate.toUTCString()}; path=/`;
          document.cookie = cookieString;
          console.log('[setAuthCookies] AuthToken set via document.cookie with expires (unencoded)');
          
          // Verify it was set
          const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
          console.log('[setAuthCookies] Verification - AuthToken from document.cookie (unencoded):', verifyCookie ? 'EXISTS' : 'MISSING');
          
          if (verifyCookie) {
            cookieSet = true;
          }
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via document.cookie (unencoded):', error);
        }
      }
      
      // Method 5: Try document.cookie with encoding if unencoded failed
      if (!cookieSet) {
        try {
          const encodedToken = encodeURIComponent(authToken);
          const cookieString = `authToken=${encodedToken}; expires=${expirationDate.toUTCString()}; path=/`;
          document.cookie = cookieString;
          console.log('[setAuthCookies] AuthToken set via document.cookie with expires (encoded)');
          
          // Verify it was set
          const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
          console.log('[setAuthCookies] Verification - AuthToken from document.cookie (encoded):', verifyCookie ? 'EXISTS' : 'MISSING');
          
          if (verifyCookie) {
            cookieSet = true;
          }
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via document.cookie (encoded):', error);
        }
      }
      
      // Method 6: Try simplest possible approach if still not working
      if (!cookieSet) {
        try {
          document.cookie = `authToken=${authToken}; path=/`;
          console.log('[setAuthCookies] AuthToken set via simple document.cookie (unencoded)');
          
          // Verify it was set
          const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
          console.log('[setAuthCookies] Verification - AuthToken from simple document.cookie (unencoded):', verifyCookie ? 'EXISTS' : 'MISSING');
          
          if (verifyCookie) {
            cookieSet = true;
          }
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via simple document.cookie (unencoded):', error);
        }
      }
      
      // Method 7: Try simplest possible approach with encoding if still not working
      if (!cookieSet) {
        try {
          const encodedToken = encodeURIComponent(authToken);
          document.cookie = `authToken=${encodedToken}; path=/`;
          console.log('[setAuthCookies] AuthToken set via simple document.cookie (encoded)');
          
          // Verify it was set
          const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
          console.log('[setAuthCookies] Verification - AuthToken from simple document.cookie (encoded):', verifyCookie ? 'EXISTS' : 'MISSING');
          
          if (verifyCookie) {
            cookieSet = true;
          }
          
        } catch (error) {
          console.error('[setAuthCookies] Error setting authToken via simple document.cookie (encoded):', error);
        }
      }
      
      // Don't use localStorage for auth tokens - cookies are the proper way
      // localStorage is only for impersonation tokens in special cases
      
      if (authToken) {
        console.log('[setAuthCookies] AuthToken cookie set successfully');
        
        // Add a small delay and then verify again
        setTimeout(() => {
          const delayedVerify = Cookies.get('authToken');
          const delayedVerifyDoc = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
          console.log('[setAuthCookies] Delayed verification (100ms):', {
            jsCookie: delayedVerify ? 'EXISTS' : 'MISSING',
            documentCookie: delayedVerifyDoc ? 'EXISTS' : 'MISSING'
          });
          
          // Check if cookie size might be the issue
          console.log('[setAuthCookies] Cookie size check:', {
            tokenLength: authToken.length,
            maxCookieSize: 4096, // Standard max cookie size
            isWithinLimit: authToken.length <= 4096
          });
        }, 100);
        
      } else {
        console.error('[setAuthCookies] Failed to set authToken cookie via all methods');
      }
    }
    
    // Set authentication status cookies
    try {
      const statusCookieOptions = isLocalhost ? {
        expires: expirationDate,
        path: '/'
      } : {
        expires: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'None'
      };
      
      Cookies.set('isAuthenticated', 'true', statusCookieOptions);
      Cookies.set('tokenExpiration', expirationTime.toString(), statusCookieOptions);
      console.log('[setAuthCookies] Auth status cookies set with options:', statusCookieOptions);
    } catch (error) {
      console.error('[setAuthCookies] Error setting auth status cookies:', error);
    }
  }

  // Set impersonationToken for super admin
  if (impersonationToken) {
    console.log('[setAuthCookies] Setting impersonationToken cookie');
    
    // ENCODE THE TOKEN: JWT tokens contain special characters that need encoding
    const encodedImpersonationToken = encodeURIComponent(impersonationToken);
    console.log('[setAuthCookies] Encoded impersonation token length:', encodedImpersonationToken.length);
    
    let cookieSet = false;
    
    try {
      // Method 1: Using js-cookie with secure settings
      Cookies.set('impersonationToken', encodedImpersonationToken, {
        expires: expirationDate,
        path: '/',
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'Lax' : 'None'
      });
      cookieSet = true;
      console.log('[setAuthCookies] ImpersonationToken cookie set via js-cookie (encoded)');
      
      // Verify the cookie was actually set
      const verifyCookie = Cookies.get('impersonationToken');
      console.log('[setAuthCookies] Verification - ImpersonationToken from Cookies.get after setting:', verifyCookie ? 'EXISTS' : 'MISSING');
      
    } catch (error) {
      console.error('[setAuthCookies] Error setting impersonationToken via js-cookie:', error);
    }
    
    // Method 2: Direct document.cookie as backup
    if (!cookieSet) {
      try {
        const cookieString = `impersonationToken=${encodedImpersonationToken}; expires=${expirationDate.toUTCString()}; path=/`;
        document.cookie = cookieString;
        cookieSet = true;
        console.log('[setAuthCookies] ImpersonationToken cookie set via document.cookie (encoded)');
        
        // Verify the cookie was actually set
        const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('impersonationToken='));
        console.log('[setAuthCookies] Verification - ImpersonationToken from document.cookie after setting:', verifyCookie ? 'EXISTS' : 'MISSING');
        
      } catch (error) {
        console.error('[setAuthCookies] Error setting impersonationToken via document.cookie:', error);
      }
    }
    
    // Method 3: Try simplest possible approach if still not working
    if (!cookieSet) {
      try {
        document.cookie = `impersonationToken=${encodedImpersonationToken}; path=/`;
        cookieSet = true;
        console.log('[setAuthCookies] ImpersonationToken cookie set via simple document.cookie (encoded)');
        
        // Verify the cookie was actually set
        const verifyCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('impersonationToken='));
        console.log('[setAuthCookies] Verification - ImpersonationToken from simple document.cookie after setting:', verifyCookie ? 'EXISTS' : 'MISSING');
        
      } catch (error) {
        console.error('[setAuthCookies] Error setting impersonationToken via simple document.cookie:', error);
      }
    }
    
    if (cookieSet) {
      console.log('[setAuthCookies] ImpersonationToken cookie set successfully');
    } else {
      console.error('[setAuthCookies] Failed to set impersonationToken cookie via all methods');
    }
    
    // Set authentication status cookies
    try {
      Cookies.set('isAuthenticated', 'true', {
        expires: expirationDate,
        path: '/',
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'Lax' : 'None'
      });
      Cookies.set('tokenExpiration', expirationTime.toString(), {
        expires: expirationDate,
        path: '/',
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'Lax' : 'None'
      });
    } catch (error) {
      console.error('[setAuthCookies] Error setting auth status cookies:', error);
    }
  }

  // Set user-specific cookies
  if (userId) {
    console.log('[setAuthCookies] Setting userId cookie:', userId);
    try {
      const userCookieOptions = isLocalhost ? {
        expires: expirationDate,
        path: '/'
      } : {
        expires: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'None'
      };
      
      Cookies.set('userId', userId, userCookieOptions);
    } catch (error) {
      console.error('[setAuthCookies] Error setting userId cookie:', error);
    }
  }

  if (tenantId) {
    console.log('[setAuthCookies] Setting tenantId cookie:', tenantId);
    try {
      const tenantCookieOptions = isLocalhost ? {
        expires: expirationDate,
        path: '/'
      } : {
        expires: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'None'
      };
      
      Cookies.set('tenantId', tenantId, tenantCookieOptions);
    } catch (error) {
      console.error('[setAuthCookies] Error setting tenantId cookie:', error);
    }
  }

  if (typeof organization !== 'undefined') {
    console.log('[setAuthCookies] Setting organization cookie:', organization);
    try {
      const orgCookieOptions = isLocalhost ? {
        expires: expirationDate,
        path: '/'
      } : {
        expires: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'None'
      };
      
      Cookies.set('organization', organization.toString(), orgCookieOptions);
    } catch (error) {
      console.error('[setAuthCookies] Error setting organization cookie:', error);
    }
  }

  if (impersonatedUserId) {
    console.log('[setAuthCookies] Setting impersonatedUserId cookie:', impersonatedUserId);
    try {
      const impersonatedCookieOptions = isLocalhost ? {
        expires: expirationDate,
        path: '/'
      } : {
        expires: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'None'
      };
      
      Cookies.set('impersonatedUserId', impersonatedUserId, impersonatedCookieOptions);
    } catch (error) {
      console.error('[setAuthCookies] Error setting impersonatedUserId cookie:', error);
    }
  }

  // Verify cookies were set with multiple methods
  const allCookies = document.cookie;
  console.log('[setAuthCookies] All cookies after setting:', allCookies);
  
  // Check via multiple methods
  const authTokenFromCookies = Cookies.get('authToken');
  const impersonationTokenFromCookies = Cookies.get('impersonationToken');
  
  console.log('[setAuthCookies] AuthToken from Cookies.get:', authTokenFromCookies ? 'EXISTS' : 'MISSING');
  console.log('[setAuthCookies] ImpersonationToken from Cookies.get:', impersonationTokenFromCookies ? 'EXISTS' : 'MISSING');
  
  // Also check document.cookie directly
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  const impersonationCookie = cookies.find(cookie => cookie.trim().startsWith('impersonationToken='));
  
  console.log('[setAuthCookies] AuthToken from document.cookie:', authCookie ? 'EXISTS' : 'MISSING');
  console.log('[setAuthCookies] ImpersonationToken from document.cookie:', impersonationCookie ? 'EXISTS' : 'MISSING');

  return expirationTime;
};

// Function to clear authentication cookies selectively
export const clearAllCookies = ({ preserveSuperAdmin = false } = {}) => {
  const isLocalhost = window.location.hostname === 'localhost';
  // Don't set domain for production - let the browser handle it
  const domain = isLocalhost ? undefined : undefined;
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

  sessionStorage.clear();
};

// Test function to check if cookies are working
export const testCookieFunctionality = () => {
  console.log('[testCookieFunctionality] Testing cookie functionality...');
  
  try {
    // Try to set a test cookie
    Cookies.set('testCookie', 'testValue', { path: '/' });
    const testCookie = Cookies.get('testCookie');
    console.log('[testCookieFunctionality] Test cookie result:', testCookie ? 'WORKING' : 'NOT_WORKING');
    
    // Try document.cookie
    document.cookie = 'testCookie2=testValue2; path=/';
    const testCookie2 = document.cookie.split(';').find(cookie => cookie.trim().startsWith('testCookie2='));
    console.log('[testCookieFunctionality] Document cookie test result:', testCookie2 ? 'WORKING' : 'NOT_WORKING');
    
    // Clean up test cookies
    Cookies.remove('testCookie', { path: '/' });
    document.cookie = 'testCookie2=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    
    return {
      jsCookie: !!testCookie,
      documentCookie: !!testCookie2
    };
  } catch (error) {
    console.error('[testCookieFunctionality] Error testing cookies:', error);
    return { jsCookie: false, documentCookie: false };
  }
};

// Debug function to check all token sources
export const debugTokenSources = () => {
  console.log('[debugTokenSources] Checking all token sources...');
  
  // Check js-cookie
  let authTokenFromCookies = Cookies.get('authToken');
  let impersonationTokenFromCookies = Cookies.get('impersonationToken');
  
  // Try to decode tokens if they exist (they might be encoded)
  if (authTokenFromCookies) {
    // Try base64 decoding first
    try {
      const decodedToken = atob(authTokenFromCookies);
      if (decodedToken.startsWith('eyJ')) {
        authTokenFromCookies = decodedToken;
      } else {
        throw new Error('Not a valid JWT after base64 decode');
      }
    } catch (error) {
      // Try URL decoding if base64 failed
      try {
        authTokenFromCookies = decodeURIComponent(authTokenFromCookies);
      } catch (urlError) {
        // Token was not encoded, keep as-is
      }
    }
  }
  
  if (impersonationTokenFromCookies) {
    // Try base64 decoding first
    try {
      const decodedToken = atob(impersonationTokenFromCookies);
      if (decodedToken.startsWith('eyJ')) {
        impersonationTokenFromCookies = decodedToken;
      } else {
        throw new Error('Not a valid JWT after base64 decode');
      }
    } catch (error) {
      // Try URL decoding if base64 failed
      try {
        impersonationTokenFromCookies = decodeURIComponent(impersonationTokenFromCookies);
      } catch (urlError) {
        // Token was not encoded, keep as-is
      }
    }
  }
  
  // Check document.cookie
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  const impersonationCookie = cookies.find(cookie => cookie.trim().startsWith('impersonationToken='));
  let authTokenFromDocument = authCookie ? authCookie.split('=')[1] : null;
  let impersonationTokenFromDocument = impersonationCookie ? impersonationCookie.split('=')[1] : null;
  
  // Try to decode tokens from document.cookie if they exist
  if (authTokenFromDocument) {
    // Try base64 decoding first
    try {
      const decodedToken = atob(authTokenFromDocument);
      if (decodedToken.startsWith('eyJ')) {
        authTokenFromDocument = decodedToken;
      } else {
        throw new Error('Not a valid JWT after base64 decode');
      }
    } catch (error) {
      // Try URL decoding if base64 failed
      try {
        authTokenFromDocument = decodeURIComponent(authTokenFromDocument);
      } catch (urlError) {
        // Token was not encoded, keep as-is
      }
    }
  }
  
  if (impersonationTokenFromDocument) {
    // Try base64 decoding first
    try {
      const decodedToken = atob(impersonationTokenFromDocument);
      if (decodedToken.startsWith('eyJ')) {
        impersonationTokenFromDocument = decodedToken;
      } else {
        throw new Error('Not a valid JWT after base64 decode');
      }
    } catch (error) {
      // Try URL decoding if base64 failed
      try {
        impersonationTokenFromDocument = decodeURIComponent(impersonationTokenFromDocument);
      } catch (urlError) {
        // Token was not encoded, keep as-is
      }
    }
  }
  
  const debugInfo = {
    jsCookie: {
      authToken: authTokenFromCookies ? 'EXISTS' : 'MISSING',
      impersonationToken: impersonationTokenFromCookies ? 'EXISTS' : 'MISSING'
    },
    documentCookie: {
      authToken: authTokenFromDocument ? 'EXISTS' : 'MISSING',
      impersonationToken: impersonationTokenFromDocument ? 'EXISTS' : 'MISSING'
    },
    allCookies: document.cookie
  };
  
  console.log('[debugTokenSources] Debug info:', debugInfo);
  return debugInfo;
};

// Function to get the auth token
export const getAuthToken = () => {
  console.log('[getAuthToken] Called, current pathname:', window.location.pathname);
  
  // Try multiple sources for the token with better error handling
  let token = null;
  
  // Method 1: Try js-cookie
  try {
    token = Cookies.get('authToken');
    console.log('[getAuthToken] Token from Cookies.get:', token ? 'EXISTS' : 'MISSING');
    
    // If token exists, try to decode it (in case it was encoded when set)
    if (token) {
      // Try base64 decoding first (most likely for JWT tokens)
      try {
        const decodedToken = atob(token);
        // Check if the decoded token looks like a JWT (starts with eyJ)
        if (decodedToken.startsWith('eyJ')) {
          token = decodedToken;
          console.log('[getAuthToken] Token base64 decoded successfully');
        } else {
          throw new Error('Not a valid JWT after base64 decode');
        }
      } catch (error) {
        // Try URL decoding if base64 failed
        try {
          token = decodeURIComponent(token);
          console.log('[getAuthToken] Token URL decoded successfully');
        } catch (urlError) {
          console.log('[getAuthToken] Token was not encoded, using as-is');
        }
      }
    }
  } catch (error) {
    console.error('[getAuthToken] Error getting token from Cookies.get:', error);
  }
  
  // Method 2: Try parsing from document.cookie if not found in js-cookie
  if (!token) {
    try {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        token = authCookie.split('=')[1];
        console.log('[getAuthToken] Token from document.cookie:', token ? 'EXISTS' : 'MISSING');
        
        // If token exists, try to decode it (in case it was encoded when set)
        if (token) {
          // Try base64 decoding first (most likely for JWT tokens)
          try {
            const decodedToken = atob(token);
            // Check if the decoded token looks like a JWT (starts with eyJ)
            if (decodedToken.startsWith('eyJ')) {
              token = decodedToken;
              console.log('[getAuthToken] Token from document.cookie base64 decoded successfully');
            } else {
              throw new Error('Not a valid JWT after base64 decode');
            }
          } catch (error) {
            // Try URL decoding if base64 failed
            try {
              token = decodeURIComponent(token);
              console.log('[getAuthToken] Token from document.cookie URL decoded successfully');
            } catch (urlError) {
              console.log('[getAuthToken] Token from document.cookie was not encoded, using as-is');
            }
          }
        }
      }
    } catch (error) {
      console.error('[getAuthToken] Error getting token from document.cookie:', error);
    }
  }
  
  if (!token) {
    console.log('[getAuthToken] No token found in any source, returning null');
    return null;
  }

  // Check token expiration
  const tokenExpiration = Cookies.get('tokenExpiration');
  const currentTime = Math.floor(Date.now() / 1000);
  console.log('[getAuthToken] Token expiration check:', {
    tokenExpiration,
    currentTime,
    isExpired: tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)
  });

  if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
    console.log('[getAuthToken] Token expired, clearing cookies and returning null');
    clearAllCookies({ preserveSuperAdmin: true });
    return null;
  }

  console.log('[getAuthToken] Returning valid token');
  return token;
};

// Function to get the impersonation token
export const getImpersonationToken = () => {
  if (window.location.pathname === '/') {
    clearAllCookies();
    return null;
  }

  // Try multiple sources for the token with better error handling
  let token = null;
  
  // Method 1: Try js-cookie
  try {
    token = Cookies.get('impersonationToken');
    console.log('[getImpersonationToken] Token from Cookies.get:', token ? 'EXISTS' : 'MISSING');
    
    // If token exists, try to decode it (in case it was encoded when set)
    if (token) {
      // Try base64 decoding first (most likely for JWT tokens)
      try {
        const decodedToken = atob(token);
        // Check if the decoded token looks like a JWT (starts with eyJ)
        if (decodedToken.startsWith('eyJ')) {
          token = decodedToken;
          console.log('[getImpersonationToken] Token base64 decoded successfully');
        } else {
          throw new Error('Not a valid JWT after base64 decode');
        }
      } catch (error) {
        // Try URL decoding if base64 failed
        try {
          token = decodeURIComponent(token);
          console.log('[getImpersonationToken] Token URL decoded successfully');
        } catch (urlError) {
          console.log('[getImpersonationToken] Token was not encoded, using as-is');
        }
      }
    }
  } catch (error) {
    console.error('[getImpersonationToken] Error getting token from Cookies.get:', error);
  }
  
  // Method 2: Try parsing from document.cookie if not found in js-cookie
  if (!token) {
    try {
      const cookies = document.cookie.split(';');
      const impersonationCookie = cookies.find(cookie => cookie.trim().startsWith('impersonationToken='));
      if (impersonationCookie) {
        token = impersonationCookie.split('=')[1];
        console.log('[getImpersonationToken] Token from document.cookie:', token ? 'EXISTS' : 'MISSING');
        
        // If token exists, try to decode it (in case it was encoded when set)
        if (token) {
          // Try base64 decoding first (most likely for JWT tokens)
          try {
            const decodedToken = atob(token);
            // Check if the decoded token looks like a JWT (starts with eyJ)
            if (decodedToken.startsWith('eyJ')) {
              token = decodedToken;
              console.log('[getImpersonationToken] Token from document.cookie base64 decoded successfully');
            } else {
              throw new Error('Not a valid JWT after base64 decode');
            }
          } catch (error) {
            // Try URL decoding if base64 failed
            try {
              token = decodeURIComponent(token);
              console.log('[getImpersonationToken] Token from document.cookie URL decoded successfully');
            } catch (urlError) {
              console.log('[getImpersonationToken] Token from document.cookie was not encoded, using as-is');
            }
          }
        }
      }
    } catch (error) {
      console.error('[getImpersonationToken] Error getting token from document.cookie:', error);
    }
  }
  
  // Don't use localStorage for any tokens - cookies are the proper way
  
  if (!token) {
    console.log('[getImpersonationToken] No token found in any source, returning null');
    return null;
  }

  // Check token expiration
  const tokenExpiration = Cookies.get('tokenExpiration');
  const currentTime = Math.floor(Date.now() / 1000);
  console.log('[getImpersonationToken] Token expiration check:', {
    tokenExpiration,
    currentTime,
    isExpired: tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)
  });

  if (tokenExpiration && currentTime >= parseInt(tokenExpiration, 10)) {
    console.log('[getImpersonationToken] Token expired, clearing cookies and returning null');
    clearAllCookies({ preserveSuperAdmin: true });
    return null;
  }

  console.log('[getImpersonationToken] Returning valid token');
  return token;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken() || !!getImpersonationToken();
};

// Logout function
export const logout = (organization = false) => {
  const isImpersonating = !!Cookies.get('impersonationToken');

  if (isImpersonating) {
    // If impersonating, clear only the effective user cookies and redirect to admin dashboard
    clearAllCookies({ preserveSuperAdmin: true });
    const currentHost = window.location.hostname;
    const isLocalhost = currentHost === 'localhost';

    if (!isLocalhost && currentHost.includes('upinterview.io')) {
      const mainDomain = 'app.upinterview.io';
      window.location.href = `https://${mainDomain}/admin-dashboard`;
    } else {
      if (window.location.pathname !== '/admin-dashboard') {
        window.location.replace('/admin-dashboard');
      }
    }
  } else {
    // If not impersonating, clear all cookies and redirect to login
    clearAllCookies({ preserveSuperAdmin: false });
    const redirectPath = organization ? '/organization-login' : '/select-user-type';
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
  }
};