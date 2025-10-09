
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

const requireAnyRole = (roles) => {
    return (req, res, next) => {
        if (req.user && req.user.role && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
        }
    };
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.status(403).json({ message: `Access denied. Permission '${permission}' required.` });
        }
    };
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

module.exports = { protect, requireAnyRole, requirePermission, adminOnly };
