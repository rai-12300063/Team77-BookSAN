const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const Task = require('../models/Task');
const User = require('../models/User');
const { hasPermission, canManageUser, USER_ROLES } = require('../utils/rbac');

const validateResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const resourceId = req.params.id || req.params.courseId || req.params.taskId || req.params.userId;

            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource ID is required'
                });
            }

            let isOwner = false;
            let resource = null;

            switch (resourceType) {
                case 'course':
                    resource = await Course.findById(resourceId);
                    if (resource) {
                        isOwner = resource.instructor.id.toString() === userId;
                    }
                    break;

                case 'task':
                    resource = await Task.findById(resourceId);
                    if (resource) {
                        isOwner = resource.userId.toString() === userId;
                    }
                    break;

                case 'progress':
                    const courseId = req.params.courseId || req.params.id;
                    resource = await LearningProgress.findOne({
                        courseId,
                        userId: req.params.studentId || userId
                    });
                    if (resource) {
                        isOwner = resource.userId.toString() === userId;

                        if (!isOwner && req.user.role === USER_ROLES.INSTRUCTOR) {
                            const course = await Course.findById(courseId);
                            isOwner = course && course.instructor.id.toString() === userId;
                        }
                    }
                    break;

                case 'user':
                    resource = await User.findById(resourceId);
                    if (resource) {
                        isOwner = resource._id.toString() === userId;

                        if (!isOwner && [USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR].includes(req.user.role)) {
                            isOwner = canManageUser(req.user.role, resource.role);
                        }
                    }
                    break;

                case 'enrollment':
                    const progressRecord = await LearningProgress.findOne({
                        courseId: req.params.courseId || req.params.id,
                        userId
                    });
                    isOwner = !!progressRecord;
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid resource type'
                    });
            }

            if (!resource && resourceType !== 'enrollment') {
                return res.status(404).json({
                    success: false,
                    message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
                });
            }

            if (!isOwner && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. You can only access your own ${resourceType}s.`
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error during ownership validation',
                error: error.message
            });
        }
    };
};

const requireOwnResourceOrRole = (resourceType, allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (allowedRoles.includes(userRole)) {
                return next();
            }

            return validateResourceOwnership(resourceType)(req, res, next);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error during permission validation',
                error: error.message
            });
        }
    };
};

const requireCourseEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id || req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        if (req.user.role === USER_ROLES.ADMIN) {
            return next();
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() === userId) {
            return next();
        }

        const enrollment = await LearningProgress.findOne({
            userId,
            courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to access this resource'
            });
        }

        req.enrollment = enrollment;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during enrollment validation',
            error: error.message
        });
    }
};

const requireCourseInstructor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id || req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        if (req.user.role === USER_ROLES.ADMIN) {
            return next();
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access courses you instruct.'
            });
        }

        req.course = course;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during instructor validation',
            error: error.message
        });
    }
};

const validateApiAccess = (operation, resource) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permission = `${resource}:${operation}`;

        if (!hasPermission(userRole, permission)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required: permission,
                userRole
            });
        }

        next();
    };
};

const requireSelfOrRole = (allowedRoles = []) => {
    return (req, res, next) => {
        const userId = req.user.id;
        const targetUserId = req.params.id || req.params.userId;
        const userRole = req.user.role;

        if (userId === targetUserId) {
            return next();
        }

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    };
};

const logApiAccess = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.user ? req.user.id : 'anonymous';
    const userRole = req.user ? req.user.role : 'none';
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${path} - User: ${userId} (${userRole}) - IP: ${ip}`);
    next();
};

module.exports = {
    validateResourceOwnership,
    requireOwnResourceOrRole,
    requireCourseEnrollment,
    requireCourseInstructor,
    validateApiAccess,
    requireSelfOrRole,
    logApiAccess
};