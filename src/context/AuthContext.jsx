import { createContext, useState, useEffect } from 'react';
import api from '../api/base';
import { roleHierarchy, ROLES } from '../components/constants/roles';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true,
        error: null
    });

    const fetchUser = async () => {
        console.log('🔄 fetchUser started');
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            console.log('📡 Making API request to /me');
            
            const { data } = await api.get('me', {
                withCredentials: true,
                validateStatus: (status) => status < 500
            });

            console.log('📥 API response received:', data);

            if (!data?.id) {
                console.error('❌ User data incomplete - Missing ID');
                setAuthState({
                    user: null,
                    loading: false,
                    error: 'User data incomplete'
                });
                return null;
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
            console.error('❌ Auth error:', err.message, err.response);
            
            setAuthState({
                user: null,
                loading: false,
                error: err.message
            });

            // Clear auth state on error
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log('🗑️ Clearing tokens due to auth error');
                document.cookie = 'token=; Max-Age=0; path=/;';
                localStorage.removeItem('token');
            }
            
            // MUHIM: throw qilmaslik, chunki bu loading'ni to'xtatadi
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('🔑 Token check:', token ? `Token found: ${token.substring(0, 20)}...` : 'No token found');
            
            if (token) {
                console.log('🚀 Initializing auth with token');
                // Token bor, lekin API chaqiruvini kechiktirish
                setTimeout(async () => {
                    console.log('⏰ Starting delayed fetchUser');
                    await fetchUser();
                }, 100); // 100ms kechikish
            } else {
                console.log('⭕ No token, setting loading false');
                setAuthState({
                    user: null,
                    loading: false,
                    error: null
                });
            }
        };
        
        initAuth();
    }, []);

    const login = async (credentials) => {
        console.log('🔐 Login attempt started');
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            
            const { data } = await api.post('/login', credentials, {
                withCredentials: true
            });

            console.log('✅ Login successful, token:', data.token ? 'received' : 'not received');

            // If using JWT tokens
            if (data.token) {
                localStorage.setItem('token', data.token);
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
    };

    const logout = async () => {
        console.log('👋 Logout started');
        try {
            await api.post('/logout', {}, { withCredentials: true });
            console.log('✅ Logout API call successful');
        } catch (error) {
            console.error('❌ Logout error:', error);
        } finally {
            setAuthState({
                user: null,
                loading: false,
                error: null
            });
            document.cookie = 'token=; Max-Age=0; path=/;';
            localStorage.removeItem('token');
            console.log('🧹 Auth state cleared');
        }
    };

    // Log auth state changes
    useEffect(() => {
        console.log('📊 Auth state updated:', {
            user: authState.user ? `User: ${authState.user.first_name || authState.user.email}` : 'No user',
            loading: authState.loading,
            error: authState.error,
            isAuthenticated: !!authState.user
        });
    }, [authState]);

    const value = {
        user: authState.user,
        loading: authState.loading,
        isLoading: authState.loading, // Navbar uchun
        error: authState.error,
        isAuthenticated: !!authState.user,
        role: authState.user?.role,
        isFounder: authState.user?.role === 'founder',
        isManager: authState.user ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.MANAGER] : false,
        isHeads: authState.user ? roleHierarchy[authState.user.role] >= roleHierarchy[ROLES.HEADS] : false,
        isEmployee: authState.user?.role === 'employee',
        login,
        logout,
        refreshAuth: fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};