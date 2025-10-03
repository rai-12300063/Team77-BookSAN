const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

const protect = async (req, res, next) => {
    console.log('STUDENT PROTECT MIDDLEWARE CALLED');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let user = await Student.findById(decoded.id).select('-password');
            if (!user) {
                user = await Instructor.findById(decoded.id).select('-password');
            }
            
            req.user = user;
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            
            console.log('STUDENT USER AUTHENTICATED:', req.user.email, 'Role:', req.user.role);
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    console.log('STUDENT ADMIN CHECK - User role:', req.user?.role);
    
    if (req.user && req.user.role === 'admin') {
        console.log('STUDENT ACCESS GRANTED');
        next();
    } else {
        console.log('STUDENT ACCESS DENIED');
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { protect, adminOnly };
