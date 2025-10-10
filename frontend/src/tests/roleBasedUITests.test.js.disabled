import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import RoleBasedRender, {
  AdminOnly,
  InstructorOnly,
  StudentOnly,
  InstructorOrAdmin,
  AnyAuthenticatedUser
} from '../components/RoleBasedRender';
import Navbar from '../components/Navbar';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import PermissionGate, { CanReadUsers, CanWriteUsers, CanDeleteUsers } from '../components/PermissionGate';

// Global mock context that will be set in tests
let mockAuthContext = null;

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
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => mockAuthContext
}));

// Mock usePermissions hook
jest.mock('../hooks/usePermissions', () => ({
  __esModule: true,
  default: () => ({
    permissions: {
      users: { read: mockAuthContext?.user?.role === 'admin', write: mockAuthContext?.user?.role === 'admin', delete: mockAuthContext?.user?.role === 'admin' },
      courses: { read: true, manage: ['admin', 'instructor'].includes(mockAuthContext?.user?.role), viewAll: mockAuthContext?.user?.role === 'admin' },
      students: { manage: ['admin', 'instructor'].includes(mockAuthContext?.user?.role) },
      tasks: { submit: mockAuthContext?.user?.role === 'student' },
      analytics: { viewSystem: mockAuthContext?.user?.role === 'admin', viewCourse: ['admin', 'instructor'].includes(mockAuthContext?.user?.role), viewOwnProgress: mockAuthContext?.user?.role === 'student' },
      settings: { systemSettings: mockAuthContext?.user?.role === 'admin' }
    },
    canAccess: (resource, action) => {
      const permissions = {
        users: { read: mockAuthContext?.user?.role === 'admin', write: mockAuthContext?.user?.role === 'admin', delete: mockAuthContext?.user?.role === 'admin' },
        courses: { read: true, manage: ['admin', 'instructor'].includes(mockAuthContext?.user?.role), viewAll: mockAuthContext?.user?.role === 'admin' },
        students: { manage: ['admin', 'instructor'].includes(mockAuthContext?.user?.role) },
        tasks: { submit: mockAuthContext?.user?.role === 'student' },
        analytics: { viewSystem: mockAuthContext?.user?.role === 'admin', viewCourse: ['admin', 'instructor'].includes(mockAuthContext?.user?.role), viewOwnProgress: mockAuthContext?.user?.role === 'student' },
        settings: { systemSettings: mockAuthContext?.user?.role === 'admin' }
      };
      return permissions[resource]?.[action] || false;
    },
    canManageUser: (targetRole) => mockAuthContext?.user?.role === 'admin',
    isAdmin: mockAuthContext?.user?.role === 'admin',
    isInstructor: mockAuthContext?.user?.role === 'instructor',
    isStudent: mockAuthContext?.user?.role === 'student'
  })
}));

