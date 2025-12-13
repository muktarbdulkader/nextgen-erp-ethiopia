const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mukti-secret-key-change-me';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.',
      hint: 'Please log in to access this resource'
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ 
      message: 'Invalid or expired token',
      hint: 'Please log in again'
    });
  }
};

module.exports = authenticateToken;
