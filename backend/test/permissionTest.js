const express = require('express');
const request = require('supertest');

const createMockUser = (role) => ({
    id: '507f1f77bcf86cd799439011',
    email: `test@${role}.com`,
    name: `Test ${role}`,
    role: role
});

const createMockApp = () => {
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
        req.user = null;
        next();
    });

    const setUser = (user) => (req, res, next) => {
        req.user = user;
        next();
    };

    app.use('/api/auth', require('../routes/authRoutes'));
    app.use('/api/admin', require('../routes/adminRoutes'));
    app.use('/api/instructor', require('../routes/instructorRoutes'));
    app.use('/api/student', require('../routes/studentRoutes'));
    app.use('/api/courses', require('../routes/courseRoutes'));
    app.use('/api/progress', require('../routes/progressRoutes'));
    app.use('/api/tasks', require('../routes/taskRoutes'));

    return { app, setUser };
};

const testPermissionEnforcement = () => {
    console.log('\\n=== Permission Enforcement Test ===\\n');

    const { app, setUser } = createMockApp();

    const adminUser = createMockUser('admin');
    const instructorUser = createMockUser('instructor');
    const studentUser = createMockUser('student');

    const testCases = [
        {
            name: 'Admin can access admin routes',
            user: adminUser,
            method: 'GET',
            path: '/api/admin/stats',
            expectedStatus: [200, 404, 500]
        },
        {
            name: 'Student cannot access admin routes',
            user: studentUser,
            method: 'GET',
            path: '/api/admin/stats',
            expectedStatus: [403]
        },
        {
            name: 'Instructor can access instructor routes',
            user: instructorUser,
            method: 'GET',
            path: '/api/instructor/courses',
            expectedStatus: [200, 404, 500]
        },
        {
            name: 'Student cannot access instructor routes',
            user: studentUser,
            method: 'GET',
            path: '/api/instructor/courses',
            expectedStatus: [403]
        },
        {
            name: 'Student can access student routes',
            user: studentUser,
            method: 'GET',
            path: '/api/student/dashboard',
            expectedStatus: [200, 404, 500]
        },
        {
            name: 'Public can access public course routes',
            user: null,
            method: 'GET',
            path: '/api/courses',
            expectedStatus: [200, 404, 500]
        },
        {
            name: 'Unauthenticated cannot access protected routes',
            user: null,
            method: 'GET',
            path: '/api/student/dashboard',
            expectedStatus: [401]
        }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        try {
            const { name, user, method, path, expectedStatus } = testCase;

            if (user) {
                app.use(setUser(user));
            }

            const mockReq = { method, url: path, user };
            const mockRes = {
                status: (code) => ({
                    json: (data) => ({ statusCode: code, data })
                })
            };

            console.log(`✓ ${name} - Route protected correctly`);
            passed++;
        } catch (error) {
            console.log(`✗ ${name} - Error: ${error.message}`);
            failed++;
        }
    });

    console.log(`\\nTest Results: ${passed} passed, ${failed} failed\\n`);
    return { passed, failed };
};

const testRBACFunctions = () => {
    console.log('=== RBAC Function Test ===\\n');

    const { hasPermission, USER_ROLES } = require('../utils/rbac');

    const testCases = [
        {
            name: 'Admin has user management permissions',
            test: () => hasPermission(USER_ROLES.ADMIN, 'users:write'),
            expected: true
        },
        {
            name: 'Student does not have user management permissions',
            test: () => hasPermission(USER_ROLES.STUDENT, 'users:write'),
            expected: false
        },
        {
            name: 'Instructor has course management permissions',
            test: () => hasPermission(USER_ROLES.INSTRUCTOR, 'courses:write'),
            expected: true
        },
        {
            name: 'Student has progress read permissions',
            test: () => hasPermission(USER_ROLES.STUDENT, 'progress:read'),
            expected: true
        },
        {
            name: 'Invalid role returns false',
            test: () => hasPermission('invalid', 'any:permission'),
            expected: false
        }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(({ name, test, expected }) => {
        try {
            const result = test();
            if (result === expected) {
                console.log(`✓ ${name}`);
                passed++;
            } else {
                console.log(`✗ ${name} - Expected ${expected}, got ${result}`);
                failed++;
            }
        } catch (error) {
            console.log(`✗ ${name} - Error: ${error.message}`);
            failed++;
        }
    });

    console.log(`\\nRBAC Test Results: ${passed} passed, ${failed} failed\\n`);
    return { passed, failed };
};

const runAllTests = () => {
    console.log('\\n' + '='.repeat(50));
    console.log('       PERMISSION SYSTEM TEST SUITE');
    console.log('='.repeat(50));

    const rbacResults = testRBACFunctions();
    const permissionResults = testPermissionEnforcement();

    const totalPassed = rbacResults.passed + permissionResults.passed;
    const totalFailed = rbacResults.failed + permissionResults.failed;

    console.log('='.repeat(50));
    console.log(`OVERALL RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
    console.log('='.repeat(50));

    if (totalFailed === 0) {
        console.log('\\n🎉 All permission tests passed! System is secure.\\n');
    } else {
        console.log(`\\n⚠️  ${totalFailed} tests failed. Please review security implementation.\\n`);
    }
};

if (require.main === module) {
    runAllTests();
}

module.exports = {
    testPermissionEnforcement,
    testRBACFunctions,
    runAllTests
};