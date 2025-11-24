// backend/utils/jwt.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
// Set token to expire in 2 hours - we'll handle session timeout on the frontend
// const TOKEN_EXPIRATION = '2h'; // Disabled expiration
// Refresh window set to 30 seconds before frontend timeout
// const REFRESH_WINDOW = 30 * 1000; // Disabled expiration-based refresh window

function generateToken(payload) {
  // if (!process.env.JWT_SECRET) {
  //   throw new Error('JWT_SECRET is not defined');
  // }
  // return jwt.sign(payload, process.env.JWT_SECRET, {
  //   expiresIn: TOKEN_EXPIRATION
  // });
  // Expiration disabled: issue token without expiresIn
  return jwt.sign(payload, process.env.JWT_SECRET);
}

// Function to refresh token if it's within the refresh window
function refreshTokenIfNeeded(token) {
  // Expiration-based refresh is disabled.
  // Keeping this function for compatibility; it no longer performs refresh logic.
  return null;
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("JWT expired:", error.message);
      throw new Error("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      console.error("Invalid JWT:", error.message);
      throw new Error("Invalid token");
    } else {
      console.error("JWT verification error:", error);
      throw new Error("Token verification failed");
    }
  }
};

const generateEmailVerificationToken = (email, userId) => {
  // return jwt.sign(
  //   { email, userId },
  //   process.env.JWT_SECRET,
  //   { expiresIn: '24h' }
  // );
  // Expiration disabled for email verification token
  return jwt.sign({ email, userId }, process.env.JWT_SECRET);
};

const verifyEmailToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateEmailVerificationToken,
  verifyEmailToken,
  refreshTokenIfNeeded,
};
