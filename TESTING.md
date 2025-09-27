# Role-Based Access Control Integration Testing

This document describes the comprehensive integration testing suite for the BookSAN learning platform's role-based access control system.

## Overview

The testing suite validates the functionality and security of three user roles:
- **Student**: Course enrollment, progress tracking, learning activities
- **Instructor**: Course management, student oversight, analytics
- **Admin**: System administration, user management, comprehensive analytics

## Test Structure

```
backend/test/
├── utils/
│   └── testHelpers.js              # Test utilities and authentication helpers
├── integration/
│   ├── studentRoleTests.js         # Student role functionality tests
│   ├── instructorRoleTests.js      # Instructor role functionality tests
│   ├── adminRoleTests.js           # Admin role functionality tests
│   ├── crossRoleInteractionTests.js # Cross-role interaction tests
│   └── allRolesIntegrationSuite.js  # Comprehensive test suite
└── test-runner.js                   # Master test runner script

frontend/src/tests/
├── roleBasedUITests.test.js        # UI component visibility tests
└── routeProtectionTests.test.js    # Route protection and access control tests
```

## Running Tests

### Quick Start
```bash
# Run comprehensive role-based integration tests
npm run test:roles

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run integration tests specifically
npm run test:integration

# Run all tests (backend + frontend)
npm run test:all
```

### Individual Test Suites

#### Backend Integration Tests
```bash
cd backend
npm test
```

#### Frontend Role-Based Tests
```bash
cd frontend
npm test -- --testNamePattern="Role.*Test|route.*Protection"
```

#### Specific Role Tests
```bash
cd backend
npm test -- --grep "Student Role"
npm test -- --grep "Instructor Role"
npm test -- --grep "Admin Role"
npm test -- --grep "Cross-Role"
```

## Test Categories

### 1. Student Role Tests (`studentRoleTests.js`)
- ✅ Dashboard access and functionality
- ✅ Course enrollment and enrollment restrictions
- ✅ Progress tracking and completion recording
- ✅ Learning activities and content access
- ✅ Profile management within allowed scope
- ✅ Access restrictions (cannot access admin/instructor features)

### 2. Instructor Role Tests (`instructorRoleTests.js`)
- ✅ Instructor dashboard and analytics
- ✅ Course creation, modification, and deletion
- ✅ Student management within instructor's courses
- ✅ Course analytics and grade book functionality
- ✅ Publishing and archiving courses
- ✅ Communication features (announcements, feedback)
- ✅ Access restrictions (cannot access admin features or other instructors' data)

### 3. Admin Role Tests (`adminRoleTests.js`)
- ✅ System-wide dashboard and analytics
- ✅ User management (create, update, delete, role changes)
- ✅ Course management across all instructors
- ✅ System configuration and settings
- ✅ Security monitoring and audit trails
- ✅ Data export and backup operations
- ✅ Content moderation and system health monitoring

### 4. Cross-Role Interaction Tests (`crossRoleInteractionTests.js`)
- ✅ Complete course lifecycle with multiple roles
- ✅ Role boundary enforcement
- ✅ Data isolation between roles
- ✅ Permission inheritance and escalation
- ✅ Concurrent access and race condition handling
- ✅ Authentication and session management
- ✅ Error handling and edge cases

### 5. Frontend UI Tests (`roleBasedUITests.test.js`)
- ✅ RoleBasedRender component functionality
- ✅ Convenience role components (AdminOnly, InstructorOnly, etc.)
- ✅ Navigation bar role-based visibility
- ✅ Dashboard role-based rendering
- ✅ ProtectedRoute component behavior
- ✅ Complex nested role scenarios

### 6. Route Protection Tests (`routeProtectionTests.test.js`)
- ✅ Public route access for unauthenticated users
- ✅ Dashboard route protection by role
- ✅ Role-specific route access validation
- ✅ Access denied scenarios and error handling
- ✅ Parameterized route protection
- ✅ Loading state handling
- ✅ Edge cases and error scenarios

## Test Data and Setup

### Database Setup
- Automated test database setup and teardown
- Generated test data for all roles
- Isolated test environment to prevent data conflicts

### Authentication
- JWT token-based authentication testing
- Role-based authorization validation
- Session management and security testing

### Test Utilities
The `testHelpers.js` file provides:
- `createAuthenticatedUser(role)` - Create test users with specific roles
- `makeAuthenticatedRequest(agent, token)` - Make authenticated API requests
- `enrollStudentInCourse(agent, token, courseId)` - Helper for course enrollment
- `generateTestData()` - Create comprehensive test data set
- `assertResponse(response, status, requiredFields)` - Response validation

## Security Testing

### Authentication & Authorization
- ✅ JWT token validation
- ✅ Role-based endpoint protection
- ✅ Session security and timeout handling
- ✅ Password security validation

### Access Control
- ✅ Privilege escalation prevention
- ✅ Data leakage prevention
- ✅ Cross-role data access restrictions
- ✅ Session hijacking protection

### Data Integrity
- ✅ Role-based data filtering
- ✅ Ownership validation
- ✅ Cross-role operation boundaries
- ✅ Audit trail generation

## Performance Testing

### Scalability Targets
- Students: 1,000+ concurrent users
- Instructors: 100+ concurrent users
- Admins: 10+ concurrent users
- Overall: 500+ concurrent sessions

### Performance Metrics
- Student dashboard load: <200ms
- Instructor analytics: <500ms
- Admin system overview: <1000ms
- Role permission check: <10ms

## Continuous Integration

### Pre-commit Checks
```bash
# Run before committing role-based changes
npm run test:roles
```

### CI Pipeline Integration
```yaml
# Example GitHub Actions workflow
- name: Run Role-Based Integration Tests
  run: npm run test:roles
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Ensure MongoDB is running
   mongod --dbpath ./data/db
   ```

2. **Test Data Conflicts**
   ```bash
   # Clear test database
   npm run test:backend -- --grep "teardown"
   ```

3. **Frontend Test Failures**
   ```bash
   # Install dependencies
   cd frontend && npm install
   ```

4. **Permission Errors**
   ```bash
   # Check test environment variables
   cp .env.test .env
   ```

### Debug Mode
```bash
# Run tests with verbose output
npm run test:roles -- --verbose

# Run specific test with debug info
cd backend
npm test -- --grep "specific test name" --reporter spec
```

## Contributing

When adding new role-based features:

1. Add corresponding integration tests in the appropriate role test file
2. Update cross-role interaction tests if needed
3. Add frontend UI tests for new components
4. Update route protection tests for new routes
5. Run the complete test suite before submitting: `npm run test:roles`

## Test Coverage

The test suite covers:
- **Functional Testing**: All role-based features and workflows
- **Security Testing**: Authentication, authorization, and access control
- **Integration Testing**: Cross-role interactions and data flow
- **UI Testing**: Frontend component behavior and visibility
- **Performance Testing**: Load handling and response times
- **Error Handling**: Edge cases and failure scenarios

For detailed test results and coverage reports, run:
```bash
npm run test:roles
```