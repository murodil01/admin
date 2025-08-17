const endpoints = {
	auth: {
		login: '/auth/login',
		register: '/auth/register',
		me: '/auth/me',
		logout: '/auth/logout', // Added logout endpoint
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
		createTaskFile: 'project/files/',
		getTaskFiles: 'project/files/', // yangi qo'shildi
		deleteTaskFile: id => `project/files/${id}/`, // yangi qo'shildi
		
        getComments: "project/comments/",
		
		getTaskInstructions: 'project/instructions/', // yangi qo'shildi
		getTaskInstructionsById: id => `project/instructions/${id}/`,
		createTaskInstructions: 'project/instructions/',
		updateInstruction: id => `project/instructions/${id}/`, 
		deleteTaskInstruction: id => `project/instructions/${id}/`, // yangi qo'shildi
	},

    projects: {
        getAll: "project/projects/",
        create: "project/projects/",
        getById: (id) => `project/projects/${id}/`,
        getByIdTasks: (id) => `project/projects/${id}/tasks/`,
        getByIdUsers: (id) => `project/projects/${id}/users/`,
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
		updateStatus: id=> `users/${id}/`,
		delete: (id) => `users/${id}/`,
	},

	activities: {
		getAll: 'user-activities/',
		getById: 'user-activities/{id}/',
		create: 'users/',
	},

	controlData: {
		getByUserId: (userId) => `control-data/?user_id=${userId}/`,
		createForUser: (userId) => `control-data/?user_id=${userId}/`, // Faqat o'sha user uchun yaratish
		update: (userId) => `control-data/?user_id=${userId}/`,
	},

	userProjects: {
		getAll: 'user-projects/',
		getById: (id) => `user-projects/${id}/`,
	},

	notes: {
		getAll: 'notes/',
		getById: (id) => `notes/${id}/`,
		create: 'notes/',
		update: (id) => `notes/${id}/`,
		updateStatus: id=> `/notes/${id}/`,
		delete: (id) => `notes/${id}/`,
	}
}

export default endpoints;