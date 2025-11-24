// v1.0.0  -  mansoor  -  testing cookies that works in all browsers

/**
 * Utility functions for cookie management
 */

/**
 * Common cookie options for authentication cookies
 */
const getAuthCookieOptions = () => {
  const isLocalhost = process.env.NODE_ENV === "development";
  // <---------------------- v1.0.0
  const isProduction = process.env.NODE_ENV === "production";
  // ---------------------- v1.0.0 >

  // Determine the appropriate domain
  let domain = undefined;
  // <---------------------- v1.0.0

  // For production, use domain only if explicitly set
  if (isProduction && process.env.COOKIE_DOMAIN) {
    domain = process.env.COOKIE_DOMAIN;
  } else if (isProduction) {
    domain = undefined;
    // ---------------------- v1.0.0 >
  } else {
    // For development, check environment variable
    domain = process.env.COOKIE_DOMAIN;
    if (!domain) {
      domain = undefined;
    } else {
    }
  }

  const options = {
    httpOnly: false, // Allow client-side JS to read the cookie
    // <---------------------- v1.0.0
    secure: isProduction, // Only secure in production
    sameSite: isLocalhost ? "Lax" : "None", // Use Lax for localhost, None for production
    // ---------------------- v1.0.0 >
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: "/", // Make cookie available on all paths
  };

  // Only add domain if it's defined
  if (domain) {
    options.domain = domain;
  } else {
  }

  return options;
};

/**
 * Clears authentication cookies
 */
const clearAuthCookies = (res) => {
  const domain = undefined; // Always use undefined domain for clearing

  const clearOptions = {
    path: "/",
  };

  if (domain) {
    clearOptions.domain = domain;
  }

  res.clearCookie("authToken", clearOptions);
  res.clearCookie("impersonationToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
};

module.exports = {
  getAuthCookieOptions,
  clearAuthCookies,
};
