import { createContext, useState, useEffect } from 'react';
import api from '../api/base';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/me', {
                withCredentials: true,
                validateStatus: (status) => status < 500
            });

            if (!data?.id) {
                throw new Error('User data incomplete - Missing ID');
            }

            // Normalize user data structure
            const userData = {
                id: data.id,
                email: data.email,
                role: data.role?.toLowerCase() || 'user', // Ensure lowercase for consistency
                ...data // Include any additional fields
            };

            setUser(userData);
            setError(null);
            return userData;
        } catch (err) {
            console.error('Auth error:', err.message);
            setUser(null);
            setError(err.message);
            // Clear auth state on error
            document.cookie = 'token=; Max-Age=0; path=/;';
            localStorage.removeItem('token');
            throw err; // Re-throw for calling functions
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const { data } = await api.post('/login', credentials, {
                withCredentials: true
            });

            // If using JWT tokens
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            const userData = await fetchUser(); // Refresh user data
            return { success: true, user: userData };
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout', {}, { withCredentials: true });
        } finally {
            setUser(null);
            setError(null);
            // Clear all auth tokens
            document.cookie = 'token=; Max-Age=0; path=/;';
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isFounder: user?.role === 'founder',
        isManager: ['founder', 'manager'].includes(user?.role),
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