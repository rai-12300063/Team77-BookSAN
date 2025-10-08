import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  instructorOnly = false,
  allowedRoles = [],
  requireRole = null 
}) => {
  const { isAuthenticated, loading, user, hasRole, hasAnyRole } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based authorization
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
          <p className="text-sm text-red-500 mt-2">Admin access required.</p>
        </div>
      </div>
    );
  }

  if (instructorOnly && user?.role !== 'instructor') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
          <p className="text-sm text-red-500 mt-2">Instructor access required.</p>
        </div>
      </div>
    );
  }

  if (requireRole && (!hasRole || !hasRole(requireRole))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
          <p className="text-sm text-red-500 mt-2">{requireRole} role required.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && (!hasAnyRole || !hasAnyRole(allowedRoles))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
          <p className="text-sm text-red-500 mt-2">Required roles: {allowedRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  // Render the protected component if all checks pass
  return children;
};

export default ProtectedRoute;
