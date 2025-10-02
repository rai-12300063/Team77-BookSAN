const { expect } = require('chai');
const { hasPermission, hasAnyPermission, validateRole, USER_ROLES, ROLE_PERMISSIONS } = require('../utils/rbac');

describe('RBAC Utils Tests', () => {
    describe('hasPermission', () => {
        it('should return true when user has the required permission', () => {
            const result = hasPermission(USER_ROLES.ADMIN, 'users:read');
            expect(result).to.be.true;
        });

        it('should return false when user does not have the required permission', () => {
            const result = hasPermission(USER_ROLES.STUDENT, 'users:delete');
            expect(result).to.be.false;
        });

        it('should return false for invalid role', () => {
            const result = hasPermission('invalid_role', 'users:read');
            expect(result).to.be.false;
        });

        it('should return false for null/undefined inputs', () => {
            expect(hasPermission(null, 'users:read')).to.be.false;
            expect(hasPermission(USER_ROLES.ADMIN, null)).to.be.false;
        });
    });

    describe('hasAnyPermission', () => {
        it('should return true when user has at least one required permission', () => {
            const result = hasAnyPermission(USER_ROLES.INSTRUCTOR, ['users:delete', 'courses:read']);
            expect(result).to.be.true;
        });

        it('should return false when user has none of the required permissions', () => {
            const result = hasAnyPermission(USER_ROLES.STUDENT, ['users:delete', 'system:manage']);
            expect(result).to.be.false;
        });

        it('should return false for empty permissions array', () => {
            const result = hasAnyPermission(USER_ROLES.ADMIN, []);
            expect(result).to.be.false;
        });
    });

    describe('validateRole', () => {
        it('should return true for valid roles', () => {
            expect(validateRole(USER_ROLES.ADMIN)).to.be.true;
            expect(validateRole(USER_ROLES.INSTRUCTOR)).to.be.true;
            expect(validateRole(USER_ROLES.STUDENT)).to.be.true;
        });

        it('should return false for invalid roles', () => {
            expect(validateRole('invalid_role')).to.be.false;
            expect(validateRole(null)).to.be.false;
            expect(validateRole(undefined)).to.be.false;
        });
    });

    describe('Role Permissions Structure', () => {
        it('should have permissions defined for all roles', () => {
            Object.values(USER_ROLES).forEach(role => {
                expect(ROLE_PERMISSIONS[role]).to.be.an('array');
                expect(ROLE_PERMISSIONS[role].length).to.be.greaterThan(0);
            });
        });

        it('should have admin with most permissions', () => {
            const adminPermissions = ROLE_PERMISSIONS[USER_ROLES.ADMIN];
            const instructorPermissions = ROLE_PERMISSIONS[USER_ROLES.INSTRUCTOR];
            const studentPermissions = ROLE_PERMISSIONS[USER_ROLES.STUDENT];

            expect(adminPermissions.length).to.be.greaterThan(instructorPermissions.length);
            expect(instructorPermissions.length).to.be.greaterThan(studentPermissions.length);
        });

        it('should have system:manage permission only for admin', () => {
            expect(ROLE_PERMISSIONS[USER_ROLES.ADMIN]).to.include('system:manage');
            expect(ROLE_PERMISSIONS[USER_ROLES.INSTRUCTOR]).to.not.include('system:manage');
            expect(ROLE_PERMISSIONS[USER_ROLES.STUDENT]).to.not.include('system:manage');
        });
    });
});

describe('Role Constants', () => {
    it('should have the correct role values', () => {
        expect(USER_ROLES.ADMIN).to.equal('admin');
        expect(USER_ROLES.INSTRUCTOR).to.equal('instructor');
        expect(USER_ROLES.STUDENT).to.equal('student');
    });
});