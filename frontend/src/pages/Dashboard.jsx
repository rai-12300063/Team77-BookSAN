import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import InstructorDashboard from '../components/dashboards/InstructorDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
  const { isAdmin, isInstructor, isStudent, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (isAdmin()) {
    return <AdminDashboard />;
  } else if (isInstructor()) {
    return <InstructorDashboard />;
  } else if (isStudent()) {
    return <StudentDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Unknown User Role</h2>
        <p className="text-gray-600 mb-4">
          Your account doesn't have a recognized role assigned.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Please contact your administrator for assistance.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
