import { useAuth } from '../hooks/useAuth';
import { memo } from 'react';

export const Permission = memo(({ children, anyOf = [] }) => {
    const { user, loading } = useAuth();

    if (loading || !user) return null;

    const userRole = user.role?.toLowerCase();
    const hasAccess = anyOf.some(role =>
        role.toLowerCase() === userRole
    );

    return hasAccess ? children : null;
});