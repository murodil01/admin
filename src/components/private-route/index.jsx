// components/private-route.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useTokenManager from '../../hooks/useTokenManager';
import TokenExpiredScreen from '../../components/TokenExpiredScreen';

const PrivateRoute = () => {
  // Global token management - barcha protected routes uchun
  const { tokenExpired, redirecting } = useTokenManager();

  // Token eskirgan bo'lsa qizil ekran
  if (tokenExpired || redirecting) {
    return <TokenExpiredScreen />;
  }

  // Token yo'q bo'lsa login'ga yo'naltirish
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token bor va hali eskirmaganida - child components render qilish
  return <Outlet />;
};

export default PrivateRoute;