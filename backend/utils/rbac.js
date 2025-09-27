const { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } = require('../constants/roles');

const hasPermission = (userRole, requiredPermission) => {
    if (!userRole || !requiredPermission) {
        return false;
    }

    const userPermissions = ROLE_PERMISSIONS[userRole];
    if (!userPermissions) {
        return false;
    }

    return userPermissions.includes(requiredPermission);
};

const hasAnyPermission = (userRole, requiredPermissions = []) => {
    if (!userRole || !Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return false;
    }

    return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

const hasAllPermissions = (userRole, requiredPermissions = []) => {
    if (!userRole || !Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return false;
    }

    return requiredPermissions.every(permission => hasPermission(userRole, permission));
};

const isRoleHigherOrEqual = (userRole, targetRole) => {
    if (!userRole || !targetRole) {
        return false;
    }

    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

    return userLevel >= targetLevel;
};

const canManageUser = (managerRole, targetUserRole) => {
    return isRoleHigherOrEqual(managerRole, targetUserRole) &&
           hasPermission(managerRole, 'users:write');
};

const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};

const validateRole = (role) => {
    return Object.values(USER_ROLES).includes(role);
};

module.exports = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleHigherOrEqual,
    canManageUser,
    getRolePermissions,
    validateRole,
    USER_ROLES,
    ROLE_PERMISSIONS,
    ROLE_HIERARCHY
};