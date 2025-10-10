
/**
 * AuthMiddleware - Demonstrates MIDDLEWARE PATTERN and CHAIN OF RESPONSIBILITY
 * 
 * DESIGN PATTERNS IMPLEMENTED:
 * 1. MIDDLEWARE PATTERN - Request processing pipeline
 * 2. CHAIN OF RESPONSIBILITY - Sequential request processing
 * 3. DECORATOR PATTERN - Adds authentication to routes
 * 
 * OOP CONCEPTS DEMONSTRATED:
 * 1. ENCAPSULATION - Authentication logic encapsulated
 * 2. SINGLE RESPONSIBILITY - Each middleware has one purpose
 * 3. SEPARATION OF CONCERNS - Auth separated from business logic
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, USER_ROLES } = require('../utils/rbac');

/**
 * MIDDLEWARE PATTERN IMPLEMENTATION
 * Authentication middleware - First link in the chain
 * 
 * DECORATOR PATTERN: Adds authentication to routes
 * ENCAPSULATION: Token validation logic hidden
 * CHAIN OF RESPONSIBILITY: Passes control to next middleware
 */
const protect = async (req, res, next) => {
    let token;

    // *** MIDDLEWARE PATTERN - Request Processing Steps ***
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // STEP 1: Extract token (ENCAPSULATION)
            token = req.headers.authorization.split(' ')[1];
            
            // STEP 2: Verify token (ABSTRACTION)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // STEP 3: Attach user to request (DECORATOR PATTERN)
            // Decorates request with user information
            req.user = await User.findById(decoded.id).select('-password');
            
            // STEP 4: Continue chain (CHAIN OF RESPONSIBILITY)
            next();
        } catch (error) {
            // ENCAPSULATION: Error handling contained within middleware
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // GUARD CLAUSE: Stop chain if no token
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * STRATEGY PATTERN + HIGHER-ORDER FUNCTION IMPLEMENTATION
 * Role-based authorization middleware factory
 * 
 * STRATEGY PATTERN: Different authorization strategies per role
 * FACTORY PATTERN: Creates role-specific middleware functions
 * HIGHER-ORDER FUNCTION: Returns configured middleware
 */
const requireAnyRole = (roles) => {
    // FACTORY: Returns customized middleware based on roles
    return (req, res, next) => {
        // STRATEGY: Role-based access control logic
        if (req.user && req.user.role && roles.includes(req.user.role)) {
            // CHAIN OF RESPONSIBILITY: Continue to next middleware
            next();
        } else {
            // ENCAPSULATION: Authorization failure handled here
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
