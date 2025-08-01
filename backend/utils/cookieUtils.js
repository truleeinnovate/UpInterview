// v1.0.0  -  mansoor  -  testing cookies that works in all browsers

/**
 * Utility functions for cookie management
 */

/**
 * Common cookie options for authentication cookies
 */
const getAuthCookieOptions = () => {
  const isLocalhost = process.env.NODE_ENV === 'development';
  // <---------------------- v1.0.0
  const isProduction = process.env.NODE_ENV === 'production';
  // ---------------------- v1.0.0 >

  // Determine the appropriate domain
  let domain = undefined;
  console.log('=== COOKIE UTILS DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('COOKIE_DOMAIN env var:', process.env.COOKIE_DOMAIN);
  console.log('Initial domain value:', domain);
  console.log('isLocalhost:', isLocalhost);
  // <---------------------- v1.0.0
  console.log('isProduction:', isProduction);

  // For production, use domain only if explicitly set
  if (isProduction && process.env.COOKIE_DOMAIN) {
    domain = process.env.COOKIE_DOMAIN;
    console.log('Production mode: Using domain from env var:', domain);
  } else if (isProduction) {
    domain = undefined;
    console.log('Production mode: Using undefined domain (no env var set)');
    // ---------------------- v1.0.0 >
  } else {
    // For development, check environment variable
    domain = process.env.COOKIE_DOMAIN;
    if (!domain) {
      domain = undefined;
      console.log('Development mode: No domain set (using undefined)');
    } else {
      console.log('Development mode: Using domain from env var:', domain);
    }
  }

  const options = {
    httpOnly: false, // Allow client-side JS to read the cookie
    // <---------------------- v1.0.0
    secure: isProduction, // Only secure in production
    sameSite: isLocalhost ? 'Lax' : 'None', // Use Lax for localhost, None for production
    // ---------------------- v1.0.0 >
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/', // Make cookie available on all paths
  };

  // Only add domain if it's defined
  if (domain) {
    options.domain = domain;
    console.log('Final cookie options with domain:', options);
  } else {
    console.log('Final cookie options without domain:', options);
  }

  console.log('=== END COOKIE UTILS DEBUG ===');
  return options;
};

/**
 * Clears authentication cookies
 */
const clearAuthCookies = (res) => {
  const domain = undefined; // Always use undefined domain for clearing

  const clearOptions = {
    path: '/',
  };

  if (domain) {
    clearOptions.domain = domain;
  }

  res.clearCookie('authToken', clearOptions);
  res.clearCookie('impersonationToken', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
};

module.exports = {
  getAuthCookieOptions,
  clearAuthCookies,
};
