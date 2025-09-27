const USER_ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'users:read',
        'users:write',
        'users:delete',
        'courses:read',
        'courses:write',
        'courses:delete',
        'tasks:read',
        'tasks:write',
        'tasks:delete',
        'progress:read',
        'progress:write',
        'progress:delete',
        'system:manage',
        'reports:view',
        'analytics:view'
    ],
    [USER_ROLES.INSTRUCTOR]: [
        'courses:read',
        'courses:write',
        'courses:delete',
        'tasks:read',
        'tasks:write',
        'tasks:delete',
        'progress:read',
        'progress:write',
        'students:read',
        'students:progress:view',
        'reports:view',
        'analytics:view'
    ],
    [USER_ROLES.STUDENT]: [
        'courses:read',
        'tasks:read',
        'progress:read',
        'progress:write',
        'profile:read',
        'profile:write'
    ]
};

const ROLE_HIERARCHY = {
    [USER_ROLES.ADMIN]: 3,
    [USER_ROLES.INSTRUCTOR]: 2,
    [USER_ROLES.STUDENT]: 1
};

module.exports = {
    USER_ROLES,
    ROLE_PERMISSIONS,
    ROLE_HIERARCHY
};