// Test wrapper component
const TestWrapper = ({ children, role = 'student', isAuthenticated = true }) => {
  mockAuthContext = createMockAuthContext(role, isAuthenticated);

  return (
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Role-Based UI Component Visibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RoleBasedRender Component', () => {
    it('should render content for users with correct role', () => {
      render(
        <TestWrapper role="admin">
          <RoleBasedRender requireRole="admin">
            <div>Admin Content</div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should not render content for users without correct role', () => {
      render(
        <TestWrapper role="student">
          <RoleBasedRender requireRole="admin">
            <div>Admin Content</div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should render content for users with any of the allowed roles', () => {
      render(
        <TestWrapper role="instructor">
          <RoleBasedRender allowedRoles={['admin', 'instructor']}>
            <div>Instructor or Admin Content</div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.getByText('Instructor or Admin Content')).toBeInTheDocument();
    });

    it('should show fallback content when showFallback is true', () => {
      render(
        <TestWrapper role="student">
          <RoleBasedRender
            requireRole="admin"
            fallback={<div>Access Denied</div>}
            showFallback={true}
          >
            <div>Admin Content</div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should not render anything for unauthenticated users', () => {
      render(
        <TestWrapper isAuthenticated={false}>
          <RoleBasedRender allowedRoles={['student', 'instructor', 'admin']}>
            <div>Authenticated Content</div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.queryByText('Authenticated Content')).not.toBeInTheDocument();
    });
  });

  describe('Convenience Role Components', () => {
    it('AdminOnly should only render for admin users', () => {
      const { rerender } = render(
        <TestWrapper role="admin">
          <AdminOnly>
            <div>Admin Only Content</div>
          </AdminOnly>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Only Content')).toBeInTheDocument();

      // Test with non-admin user
      rerender(
        <TestWrapper role="student">
          <AdminOnly>
            <div>Admin Only Content</div>
          </AdminOnly>
        </TestWrapper>
      );

      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });

    it('InstructorOnly should only render for instructor users', () => {
      render(
        <TestWrapper role="instructor">
          <InstructorOnly>
            <div>Instructor Only Content</div>
          </InstructorOnly>
        </TestWrapper>
      );

      expect(screen.getByText('Instructor Only Content')).toBeInTheDocument();
    });

    it('StudentOnly should only render for student users', () => {
      render(
        <TestWrapper role="student">
          <StudentOnly>
            <div>Student Only Content</div>
          </StudentOnly>
        </TestWrapper>
      );

      expect(screen.getByText('Student Only Content')).toBeInTheDocument();
    });

    it('InstructorOrAdmin should render for both instructors and admins', () => {
      const { rerender } = render(
        <TestWrapper role="instructor">
          <InstructorOrAdmin>
            <div>Instructor or Admin Content</div>
          </InstructorOrAdmin>
        </TestWrapper>
      );

      expect(screen.getByText('Instructor or Admin Content')).toBeInTheDocument();

      rerender(
        <TestWrapper role="admin">
          <InstructorOrAdmin>
            <div>Instructor or Admin Content</div>
          </InstructorOrAdmin>
        </TestWrapper>
      );

      expect(screen.getByText('Instructor or Admin Content')).toBeInTheDocument();

      rerender(
        <TestWrapper role="student">
          <InstructorOrAdmin>
            <div>Instructor or Admin Content</div>
          </InstructorOrAdmin>
        </TestWrapper>
      );

      expect(screen.queryByText('Instructor or Admin Content')).not.toBeInTheDocument();
    });

    it('AnyAuthenticatedUser should render for all authenticated users', () => {
      const roles = ['student', 'instructor', 'admin'];

      roles.forEach(role => {
        const { rerender } = render(
          <TestWrapper role={role}>
            <AnyAuthenticatedUser>
              <div>Authenticated User Content</div>
            </AnyAuthenticatedUser>
          </TestWrapper>
        );

        expect(screen.getByText('Authenticated User Content')).toBeInTheDocument();
      });
    });
  });

  describe('Navbar Role-Based Navigation', () => {
    it('should show student navigation for student users', () => {
      render(
        <TestWrapper role="student">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('My Courses')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.queryByText('Manage Courses')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('should show instructor navigation for instructor users', () => {
      render(
        <TestWrapper role="instructor">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Manage Courses')).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('should show admin navigation for admin users', () => {
      render(
        <TestWrapper role="admin">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('All Courses')).toBeInTheDocument();
      expect(screen.getByText('System Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('should display correct role information', () => {
      const { rerender } = render(
        <TestWrapper role="student">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Student')).toBeInTheDocument();

      rerender(
        <TestWrapper role="instructor">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Instructor')).toBeInTheDocument();

      rerender(
        <TestWrapper role="admin">
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should show login/register for unauthenticated users', () => {
      render(
        <TestWrapper isAuthenticated={false}>
          <Navbar />
        </TestWrapper>
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Dashboard Role-Based Rendering', () => {
    // Mock the dashboard components
    jest.mock('../components/dashboards/StudentDashboard', () => {
      return function StudentDashboard() {
        return <div>Student Dashboard</div>;
      };
    });

    jest.mock('../components/dashboards/InstructorDashboard', () => {
      return function InstructorDashboard() {
        return <div>Instructor Dashboard</div>;
      };
    });

    jest.mock('../components/dashboards/AdminDashboard', () => {
      return function AdminDashboard() {
        return <div>Admin Dashboard</div>;
      };
    });

    it('should render student dashboard for student users', async () => {
      render(
        <TestWrapper role="student">
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
      });
    });

    it('should render instructor dashboard for instructor users', async () => {
      render(
        <TestWrapper role="instructor">
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Instructor Dashboard')).toBeInTheDocument();
      });
    });

    it('should render admin dashboard for admin users', async () => {
      render(
        <TestWrapper role="admin">
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should show unknown role error for invalid roles', async () => {
      // Create mock context with invalid role
      mockAuthContext = {
        ...createMockAuthContext('invalid_role'),
        isAdmin: () => false,
        isInstructor: () => false,
        isStudent: () => false
      };

      render(
        <TestWrapper role="invalid_role">
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Unknown User Role')).toBeInTheDocument();
      });
    });
  });

  describe('ProtectedRoute Component', () => {
    const TestComponent = () => <div>Protected Content</div>;

    it('should render content for authenticated users', () => {
      render(
        <TestWrapper role="student">
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users', () => {
      // Mock navigate function
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        Navigate: ({ to }) => {
          mockNavigate(to);
          return <div>Redirecting to {to}</div>;
        }
      }));

      render(
        <TestWrapper isAuthenticated={false}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should enforce role-based access with requireRole', () => {
      render(
        <TestWrapper role="student">
          <ProtectedRoute requireRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should enforce role-based access with allowedRoles', () => {
      render(
        <TestWrapper role="student">
          <ProtectedRoute allowedRoles={['admin', 'instructor']}>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should allow access when user has correct role', () => {
      render(
        <TestWrapper role="admin">
          <ProtectedRoute requireRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockAuthContext = {
        ...createMockAuthContext('student'),
        loading: true
      };

      render(
        <TestWrapper role="student">
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should show loading spinner
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('PermissionGate Component', () => {
    it('should render content when user has required permission', () => {
      render(
        <TestWrapper role="admin">
          <PermissionGate resource="users" action="read">
            <div>User Management Content</div>
          </PermissionGate>
        </TestWrapper>
      );

      expect(screen.getByText('User Management Content')).toBeInTheDocument();
    });

    it('should not render content when user lacks required permission', () => {
      render(
        <TestWrapper role="student">
          <PermissionGate resource="users" action="read">
            <div>User Management Content</div>
          </PermissionGate>
        </TestWrapper>
      );

      expect(screen.queryByText('User Management Content')).not.toBeInTheDocument();
    });

    it('should handle multiple permissions with requireAll=true', () => {
      render(
        <TestWrapper role="admin">
          <PermissionGate
            permissions={[
              { resource: 'users', action: 'read' },
              { resource: 'users', action: 'write' }
            ]}
            requireAll={true}
          >
            <div>Full User Management</div>
          </PermissionGate>
        </TestWrapper>
      );

      expect(screen.getByText('Full User Management')).toBeInTheDocument();
    });

    it('should handle multiple permissions with requireAll=false', () => {
      render(
        <TestWrapper role="instructor">
          <PermissionGate
            permissions={[
              { resource: 'users', action: 'read' },
              { resource: 'courses', action: 'manage' }
            ]}
            requireAll={false}
          >
            <div>Instructor Content</div>
          </PermissionGate>
        </TestWrapper>
      );

      expect(screen.getByText('Instructor Content')).toBeInTheDocument();
    });

    describe('Convenience Permission Components', () => {
      it('CanReadUsers should only render for admin users', () => {
        render(
          <TestWrapper role="admin">
            <CanReadUsers>
              <div>Read Users Content</div>
            </CanReadUsers>
          </TestWrapper>
        );

        expect(screen.getByText('Read Users Content')).toBeInTheDocument();
      });

      it('CanWriteUsers should only render for admin users', () => {
        render(
          <TestWrapper role="student">
            <CanWriteUsers>
              <div>Write Users Content</div>
            </CanWriteUsers>
          </TestWrapper>
        );

        expect(screen.queryByText('Write Users Content')).not.toBeInTheDocument();
      });

      it('CanDeleteUsers should only render for admin users', () => {
        render(
          <TestWrapper role="admin">
            <CanDeleteUsers>
              <div>Delete Users Content</div>
            </CanDeleteUsers>
          </TestWrapper>
        );

        expect(screen.getByText('Delete Users Content')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Role-Based Scenarios', () => {
    it('should handle nested role-based components', () => {
      render(
        <TestWrapper role="admin">
          <RoleBasedRender allowedRoles={['admin', 'instructor']}>
            <div>
              <AdminOnly>
                <div>Admin Specific Section</div>
              </AdminOnly>
              <InstructorOnly>
                <div>Instructor Specific Section</div>
              </InstructorOnly>
              <div>General Section</div>
            </div>
          </RoleBasedRender>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Specific Section')).toBeInTheDocument();
      expect(screen.queryByText('Instructor Specific Section')).not.toBeInTheDocument();
      expect(screen.getByText('General Section')).toBeInTheDocument();
    });

    it('should handle role changes dynamically', () => {
      const { rerender } = render(
        <TestWrapper role="student">
          <StudentOnly>
            <div>Student Content</div>
          </StudentOnly>
          <InstructorOnly>
            <div>Instructor Content</div>
          </InstructorOnly>
        </TestWrapper>
      );

      expect(screen.getByText('Student Content')).toBeInTheDocument();
      expect(screen.queryByText('Instructor Content')).not.toBeInTheDocument();

      // Simulate role change
      rerender(
        <TestWrapper role="instructor">
          <StudentOnly>
            <div>Student Content</div>
          </StudentOnly>
          <InstructorOnly>
            <div>Instructor Content</div>
          </InstructorOnly>
        </TestWrapper>
      );

      expect(screen.queryByText('Student Content')).not.toBeInTheDocument();
      expect(screen.getByText('Instructor Content')).toBeInTheDocument();
    });
  });
});