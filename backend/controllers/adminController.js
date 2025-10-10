/**
 * AdminController - Demonstrates REPOSITORY and FACADE PATTERNS
 * 
 * DESIGN PATTERNS IMPLEMENTED:
 * 1. REPOSITORY PATTERN - Centralized data access for admin operations
 * 2. FACADE PATTERN - Simplified interface for complex admin tasks
 * 3. STRATEGY PATTERN - Different management strategies per entity type
 * 
 * OOP CONCEPTS DEMONSTRATED:
 * 1. ENCAPSULATION - Admin business logic encapsulated
 * 2. ABSTRACTION - Complex admin operations hidden behind simple API
 * 3. SINGLE RESPONSIBILITY - Each function handles one admin task
 * 4. SEPARATION OF CONCERNS - Admin logic separated from other controllers
 */

const User = require('../models/User');
const Course = require('../models/Course');
const Task = require('../models/Task');
const LearningProgress = require('../models/LearningProgress');
const { USER_ROLES, validateRole, canManageUser } = require('../utils/rbac');

/**
 * REPOSITORY PATTERN IMPLEMENTATION
 * Get all users - Centralized user data access
 * 
 * REPOSITORY: Abstracts user data retrieval complexity
 * ENCAPSULATION: Password field automatically excluded for security
 * ABSTRACTION: Client doesn't need to know about database queries
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
            error: error.message
        });
    }
};

/**
 * REPOSITORY PATTERN - Single user retrieval
 * Get user by ID with security considerations
 * 
 * ENCAPSULATION: Password exclusion handled automatically
 * ERROR HANDLING: Consistent error response structure
 * ABSTRACTION: Simple interface for user lookup
 */
const getUserById = async (req, res) => {
    try {
        // REPOSITORY: Centralized user data access with security
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user',
            error: error.message
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!validateRole(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided',
                validRoles: Object.values(USER_ROLES)
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!canManageUser(req.user.role, user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update this user\'s role'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!canManageUser(req.user.role, user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete this user'
            });
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
            error: error.message
        });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const [userStats, courseCount, taskCount, progressCount] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Course.countDocuments(),
            Task.countDocuments(),
            LearningProgress.countDocuments()
        ]);

        const roleStats = {};
        Object.values(USER_ROLES).forEach(role => {
            roleStats[role] = 0;
        });

        userStats.forEach(stat => {
            roleStats[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: Object.values(roleStats).reduce((sum, count) => sum + count, 0),
                    byRole: roleStats
                },
                courses: courseCount,
                tasks: taskCount,
                learningProgress: progressCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching system statistics',
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (role && !validateRole(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided',
                validRoles: Object.values(USER_ROLES)
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const userData = {
            name,
            email,
            password,
            role: role || USER_ROLES.STUDENT,
            address
        };

        const user = await User.create(userData);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                university: user.university,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while creating user',
            error: error.message
        });
    }
};

const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        if (!validateRole(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided',
                validRoles: Object.values(USER_ROLES)
            });
        }

        const users = await User.find({ role }).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users by role',
            error: error.message
        });
    }
};

const createInstructor = async (req, res) => {
    try {
        const { name, email, password, university, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const instructor = await User.create({
            name,
            email,
            password,
            role: USER_ROLES.INSTRUCTOR,
            university,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: {
                id: instructor._id,
                name: instructor.name,
                email: instructor.email,
                role: instructor.role,
                university: instructor.university,
                address: instructor.address
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while creating instructor',
            error: error.message
        });
    }
};

const createStudent = async (req, res) => {
    try {
        const { name, email, password, university, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const student = await User.create({
            name,
            email,
            password,
            role: USER_ROLES.STUDENT,
            university,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                university: student.university,
                address: student.address
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while creating student',
            error: error.message
        });
    }
};

const deleteInstructor = async (req, res) => {
    try {
        const instructorId = req.params.id;
        const instructor = await User.findById(instructorId);

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        if (instructor.role !== USER_ROLES.INSTRUCTOR) {
            return res.status(400).json({
                success: false,
                message: 'User is not an instructor'
            });
        }

        // Check if instructor has courses
        const courseCount = await Course.countDocuments({ 'instructor.id': instructorId });
        if (courseCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete instructor who has active courses. Please reassign or delete courses first.'
            });
        }

        await User.findByIdAndDelete(instructorId);

        res.status(200).json({
            success: true,
            message: 'Instructor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting instructor',
            error: error.message
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.role !== USER_ROLES.STUDENT) {
            return res.status(400).json({
                success: false,
                message: 'User is not a student'
            });
        }

        // Remove student's learning progress records
        await LearningProgress.deleteMany({ userId: studentId });

        await User.findByIdAndDelete(studentId);

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully along with their learning progress'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting student',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getSystemStats,
    createUser,
    getUsersByRole,
    createInstructor,
    createStudent,
    deleteInstructor,
    deleteStudent
};