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
    tasks: {
        getAll: "/tasks",
        create: "/tasks",
        getById: (id) => `/tasks/${id}`,
        update: (id) => `/tasks/${id}`,
        delete: (id) => `/tasks/${id}`,
    },

    projects: {
        getAll: "project/projects",
        create: "project/projects",
        getById: (id) => `project/projects/${id}`,
        update: (id) => `project/projects/${id}`,
        delete: (id) => `project/projects/${id}`,
    },
};

export default endpoints;