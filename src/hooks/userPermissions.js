import { roleHierarchy, ROLES } from '../components/constants/roles';
import { useAuth } from './useAuth';

export const usePermissions = () => {
    const { user } = useAuth();

    const hasRole = (requiredRole) => {
        if (!user || !user.role) return false;
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    };

    const hasAnyRole = (requiredRoles) => {
        if (!user || !user.role) return false;
        return requiredRoles.some(role => roleHierarchy[user.role] >= roleHierarchy[role]);
    };

    return {
        hasRole,
        hasAnyRole,
        isFounder: hasRole(ROLES.FOUNDER),
        isManager: hasRole(ROLES.MANAGER),
        isHeads: hasRole(ROLES.HEADS),
        isEmployee: hasRole(ROLES.EMPLOYEE),
        ROLES
    };
};

export default usePermissions;