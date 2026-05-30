import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RoleRoute = ({ allowed }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Allow specialized admins to access 'admin' routes
  const adminVariants = ['super_admin', 'course_admin', 'finance_admin', 'hr_admin'];
  if (allowed.includes('admin') && adminVariants.includes(user.role)) {
    return <Outlet />;
  }

  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default RoleRoute;


