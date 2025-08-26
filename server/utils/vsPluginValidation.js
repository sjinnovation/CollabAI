import jwt from 'jsonwebtoken';
import config from '../config.js';

// Ensure JWT_SECRET is defined at startup
if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Generates a signed JWT token using the provided payload and secret.
 * Token is set to expire in 30 days.
 * 
 * @param {Object} payload - The data to encode in the token (e.g., user ID, email).
 * @returns {string} - A signed JWT token.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Verifies a JWT token and decodes its payload.
 * Throws an error if the token is invalid or expired.
 * 
 * @param {string} token - The JWT token to verify.
 * @returns {Object} - The decoded token payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

export { generateToken, verifyToken };
