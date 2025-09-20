import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Loading holatida
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User yo'q bo'lsa login'ga yo'naltirish
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // User bor bo'lsa child components render qilish
  return <Outlet />;
};

export default PrivateRoute;