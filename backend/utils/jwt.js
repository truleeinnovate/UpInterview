// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
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

module.exports = { generateToken, verifyToken };