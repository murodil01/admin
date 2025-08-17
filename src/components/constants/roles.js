export const ROLES = {
    FOUNDER: 'founder',
    MANAGER: 'manager',
    HEADS: 'heads',
    EMPLOYEE: 'employee'
};

export const roleHierarchy = {
    [ROLES.FOUNDER]: 4,
    [ROLES.MANAGER]: 3,
    [ROLES.HEADS]: 2,
    [ROLES.EMPLOYEE]: 1
};