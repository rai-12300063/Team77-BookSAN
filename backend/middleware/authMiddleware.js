
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, USER_ROLES } = require('../utils/rbac');

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

// Require admin role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === USER_ROLES.ADMIN) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Require instructor or admin role
const requireInstructor = (req, res, next) => {
    if (req.user && (req.user.role === USER_ROLES.INSTRUCTOR || req.user.role === USER_ROLES.ADMIN)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Instructor or Admin privileges required.'
        });
    }
};

// Require student or higher role
const requireStudent = (req, res, next) => {
    if (req.user && [USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Valid user account required.'
        });
    }
};

// Require specific permission
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (req.user && hasPermission(req.user.role, permission)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: `Access denied. Required permission: ${permission}`
            });
        }
    };
};

// Require any of the specified roles
const requireAnyRole = (roles = []) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }
    };
};

module.exports = {
    protect,
    requireAdmin,
    requireInstructor,
    requireStudent,
    requirePermission,
    requireAnyRole
};
