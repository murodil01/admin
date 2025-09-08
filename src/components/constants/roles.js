export const ROLES = {
    FOUNDER: 'founder',
    MANAGER: 'manager',
    HEADS: 'heads',
    DEP_MANAGER: 'dep_manager',
    EMPLOYEE: 'employee'
};

export const roleHierarchy = {
    [ROLES.FOUNDER]: 5,
    [ROLES.MANAGER]: 4,
    [ROLES.DEP_MANAGER]: 3,
    [ROLES.HEADS]: 2,
    [ROLES.EMPLOYEE]: 1
};