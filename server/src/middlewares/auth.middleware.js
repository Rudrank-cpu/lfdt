const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Please log in.'
    });
  }

  const secret = process.env.JWT_SECRET || 'eventflow_super_secret_jwt_key_2026_secure';

  jwt.verify(token, secret, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token is invalid or has expired.'
      });
    }
    req.user = decodedUser; // { id, email, role, fullName }
    next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required role(s): [${allowedRoles.join(', ')}], current role: '${req.user.role}'`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
