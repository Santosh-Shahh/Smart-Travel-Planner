const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the user document to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Expect header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authorized — no token provided' });
    }

    // Verify token & decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (excluding password) to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Not authorized — user not found' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized — token invalid' });
  }
};

module.exports = { protect };
