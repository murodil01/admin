// src/components/Permission.jsx
import { useAuth } from '../hooks/useAuth';
import { ROLES } from './constants/roles';

export const Permission = ({ children, anyOf = [] }) => {
    const { user } = useAuth();

    const hasPermission = anyOf.includes(user?.role);
    // console.log('Permission check:', {
    //     userRole: user?.role,
    //     requiredRoles: anyOf,
    //     match: anyOf.map(role => ({
    //         role,
    //         matches: role === user?.role
    //     }))
    // });

    // Permission komponentida
    // console.log('Deep check:', {
    //     userRole: user?.role,
    //     requiredRoles: anyOf,
    //     user: user, // butun user obyektini ko'rish
    //     windowROLES: window.ROLES // global holatda borligini tekshirish
    // });

    if (!hasPermission) {
        return null;
    }

    if (!user || !anyOf.includes(user.role)) {
        return null;
    }

    // console.log(typeof useAuth); // Should be "function"

    // Safely get user role in lowercase
    // const userRole = user?.role?.toLowerCase?.();

    // Filter out any undefined/null values from anyOf
    // const validRoles = anyOf.filter(role =>
    //     role && Object.values(ROLES).includes(role.toLowerCase())
    // );

    // Convert all to lowercase for comparison
    // const allowedRoles = validRoles.map(role => role.toLowerCase());

    // Harflarni kichik qilib solishtirish
    const hasAccess = anyOf.some(requiredRole =>
        requiredRole.toLowerCase() === user?.role?.toLowerCase()
    );

    // console.log('User role from backend:', user?.role);

    // console.log('Comparison:', {
    //     isFounder: user?.role === ROLES.FOUNDER,
    //     isManager: user?.role === ROLES.MANAGER
    // });

    // console.log('Permission check:', {
    //     userRole,
    //     requiredRoles: anyOf,
    //     validRoles,
    //     allowedRoles,
    //     hasAccess
    // });

    return hasAccess ? children : null;
};