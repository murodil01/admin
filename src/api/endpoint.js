const endpoints = {
    auth: {
        login: "/auth/login",
        register: "/auth/register",
        me: "/auth/me",
    },
    users: {
        getAll: "/users",
        getById: (id) => `/users/${id}`,
        update: (id) => `/users/${id}`,
        delete: (id) => `/users/${id}`,
    },
    projects: {
        getAll: "/tasks",
        create: "/tasks",
        getById: (id) => `/tasks/${id}`,
        update: (id) => `/tasks/${id}`,
        delete: (id) => `/tasks/${id}`,
    },
};

export default endpoints;