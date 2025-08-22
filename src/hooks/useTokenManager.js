// hooks/useTokenManager.js
import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';

const useTokenManager = () => {
  const [tokenExpired, setTokenExpired] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Token ekspayrlanganda ishlaydigan funksiya
  const handleTokenExpiration = useCallback((showMessage = true) => {
    if (tokenExpired || redirecting) return;

    setTokenExpired(true);
    setRedirecting(true);
    
    // Tokenlarni tozalash
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("tokenWarningShown");
    
    if (showMessage) {
      message.error("Session expired. Redirecting to login...");
    }
    
    // Avtomatik redirect
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  }, [tokenExpired, redirecting]);

  // Token validligini tekshirish
  const checkTokenValidity = useCallback(() => {
    if (tokenExpired || redirecting) return false;

    const token = localStorage.getItem("token");
    if (!token) {
      handleTokenExpiration(false);
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Token eskirgan
      if (currentTime >= expirationTime) {
        handleTokenExpiration();
        return false;
      }
      
      // 5 minut qolganda ogohlantirish (faqat bir marta)
      const timeLeft = expirationTime - currentTime;
      const minutesLeft = Math.floor(timeLeft / 60000);
      
      if (minutesLeft <= 5 && minutesLeft > 0) {
        const warningShown = sessionStorage.getItem('tokenWarningShown');
        if (!warningShown) {
          message.warning(`Session will expire in ${minutesLeft} minutes. Please save your work.`);
          sessionStorage.setItem('tokenWarningShown', 'true');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      handleTokenExpiration();
      return false;
    }
  }, [tokenExpired, redirecting, handleTokenExpiration]);

  // API request xatoliklarini tekshirish (optional - sahifalarda ishlatish uchun)
  const checkApiError = useCallback((error) => {
    if (error?.response?.status === 401) {
      handleTokenExpiration();
      return true;
    }
    return false;
  }, [handleTokenExpiration]);

  // Component mount bo'lganda va har 30 soniyada tekshirish
  useEffect(() => {
    // Login page'da token tekshirmaslik
    if (window.location.pathname === '/login' || window.location.pathname === '/verify-password') {
      return;
    }

    checkTokenValidity();
    
    const interval = setInterval(() => {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/verify-password') {
        checkTokenValidity();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  return {
    tokenExpired,
    redirecting,
    checkTokenValidity,
    checkApiError,
    handleTokenExpiration
  };
};

export default useTokenManager;