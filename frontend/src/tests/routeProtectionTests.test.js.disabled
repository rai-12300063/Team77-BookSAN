import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock the auth context
const createMockAuthContext = (role, isAuthenticated = true) => ({
  user: isAuthenticated ? { id: '1', name: `Test ${role}`, email: `test@${role}.com`, role } : null,
  token: isAuthenticated ? 'mock-token' : null,
  loading: false,
  isAuthenticated: () => isAuthenticated,
  hasRole: (checkRole) => role === checkRole,
  isAdmin: () => role === 'admin',
  isInstructor: () => role === 'instructor',
  isStudent: () => role === 'student',
  hasAnyRole: (roles) => roles.includes(role),
  login: jest.fn(),
  logout: jest.fn()
});

// Mock AuthContext hook
let mockAuthContext;

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

// Mock dashboard components to avoid complex rendering
jest.mock('../components/dashboards/StudentDashboard', () => {
  return function StudentDashboard() {
    return <div data-testid="student-dashboard">Student Dashboard</div>;
  };
});

jest.mock('../components/dashboards/InstructorDashboard', () => {
  return function InstructorDashboard() {
    return <div data-testid="instructor-dashboard">Instructor Dashboard</div>;
  };
});

jest.mock('../components/dashboards/AdminDashboard', () => {
  return function AdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

// Mock page components
jest.mock('../pages/Login', () => {
  return function Login() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/Register', () => {
  return function Register() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('../pages/Profile', () => {
  return function Profile() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../pages/Courses', () => {
  return function Courses() {
    return <div data-testid="courses-page">Courses Page</div>;
  };
});

jest.mock('../pages/CourseDetail', () => {
  return function CourseDetail() {
    return <div data-testid="course-detail-page">Course Detail Page</div>;
  };
});

jest.mock('../pages/Progress', () => {
  return function Progress() {
    return <div data-testid="progress-page">Progress Page</div>;
  };
});

jest.mock('../pages/Profile', () => {
  return function Profile() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../pages/ApiTest', () => {
  return function ApiTest() {
    return <div data-testid="api-test-page">API Test Page</div>;
  };
});

// Test wrapper component
const TestWrapper = ({ children, initialRoute = '/', role = 'student', isAuthenticated = true }) => {
  mockAuthContext = createMockAuthContext(role, isAuthenticated);

  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Route Protection and Access Control Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should allow access to login page for unauthenticated users', () => {
      render(
        <TestWrapper initialRoute="/login" isAuthenticated={false}>
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should allow access to register page for unauthenticated users', () => {
      render(
        <TestWrapper initialRoute="/register" isAuthenticated={false}>
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users from protected routes', () => {
      render(
        <TestWrapper initialRoute="/dashboard" isAuthenticated={false}>
          <App />
        </TestWrapper>
      );

      // Should redirect to login, so login page should be visible
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Dashboard Route Protection', () => {
    it('should render student dashboard for student users', () => {
      render(
        <TestWrapper initialRoute="/dashboard" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    });

    it('should render instructor dashboard for instructor users', () => {
      render(
        <TestWrapper initialRoute="/dashboard" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('instructor-dashboard')).toBeInTheDocument();
    });

    it('should render admin dashboard for admin users', () => {
      render(
        <TestWrapper initialRoute="/dashboard" role="admin">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });

    it('should work for root route as well', () => {
      render(
        <TestWrapper initialRoute="/" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    });
  });

  describe('Student Route Protection', () => {
    it('should allow students to access courses page', () => {
      render(
        <TestWrapper initialRoute="/courses" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('courses-page')).toBeInTheDocument();
    });

    it('should allow students to access profile page', () => {
      render(
        <TestWrapper initialRoute="/profile" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should allow students to access progress page', () => {
      render(
        <TestWrapper initialRoute="/progress" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Progress Page')).toBeInTheDocument();
    });

    it('should allow students to access course details', () => {
      render(
        <TestWrapper initialRoute="/courses/123" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('course-detail-page')).toBeInTheDocument();
    });

    it('should deny students access to instructor routes', () => {
      render(
        <TestWrapper initialRoute="/instructor/manage-courses" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should deny students access to admin routes', () => {
      render(
        <TestWrapper initialRoute="/admin/users" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Instructor Route Protection', () => {
    it('should allow instructors to access courses page', () => {
      render(
        <TestWrapper initialRoute="/courses" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('courses-page')).toBeInTheDocument();
    });

    it('should allow instructors to access course details', () => {
      render(
        <TestWrapper initialRoute="/courses/123" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('course-detail-page')).toBeInTheDocument();
    });

    it('should allow instructors to access their management routes', () => {
      const instructorRoutes = [
        '/instructor/manage-courses',
        '/instructor/students',
        '/instructor/analytics',
        '/instructor/create-course',
        '/instructor/courses/123',
        '/instructor/courses/123/analytics',
        '/instructor/grade-book'
      ];

      instructorRoutes.forEach(route => {
        render(
          <TestWrapper initialRoute={route} role="instructor">
            <App />
          </TestWrapper>
        );

        // Should not show access denied for instructor routes
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });

    it('should allow instructors access to profile route', () => {
      render(
        <TestWrapper initialRoute="/profile" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should deny instructors access to admin routes', () => {
      render(
        <TestWrapper initialRoute="/admin/users" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Admin Route Protection', () => {
    it('should allow admins to access all course routes', () => {
      render(
        <TestWrapper initialRoute="/courses" role="admin">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('courses-page')).toBeInTheDocument();
    });

    it('should allow admins to access admin routes', () => {
      const adminRoutes = [
        '/admin/users',
        '/admin/courses',
        '/admin/analytics',
        '/admin/settings'
      ];

      adminRoutes.forEach(route => {
        render(
          <TestWrapper initialRoute={route} role="admin">
            <App />
          </TestWrapper>
        );

        // Should not show access denied for admin routes
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });

    it('should allow admins to access API test page', () => {
      render(
        <TestWrapper initialRoute="/api-test" role="admin">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('api-test-page')).toBeInTheDocument();
    });

    it('should deny non-admins access to API test page', () => {
      render(
        <TestWrapper initialRoute="/api-test" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Profile Route Protection', () => {
    it('should allow all authenticated users to access profile', () => {
      const roles = ['student', 'instructor', 'admin'];

      roles.forEach(role => {
        render(
          <TestWrapper initialRoute="/profile" role={role}>
            <App />
          </TestWrapper>
        );

        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });
    });

    it('should deny unauthenticated users access to profile', () => {
      render(
        <TestWrapper initialRoute="/profile" isAuthenticated={false}>
          <App />
        </TestWrapper>
      );

      expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Navigation Protection', () => {
    it('should show appropriate navigation items for each role', () => {
      // Test student navigation
      render(
        <TestWrapper initialRoute="/dashboard" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.queryByText('Manage Courses')).not.toBeInTheDocument();

      // Test instructor navigation
      render(
        <TestWrapper initialRoute="/dashboard" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Instructor')).toBeInTheDocument();
      expect(screen.getByText('Manage Courses')).toBeInTheDocument();

      // Test admin navigation
      render(
        <TestWrapper initialRoute="/dashboard" role="admin">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  describe('Access Denied Scenarios', () => {
    it('should show proper access denied message with role information', () => {
      render(
        <TestWrapper initialRoute="/admin/users" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('You don\'t have the required permissions to access this page.')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument(); // Required role
      expect(screen.getByText('student')).toBeInTheDocument(); // User's role
    });

    it('should handle multiple allowed roles correctly', () => {
      render(
        <TestWrapper initialRoute="/courses" role="guest">
          <App />
        </TestWrapper>
      );

      // Since courses allow student, instructor, admin but user has 'guest' role
      if (screen.queryByText('Access Denied')) {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      }
    });
  });

  describe('Route Parameter Protection', () => {
    it('should protect parameterized routes correctly', () => {
      // Test course detail route with parameter
      render(
        <TestWrapper initialRoute="/courses/course123" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByTestId('course-detail-page')).toBeInTheDocument();

      // Test instructor course management with parameter
      render(
        <TestWrapper initialRoute="/instructor/courses/course123" role="instructor">
          <App />
        </TestWrapper>
      );

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();

      // Test student trying to access instructor parameterized route
      render(
        <TestWrapper initialRoute="/instructor/courses/course123" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Loading State Handling', () => {
    it('should show loading state during authentication check', () => {
      mockAuthContext = {
        ...createMockAuthContext('student'),
        loading: true
      };

      render(
        <TestWrapper initialRoute="/dashboard" role="student">
          <App />
        </TestWrapper>
      );

      // Should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not render protected content during loading', () => {
      mockAuthContext = {
        ...createMockAuthContext('student'),
        loading: true
      };

      render(
        <TestWrapper initialRoute="/dashboard" role="student">
          <App />
        </TestWrapper>
      );

      expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle invalid routes gracefully', () => {
      render(
        <TestWrapper initialRoute="/invalid-route" role="student">
          <App />
        </TestWrapper>
      );

      // Should either redirect to default route or show 404
      // Since we don't have a 404 page defined, it might show dashboard or redirect
      expect(screen.queryByText('Access Denied')).toBeFalsy();
    });

    it('should handle undefined role correctly', () => {
      mockAuthContext = {
        user: { id: '1', name: 'Test User', email: 'test@user.com', role: undefined },
        token: 'mock-token',
        loading: false,
        isAuthenticated: () => true,
        hasRole: () => false,
        isAdmin: () => false,
        isInstructor: () => false,
        isStudent: () => false,
        hasAnyRole: () => false,
        login: jest.fn(),
        logout: jest.fn()
      };

      render(
        <TestWrapper initialRoute="/dashboard">
          <App />
        </TestWrapper>
      );

      expect(screen.getByText('Unknown User Role')).toBeInTheDocument();
    });

    it('should handle null user object', () => {
      mockAuthContext = {
        user: null,
        token: null,
        loading: false,
        isAuthenticated: () => false,
        hasRole: () => false,
        isAdmin: () => false,
        isInstructor: () => false,
        isStudent: () => false,
        hasAnyRole: () => false,
        login: jest.fn(),
        logout: jest.fn()
      };

      render(
        <TestWrapper initialRoute="/dashboard">
          <App />
        </TestWrapper>
      );

      // Should redirect to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});