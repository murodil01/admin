import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/base";
import { roleHierarchy, ROLES } from "../components/constants/roles";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  // User ma'lumotlarini olish
  const fetchUser = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthState({ user: null, loading: false, error: null });
        return null;
      }

      const { data } = await api.get("me/");

      if (!data?.id) {
        throw new Error("Invalid user data");
      }

      const userData = {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_picture: data.profile_picture,
        role: data.role?.toLowerCase() || "user",
        ...data,
      };

      setAuthState({
        user: userData,
        loading: false,
        error: null,
      });

      return userData;
    } catch (error) {
      console.error("Auth error:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
      
      setAuthState({
        user: null,
        loading: false,
        error: error.message,
      });
      
      return null;
    }
  }, []);

  // Login funksiyasi
  const login = useCallback(async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await api.post("token/", credentials);

      console.log("Login response:", data); // Debug uchun
        // Django JWT token format: {access: "...", refresh: "..."}
        if (data.access) {
          localStorage.setItem("token", data.access);
          console.log("Token saved:", data.access.substring(0, 20) + "...");
        }
        if (data.refresh) {
          localStorage.setItem("refreshToken", data.refresh);
          console.log("Refresh token saved");
        }

      // Agar boshqa format bo'lsa
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // User ma'lumotlarini olish
      const userData = await fetchUser();
      return { success: true, user: userData };
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.detail || 
                      error.message;
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));

      return { success: false, error: errorMsg };
    }
  }, [fetchUser]);

  // Logout funksiyasi
  // const logout = useCallback(async () => {
  //   try {
  //     const refreshToken = localStorage.getItem("refreshToken");
      
  //     if (refreshToken) {
  //       await api.post("logout/", { refreshToken });
  //     }
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   } finally {
  //     // Har qanday holatda ham tokenlarni tozalash
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("refreshToken");
      
  //     setAuthState({
  //       user: null,
  //       loading: false,
  //       error: null,
  //     });
  //   }
  // }, []);

  const logout = useCallback(async () => {
    // Server'ga logout so'rovi yubormasdan tokenlarni tozalash
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    setAuthState({
      user: null,
      loading: false,
      error: null,
    });
  }, []);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        console.log("Found token on init:", token.substring(0, 20) + "...");
        await fetchUser();
      } else {
        console.log("No token found on init");
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, [fetchUser]);

  // Context value
  const contextValue = {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    role: authState.user?.role,
    isFounder: authState.user?.role === "founder",
    isManager: authState.user
      ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.MANAGER]
      : false,
    isHeads: authState.user
      ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.HEADS]
      : false,
    isEmployee: authState.user?.role === "employee",

    // Methods
    login,
    logout,
    refreshAuth: fetchUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};