const endpoints = {
	auth: {
		login: '/auth/login',
		register: '/auth/register',
		me: '/auth/me',
	},

	users: {
		getAll: '/users',
		getById: id => `/users/${id}/`,
		update: id => `/users/${id}/`,
		delete: id => `/users/${id}/`,
	},

	tasks: {
		getAll: 'project/tasks/',
		create: 'project/tasks/',
		getTags: 'project/tags/',
		getById: id => `project/tasks/${id}/`,
		update: id => `project/tasks/${id}/`,
		delete: id => `project/tasks/${id}/`,
	},

    projects: {
        getAll: "project/projects/",
        create: "project/projects/",
        getById: (id) => `project/projects/${id}`,
        getByIdTasks: (id) => `project/projects/${id}/tasks`,
        getByIdUsers: (id) => `project/projects/${id}/users`,
        update: (id) => `project/projects/${id}`,
        delete: (id) => `project/projects/${id}`,
    },

	departments: {
		getAll: 'department/departments/',
		getById: id => `department/departments/${id}/`,
		create: 'department/departments/',  // create endpointini qo'shdik
		update: id => `department/departments/${id}/`,
		delete: id => `department/departments/${id}/`,
	},

	boards: {
		getAll: 'board/list/',
		create: 'board/list/',
		getById: id => `board/board/${id}/`,
		update: id => `board/board/${id}/`,
		delete: id => `board/board/${id}/`,
	},

	group: {
		getAll: 'board/groups/',
		create: 'board/groups/',
		getById: id => `board/groups/${id}/`,
		update: id => `board/groups/${id}/`,
		delete: id => `board/groups/${id}/`,
	},

	leads: {
		getAll: 'board/leads/',
		create: 'board/leads/',
		getById: id => `board/leads/${id}/`,
		update: id => `board/leads/${id}/`,
		delete: id => `board/leads/${id}/`,
	},

	employees: {
		getAll: 'employees/',
		getById: (id) => `users/${id}/`,
		create: 'users/',
		update: (id) => `users/${id}/`,
		updateStatus: id=> `/users/${id}/`,
		delete: (id) => `users/${id}/`,
	},

	activities: {
		getAll: 'user-activities/',
		getById: 'user-activities/{id}/',
		create: 'users/',
	},

	controlData: {
		getAll: 'control-data/',
		getById: (id) => `control-data/${id}/`,
		create: 'control-data/',
	},

	userProjects: {
		getAll: 'user-projects/',
		getById: (id) => `user-projects/${id}/`,
	}
}

export default endpoints;