import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Sign a JWT token
 * @param {Object} payload - Data to encode in the token
 * @returns {string} JWT token
 */
const jwtSign = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to sign token');
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const jwtVerify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying JWT:', error);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode a JWT token without verification (use with caution)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const jwtDecode = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Failed to decode token');
  }
};

export { jwtSign, jwtVerify, jwtDecode };
