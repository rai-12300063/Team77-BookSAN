# API Permission Documentation

## Overview

This document outlines the comprehensive role-based permission system implemented across all API endpoints in the BookSAN learning management system.

## Permission Structure

### Role Hierarchy
1. **Admin** - Full system access
2. **Instructor** - Course management and student monitoring
3. **Student** - Learning activities and personal data

### Permission Categories
- `users:*` - User management operations
- `courses:*` - Course-related operations
- `tasks:*` - Task management operations
- `progress:*` - Learning progress operations
- `profile:*` - Personal profile operations
- `system:*` - System administration
- `analytics:*` - Analytics and reporting
- `students:*` - Student-related operations

## Role-Specific Permissions

### Admin Permissions
```javascript
[
    'users:read', 'users:write', 'users:delete',
    'courses:read', 'courses:write', 'courses:delete',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'progress:read', 'progress:write', 'progress:delete',
    'system:manage',
    'reports:view',
    'analytics:view'
]
```

### Instructor Permissions
```javascript
[
    'courses:read', 'courses:write', 'courses:delete',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'progress:read', 'progress:write',
    'students:read', 'students:progress:view',
    'reports:view',
    'analytics:view'
]
```

### Student Permissions
```javascript
[
    'courses:read',
    'tasks:read',
    'progress:read', 'progress:write',
    'profile:read', 'profile:write'
]
```

## API Endpoint Permissions

### Authentication Routes (`/api/auth/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/register` | POST | None (Public) | Rate limiting |
| `/login` | POST | None (Public) | Rate limiting |
| `/profile` | GET | `profile:read` | Self-access only |
| `/profile` | PUT | `profile:write` | Self-access only |

### Admin Routes (`/api/admin/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/users` | GET | `users:read` | Admin role required |
| `/users` | POST | `users:write` | Admin role required |
| `/users/:id` | GET | `users:read` | Resource ownership or admin |
| `/users/:id` | PUT | `users:write` | Resource ownership or admin |
| `/users/:id` | DELETE | `users:delete` | Resource ownership or admin |
| `/stats` | GET | `system:manage` | Admin role required |

### Instructor Routes (`/api/instructor/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/courses` | GET | `courses:read` | Own courses only |
| `/courses` | POST | `courses:write` | Instructor/admin role |
| `/courses/:id` | PUT | `courses:write` | Course ownership |
| `/courses/:id` | DELETE | `courses:delete` | Course ownership |
| `/courses/:id/students` | GET | `students:read` | Course ownership |
| `/courses/:id/analytics` | GET | `analytics:view` | Course ownership |
| `/courses/:courseId/students/:studentId` | GET | `students:progress:view` | Course ownership |
| `/courses/:courseId/students/:studentId` | PUT | `progress:write` | Course ownership |
| `/students` | GET | `students:read` | Own students only |

### Student Routes (`/api/student/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/dashboard` | GET | `profile:read` | Self-access only |
| `/courses` | GET | `courses:read` | Enrolled courses only |
| `/courses/:id` | GET | `courses:read` | Course enrollment required |
| `/courses/:id` | PUT | `progress:write` | Course enrollment required |
| `/courses/:id/bookmarks` | POST | `progress:write` | Course enrollment required |
| `/courses/:id/bookmarks/:bookmarkId` | DELETE | `progress:write` | Course enrollment + ownership |
| `/achievements` | GET | `profile:read` | Self-access only |
| `/learning-goals` | PUT | `profile:write` | Self-access only |
| `/recommendations` | GET | `courses:read` | Self-access only |

### Course Routes (`/api/courses/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/` | GET | None (Public) | Public course listing |
| `/enrolled/my` | GET | `courses:read` | Own enrollments only |
| `/` | POST | `courses:write` | Instructor/admin role |
| `/:id` | GET | None (Public) | Public course details |
| `/:id/enroll` | POST | `courses:read` | Authenticated users |
| `/:id/unenroll` | POST | `courses:read` | Enrollment ownership |
| `/:id` | PUT | `courses:write` | Course ownership or admin |
| `/:id` | DELETE | `courses:delete` | Course ownership or admin |

### Progress Routes (`/api/progress/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/analytics` | GET | `progress:read` | Self-access only |
| `/module` | PUT | `progress:write` | Course enrollment |
| `/course/:courseId` | GET | `progress:read` | Course enrollment |
| `/streaks` | GET | `progress:read` | Self-access only |
| `/goals` | PUT | `progress:write` | Self-access only |

### Task Routes (`/api/tasks/*`)
| Endpoint | Method | Required Permissions | Additional Validation |
|----------|--------|---------------------|----------------------|
| `/` | GET | `tasks:read` | Own tasks only |
| `/` | POST | `tasks:write` | Authenticated users |
| `/:id` | PUT | `tasks:write` | Task ownership |
| `/:id` | DELETE | `tasks:delete` | Task ownership |

## Permission Validation Middleware

### Core Middleware Functions

#### `requirePermission(...permissions)`
Validates that the user has at least one of the required permissions.

#### `requireRole(...roles)`
Validates that the user has one of the specified roles.

#### `validateResourceOwnership(resourceType)`
Ensures the user owns the specified resource or has admin privileges.

#### `requireCourseEnrollment`
Validates that the user is enrolled in the specified course.

#### `requireCourseInstructor`
Validates that the user is the instructor of the specified course.

### Resource Ownership Validation

The system implements ownership validation for:
- **Courses** - Only course instructors can modify their courses
- **Tasks** - Only task creators can modify their tasks
- **Progress** - Only students can modify their own progress
- **User Profiles** - Only users can modify their own profiles
- **Enrollments** - Only enrolled students can access course materials

### Security Features

1. **Role Hierarchy Enforcement** - Higher roles can perform actions of lower roles
2. **Resource Isolation** - Users can only access their own resources
3. **Audit Logging** - All API access is logged with user and permission details
4. **Permission Inheritance** - Admins have override permissions for all resources
5. **Enrollment Validation** - Students must be enrolled to access course content

## Error Responses

### Permission Denied (403)
```json
{
    "success": false,
    "message": "Access denied. Insufficient permissions.",
    "required": "courses:write",
    "userRole": "student"
}
```

### Resource Not Found (404)
```json
{
    "success": false,
    "message": "Course not found"
}
```

### Unauthorized (401)
```json
{
    "success": false,
    "message": "Not authenticated"
}
```

### Ownership Violation (403)
```json
{
    "success": false,
    "message": "Access denied. You can only access your own courses."
}
```

## Implementation Notes

1. **Middleware Order** - Permission middleware is applied in order: authentication → role validation → permission checks → resource ownership
2. **Performance** - Permission checks are cached per request to avoid database queries
3. **Scalability** - Permission system supports easy addition of new roles and permissions
4. **Security** - All sensitive operations require explicit permission validation
5. **Logging** - Comprehensive access logging for security auditing

## Testing

Permission enforcement is tested through:
1. Unit tests for each middleware function
2. Integration tests for all API endpoints
3. Role-based access control verification
4. Resource ownership validation tests
5. Security penetration testing scenarios