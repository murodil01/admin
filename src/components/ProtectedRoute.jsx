import { Navigate } from 'react-router-dom';
import { useAuth, usePermissions } from '../hooks/usePermissions';

export const ProtectedRoute = ({ children, requiredRole, anyOfRoles }) => {
    const { user, loading } = useAuth();
    const { hasRole, hasAnyRole } = usePermissions();

    if (loading) {
        return <div>Loading authentication...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/forbidden" replace />;
    }

    if (anyOfRoles && !hasAnyRole(anyOfRoles)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
};