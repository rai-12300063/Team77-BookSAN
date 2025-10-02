import React from 'react';
import usePermissions from '../hooks/usePermissions';

const PermissionGate = ({
  children,
  resource,
  action,
  fallback = null,
  showFallback = false,
  requireAll = false,
  permissions: customPermissions = []
}) => {
  const { canAccess } = usePermissions();

  const hasPermission = () => {
    // If custom permissions array is provided
    if (customPermissions.length > 0) {
      if (requireAll) {
        return customPermissions.every(perm => canAccess(perm.resource, perm.action));
      } else {
        return customPermissions.some(perm => canAccess(perm.resource, perm.action));
      }
    }

    // Single resource/action check
    if (resource && action) {
      return canAccess(resource, action);
    }

    return false;
  };

  if (!hasPermission()) {
    return showFallback ? fallback : null;
  }

  return children;
};

export default PermissionGate;

// Convenience components for common permission patterns
export const CanReadUsers = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="users" action="read" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanWriteUsers = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="users" action="write" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanDeleteUsers = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="users" action="delete" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanManageCourses = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="courses" action="manage" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanViewSystemAnalytics = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="analytics" action="viewSystem" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanAccessSystemSettings = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="settings" action="systemSettings" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanManageStudents = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="students" action="manage" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanSubmitTasks = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="tasks" action="submit" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);

export const CanCreateTasks = ({ children, fallback, showFallback = false }) => (
  <PermissionGate resource="tasks" action="write" fallback={fallback} showFallback={showFallback}>
    {children}
  </PermissionGate>
);