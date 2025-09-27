
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, hasAnyPermission, USER_ROLES, validateRole } = require('../utils/rbac');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient role permissions.',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const userRole = req.user.role;
        const hasRequiredPermission = hasAnyPermission(userRole, requiredPermissions);

        if (!hasRequiredPermission) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredPermissions,
                userRole
            });
        }

        next();
    };
};

const requireAdmin = requireRole(USER_ROLES.ADMIN);

const requireInstructorOrAdmin = requireRole(USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN);

const requireAnyRole = requireRole(USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN);

module.exports = {
    protect,
    requireRole,
    requirePermission,
    requireAdmin,
    requireInstructorOrAdmin,
    requireAnyRole
};
