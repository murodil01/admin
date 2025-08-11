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
    getAll: "project/tasks",
    create: "project/tasks",
    getById: (id) => `project/tasks/${id}`,
    update: (id) => `project/tasks/${id}`,
    delete: (id) => `project/tasks/${id}`,
  },

    projects: {
        getAll: "project/projects/",
        create: "project/projects/",
        getById: (id) => `project/projects/${id}`,
        getByIdTasks: (id) => `project/projects/${id}/tasks`,
        update: (id) => `project/projects/${id}`,
        delete: (id) => `project/projects/${id}`,
    },

    departments: {
        getAll: "department/departments",
    },

};

export default endpoints;
