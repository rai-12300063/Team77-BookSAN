// Role-Based Access Control (RBAC) utility functions
// Provides role and permission management for the application

// Define user roles with hierarchical permissions
const USER_ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor', 
    STUDENT: 'student'
};

// Define permissions for each role
const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'user.create',
        'user.read',
        'user.update', 
        'user.delete',
        'course.create',
        'course.read',
        'course.update',
        'course.delete',
        'module.create',
        'module.read',
        'module.update',
        'module.delete',
        'quiz.create',
        'quiz.read',
        'quiz.update',
        'quiz.delete',
        'progress.read',
        'progress.update',
        'system.admin'
    ],
    [USER_ROLES.INSTRUCTOR]: [
        'course.create',
        'course.read',
        'course.update',
        'module.create',
        'module.read', 
        'module.update',
        'quiz.create',
        'quiz.read',
        'quiz.update',
        'progress.read',
        'student.read'
    ],
    [USER_ROLES.STUDENT]: [
        'course.read',
        'module.read',
        'quiz.read',
        'quiz.attempt',
        'progress.read',
        'progress.update'
    ]
};

/**
 * Check if a user role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the role has the permission
 */
const hasPermission = (role, permission) => {
    if (!role || !permission) {
        return false;
    }
    
    const permissions = ROLE_PERMISSIONS[role.toLowerCase()];
    return permissions ? permissions.includes(permission) : false;
};

/**
 * Check if a user role has any of the specified permissions
 * @param {string} role - User role
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has any of the permissions
 */
const hasAnyPermission = (role, permissions) => {
    if (!role || !permissions || !Array.isArray(permissions)) {
        return false;
    }
    
    return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a user role has all of the specified permissions
 * @param {string} role - User role
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has all of the permissions
 */
const hasAllPermissions = (role, permissions) => {
    if (!role || !permissions || !Array.isArray(permissions)) {
        return false;
    }
    
    return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Array<string>} - Array of permissions for the role
 */
const getRolePermissions = (role) => {
    if (!role) {
        return [];
    }
    
    return ROLE_PERMISSIONS[role.toLowerCase()] || [];
};

/**
 * Check if a role is hierarchically higher than another role
 * @param {string} role1 - First role
 * @param {string} role2 - Second role  
 * @returns {boolean} - Whether role1 is higher than role2
 */
const isRoleHigher = (role1, role2) => {
    const hierarchy = {
        [USER_ROLES.ADMIN]: 3,
        [USER_ROLES.INSTRUCTOR]: 2,
        [USER_ROLES.STUDENT]: 1
    };
    
    const level1 = hierarchy[role1?.toLowerCase()] || 0;
    const level2 = hierarchy[role2?.toLowerCase()] || 0;
    
    return level1 > level2;
};

/**
 * Validate if a role is a valid user role
 * @param {string} role - Role to validate
 * @returns {boolean} - Whether the role is valid
 */
const isValidRole = (role) => {
    return Object.values(USER_ROLES).includes(role?.toLowerCase());
};

module.exports = {
    USER_ROLES,
    ROLE_PERMISSIONS,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRolePermissions,
    isRoleHigher,
    isValidRole
};