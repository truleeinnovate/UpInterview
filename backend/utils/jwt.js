// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
// Set token to expire in 2 hours - we'll handle session timeout on the frontend
const TOKEN_EXPIRATION = '2h';
// Refresh window set to 30 seconds before frontend timeout
const REFRESH_WINDOW = 30 * 1000;

function generateToken(payload) {
  // console.log('JWT_SECRET:', process.env.JWT_SECRET);
  // if (!process.env.JWT_SECRET) {
  //   throw new Error('JWT_SECRET is not defined');
  // }
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRATION 
  });
}

// Function to refresh token if it's within the refresh window
function refreshTokenIfNeeded(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = decoded.exp;
    
    // Always refresh the token if it's still valid
    // This ensures the token stays fresh as long as the user is active
    if (expiresAt > now) {
      const { iat, exp, ...payload } = decoded;
      return generateToken(payload);
    }
    
    return null; // No refresh needed
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('JWT expired:', error.message);
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid JWT:', error.message);
      throw new Error('Invalid token');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};


const generateEmailVerificationToken = (email, userId) => {
  return jwt.sign(
    { email, userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
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
  refreshTokenIfNeeded 
};