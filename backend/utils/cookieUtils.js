/**
 * Utility functions for cookie management
 */

/**
 * Common cookie options for authentication cookies
 */
const getAuthCookieOptions = () => ({
  httpOnly: true, // Prevents client-side JS from reading the cookie
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  sameSite: 'None', // Required for cross-site cookies
  domain: process.env.COOKIE_DOMAIN || '.app.upinterview.io', // Allow subdomains
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/', // Make cookie available on all paths
});

/**
 * Clears authentication cookies
 */
const clearAuthCookies = (res) => {
  res.clearCookie('authToken', {
    domain: process.env.COOKIE_DOMAIN || '.app.upinterview.io',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    domain: process.env.COOKIE_DOMAIN || '.app.upinterview.io',
    path: '/',
  });
};

module.exports = {
  getAuthCookieOptions,
  clearAuthCookies,
};
