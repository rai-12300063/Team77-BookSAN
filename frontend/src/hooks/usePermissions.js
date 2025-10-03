import { useAuth } from '../context/AuthContext';

const usePermissions = () => {
  const { user, hasRole, hasAnyRole, isAdmin, isInstructor, isStudent } = useAuth();

  const permissions = {
    users: {
      read: hasRole('admin'),
      write: hasRole('admin'),
      delete: hasRole('admin'),
      manageRoles: hasRole('admin')
    },
    courses: {
      read: hasAnyRole(['admin', 'instructor', 'student']),
      write: hasAnyRole(['admin', 'instructor']),
      delete: hasRole('admin'),
      manage: hasAnyRole(['admin', 'instructor']),
      enroll: hasRole('student'),
      viewAll: hasRole('admin')
    },
    students: {
      read: hasAnyRole(['admin', 'instructor']),
      manage: hasAnyRole(['admin', 'instructor']),
      viewProgress: hasAnyRole(['admin', 'instructor', 'student'])
    },
    instructors: {
      read: hasRole('admin'),
      manage: hasRole('admin'),
      viewCourses: hasAnyRole(['admin', 'instructor'])
    },
    tasks: {
      read: hasAnyRole(['admin', 'instructor', 'student']),
      write: hasAnyRole(['admin', 'instructor']),
      delete: hasAnyRole(['admin', 'instructor']),
      submit: hasRole('student')
    },
    quiz: {
      read: hasAnyRole(['admin', 'instructor', 'student']),
      write: hasAnyRole(['admin', 'instructor']),
      delete: hasAnyRole(['admin', 'instructor']),
      take: hasRole('student'),
      manage: hasAnyRole(['admin', 'instructor'])
    },
    analytics: {
      viewSystem: hasRole('admin'),
      viewCourse: hasAnyRole(['admin', 'instructor']),
      viewOwnProgress: hasRole('student')
    },
    settings: {
      systemSettings: hasRole('admin'),
      courseSettings: hasAnyRole(['admin', 'instructor']),
      profileSettings: hasAnyRole(['admin', 'instructor', 'student'])
    }
  };

  const canAccess = (resource, action) => {
    return permissions[resource]?.[action] || false;
  };

  const getAccessibleRoutes = () => {
    const routes = [];

    // Dashboard is accessible to all authenticated users
    routes.push({ path: '/dashboard', label: 'Dashboard' });

    // Student routes
    if (isStudent()) {
      routes.push(
        { path: '/courses', label: 'My Courses' },
        { path: '/tasks', label: 'Tasks' },
        { path: '/progress', label: 'Progress' }
      );
    }

    // Instructor routes
    if (isInstructor()) {
      routes.push(
        { path: '/courses', label: 'Courses' },
        { path: '/instructor/manage-courses', label: 'Manage Courses' },
        { path: '/instructor/students', label: 'Students' },
        { path: '/instructor/analytics', label: 'Analytics' }
      );
    }

    // Admin routes
    if (isAdmin()) {
      routes.push(
        { path: '/admin/users', label: 'User Management' },
        { path: '/admin/courses', label: 'Course Management' },
        { path: '/admin/analytics', label: 'System Analytics' },
        { path: '/admin/settings', label: 'System Settings' }
      );
    }

    // Profile is accessible to all
    routes.push({ path: '/profile', label: 'Profile' });

    return routes;
  };

  const getRolePriority = () => {
    if (isAdmin()) return 3;
    if (isInstructor()) return 2;
    if (isStudent()) return 1;
    return 0;
  };

  const canManageUser = (targetUserRole) => {
    if (!isAdmin()) return false;

    const userPriority = getRolePriority();
    const targetPriority = {
      'admin': 3,
      'instructor': 2,
      'student': 1
    }[targetUserRole] || 0;

    return userPriority >= targetPriority;
  };

  return {
    permissions,
    canAccess,
    getAccessibleRoutes,
    canManageUser,
    getRolePriority,
    user,
    isAdmin: isAdmin(),
    isInstructor: isInstructor(),
    isStudent: isStudent()
  };
};

export default usePermissions;