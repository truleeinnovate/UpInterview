/**
 * Utility functions for cookie management
 */

/**
 * Common cookie options for authentication cookies
 */
const getAuthCookieOptions = () => {
  const isLocalhost = process.env.NODE_ENV === 'development';

  // Determine the appropriate domain
  let domain = undefined; // Always use undefined domain for production
  console.log('=== COOKIE UTILS DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('COOKIE_DOMAIN env var:', process.env.COOKIE_DOMAIN);
  console.log('Initial domain value:', domain);
  console.log('isLocalhost:', isLocalhost);

  // For production, always use undefined domain regardless of environment variable
  if (process.env.NODE_ENV === 'production') {
    domain = undefined;
    console.log('Production mode: Using undefined domain (ignoring env var)');
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
    secure: true, // Always secure for HTTPS
    sameSite: 'None', // Required for cross-site cookies in production
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
