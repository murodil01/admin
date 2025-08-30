import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/base';
import { roleHierarchy, ROLES } from '../components/constants/roles';

const AuthContext = createContext();

export default AuthContext;

// Token expiry checker
const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true,
        error: null
    });

    // Refresh timer reference
    const refreshTimerRef = useRef(null);
    const isRefreshingRef = useRef(false);

    // Clear refresh timer
    const clearRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    // Set up automatic token refresh
    const setupAutoRefresh = useCallback((token) => {
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000;
            const currentTime = Date.now();
            
            // Refresh 5 minutes before expiry
            const refreshTime = expiryTime - currentTime - 5 * 60 * 1000;
            
            if (refreshTime > 0) {
                console.log(`🔄 Auto refresh scheduled in ${Math.floor(refreshTime / 1000 / 60)} minutes`);
                
                clearRefreshTimer();
                refreshTimerRef.current = setTimeout(() => {
                    console.log('⏰ Auto refresh triggered');
                    refreshTokens();
                }, refreshTime);
            }
        } catch (error) {
            console.error('❌ Error setting up auto refresh:', error);
        }
    }, []);

    // Refresh tokens function
    const refreshTokens = useCallback(async () => {
        // Prevent concurrent refresh attempts
        if (isRefreshingRef.current) {
            console.log('🔄 Refresh already in progress, skipping...');
            return false;
        }

        isRefreshingRef.current = true;
        console.log('🔄 Refreshing tokens...');

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                console.log('❌ No refresh token found');
                throw new Error('No refresh token available');
            }

            const { data } = await api.post('/auth/refresh', {
                refreshToken
            }, {
                withCredentials: true,
                validateStatus: (status) => status < 500
            });

            if (data.accessToken) {
                console.log('✅ Tokens refreshed successfully');
                localStorage.setItem('token', data.accessToken);
                
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                // Setup next auto refresh
                setupAutoRefresh(data.accessToken);
                
                // Update user data
                await fetchUser();
                return true;
            } else {
                throw new Error('No access token in response');
            }
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            
            // Clear tokens and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            document.cookie = 'token=; Max-Age=0; path=/;';
            
            setAuthState({
                user: null,
                loading: false,
                error: 'Session expired. Please login again.'
            });

            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    // Optimized fetchUser with retry logic
    const fetchUser = useCallback(async (retryCount = 0) => {
        console.log('🔄 fetchUser started');
        
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            
            const token = localStorage.getItem('token');
            
            // Check if token is expired
            if (token && isTokenExpired(token)) {
                console.log('⚠️ Token expired, attempting refresh...');
                const refreshSuccess = await refreshTokens();
                
                if (!refreshSuccess) {
                    return null;
                }
            }

            console.log('📡 Making API request to /me');
            
            const { data } = await api.get('me', {
                withCredentials: true,
                validateStatus: (status) => status < 500
            });

            console.log('📥 API response received:', data);

            if (!data?.id) {
                throw new Error('User data incomplete - Missing ID');
            }

            // Normalize user data structure
            const userData = {
                id: data.id,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                profile_picture: data.profile_picture,
                role: data.role?.toLowerCase() || 'user',
                ...data
            };

            console.log('✅ User data normalized:', userData);

            setAuthState({
                user: userData,
                loading: false,
                error: null
            });

            return userData;
            
        } catch (err) {
            console.error('❌ Auth error:', err.message);
            
            // Retry once with token refresh for 401/403 errors
            if ((err.response?.status === 401 || err.response?.status === 403) && retryCount === 0) {
                console.log('🔄 Attempting token refresh and retry...');
                const refreshSuccess = await refreshTokens();
                
                if (refreshSuccess) {
                    return fetchUser(1); // Retry once
                }
            }
            
            setAuthState({
                user: null,
                loading: false,
                error: err.message
            });

            // Clear tokens on persistent auth errors
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log('🗑️ Clearing tokens due to auth error');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                document.cookie = 'token=; Max-Age=0; path=/;';
                clearRefreshTimer();
            }
            
            return null;
        }
    }, [refreshTokens, clearRefreshTimer]);

    // Initialize auth on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            
            console.log('🔑 Token check:', {
                accessToken: token ? `Found: ${token.substring(0, 20)}...` : 'Not found',
                refreshToken: refreshToken ? 'Found' : 'Not found'
            });
            
            if (token) {
                // Check if token is expired
                if (isTokenExpired(token)) {
                    console.log('⚠️ Access token expired on init');
                    
                    if (refreshToken) {
                        console.log('🔄 Attempting initial token refresh...');
                        const refreshSuccess = await refreshTokens();
                        
                        if (refreshSuccess) {
                            return; // fetchUser will be called in refreshTokens
                        }
                    }
                    
                    // No valid tokens, clear state
                    console.log('❌ No valid tokens, clearing state');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setAuthState({
                        user: null,
                        loading: false,
                        error: null
                    });
                    return;
                }
                
                console.log('🚀 Valid token found, fetching user');
                setupAutoRefresh(token);
                await fetchUser();
            } else {
                console.log('⭕ No access token found');
                setAuthState({
                    user: null,
                    loading: false,
                    error: null
                });
            }
        };
        
        initAuth();

        // Cleanup on unmount
        return () => {
            clearRefreshTimer();
        };
    }, [fetchUser, refreshTokens, setupAutoRefresh, clearRefreshTimer]);

    // Enhanced login function
    const login = useCallback(async (credentials) => {
        console.log('🔐 Login attempt started');
        
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            
            const { data } = await api.post('/auth/login', credentials, {
                withCredentials: true
            });

            console.log('✅ Login successful');

            // Store tokens
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                setupAutoRefresh(data.accessToken);
            }
            
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            const userData = await fetchUser();
            return { success: true, user: userData };
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            console.error('❌ Login error:', errorMsg);
            
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: errorMsg
            }));
            
            return { success: false, error: errorMsg };
        }
    }, [fetchUser, setupAutoRefresh]);

    // Enhanced logout function
    const logout = useCallback(async () => {
        console.log('👋 Logout started');
        
        // Clear refresh timer immediately
        clearRefreshTimer();
        
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            await api.post('/auth/logout', {
                refreshToken
            }, { 
                withCredentials: true 
            });
            
            console.log('✅ Logout API call successful');
        } catch (error) {
            console.error('❌ Logout error:', error);
        } finally {
            // Clear all auth data
            setAuthState({
                user: null,
                loading: false,
                error: null
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            document.cookie = 'token=; Max-Age=0; path=/;';
            
            console.log('🧹 Auth state cleared');
        }
    }, [clearRefreshTimer]);

    // Log auth state changes (in development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Auth state updated:', {
                user: authState.user ? `User: ${authState.user.first_name || authState.user.email}` : 'No user',
                loading: authState.loading,
                error: authState.error,
                isAuthenticated: !!authState.user
            });
        }
    }, [authState]);

    // Memoized context value
    const contextValue = {
        user: authState.user,
        loading: authState.loading,
        isLoading: authState.loading,
        error: authState.error,
        isAuthenticated: !!authState.user,
        role: authState.user?.role,
        isFounder: authState.user?.role === 'founder',
        isManager: authState.user ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.MANAGER] : false,
        isHeads: authState.user ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.HEADS] : false,
        isEmployee: authState.user?.role === 'employee',
        
        // Methods
        login,
        logout,
        refreshAuth: fetchUser,
        refreshTokens
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};