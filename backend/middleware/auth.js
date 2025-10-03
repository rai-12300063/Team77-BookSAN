const jwt = require('jsonwebtoken');
const Instructor = require('../models/Instructor');

const protect = async (req, res, next) => {
    console.log('PROTECT MIDDLEWARE CALLED');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Instructor.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            
            console.log('USER AUTHENTICATED:', req.user.email, 'Role:', req.user.role);
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    console.log('ADMIN CHECK - User role:', req.user?.role);
    
    // ALLOW INSTRUCTORS TO DELETE
    if (req.user && (req.user.role === 'admin' || req.user.role === 'instructor')) {
        console.log('ACCESS GRANTED');
        next();
    } else {
        console.log('ACCESS DENIED');
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { protect, adminOnly };
