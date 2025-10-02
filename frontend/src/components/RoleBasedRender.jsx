import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Component for conditional rendering based on user roles
 *
 * Usage examples:
 * <RoleBasedRender allowedRoles={['admin', 'instructor']}>
 *   <AdminOrInstructorOnlyContent />
 * </RoleBasedRender>
 *
 * <RoleBasedRender requireRole="admin">
 *   <AdminOnlyContent />
 * </RoleBasedRender>
 *
 * <RoleBasedRender allowedRoles={['student']} fallback={<div>Access denied</div>}>
 *   <StudentOnlyContent />
 * </RoleBasedRender>
 */
const RoleBasedRender = ({
  children,
  allowedRoles = [],
  requireRole = null,
  fallback = null,
  showFallback = false
}) => {
  const { hasRole, hasAnyRole, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated()) {
    return showFallback ? fallback : null;
  }

  // Check specific role requirement
  if (requireRole && !hasRole(requireRole)) {
    return showFallback ? fallback : null;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return showFallback ? fallback : null;
  }

  // If all checks pass, render children
  return children;
};

export default RoleBasedRender;

// Convenience components for specific roles
export const AdminOnly = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender requireRole="admin" fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);

export const InstructorOnly = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender requireRole="instructor" fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);

export const StudentOnly = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender requireRole="student" fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);

export const InstructorOrAdmin = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender allowedRoles={['instructor', 'admin']} fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);

export const StudentOrInstructor = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender allowedRoles={['student', 'instructor']} fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);

export const AnyAuthenticatedUser = ({ children, fallback = null, showFallback = false }) => (
  <RoleBasedRender allowedRoles={['student', 'instructor', 'admin']} fallback={fallback} showFallback={showFallback}>
    {children}
  </RoleBasedRender>
);