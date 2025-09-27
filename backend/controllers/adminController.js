const User = require('../models/User');
const Course = require('../models/Course');
const Task = require('../models/Task');
const LearningProgress = require('../models/LearningProgress');
const { USER_ROLES, validateRole, canManageUser } = require('../utils/rbac');

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

const getUserById = async (req, res) => {
    try {
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
        const { name, email, password, role, university, address } = req.body;

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
            university,
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

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getSystemStats,
    createUser
};