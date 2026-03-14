const { expressjwt } = require('express-jwt');
const userService = require('../services/userService')
require('dotenv').config(); // loads environment variables from .env file

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error("JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

const authMiddleware = expressjwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
}).unless({ path: [ // paths that do not require authentication
                    '/auth/tokens', 
                    '/auth/resets',
                    '/auth/google-login',
                    /^\/auth\/resets\/.*/
                  ] });

// role-based authorization middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const userRole = await userService.getRoleByUtorid(req.auth.utorid);
      if (!userRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });  
    }
  };
};
// specific role checkers using Prisma RoleType enum values
const requireCashierOrHigher = requireRole(['cashier', 'manager', 'superuser']);
const requireManagerOrHigher = requireRole(['manager', 'superuser']);
const requireSuperuser = requireRole(['superuser']);

module.exports = {
  authMiddleware,
  requireCashierOrHigher,
  requireManagerOrHigher,
  requireSuperuser
};
