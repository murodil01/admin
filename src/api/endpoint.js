const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout", // Added logout endpoint
  },

  users: {
    getAllusers: "users/",
    getAll: "get-users-for-projects/",
    me: "users/get_user/",
    getById: (id) => `users/${id}/`,
    update: (id) => `users/${id}/`,
    delete: (id) => `users/${id}/`,
    updateProfile: (id) => `users/${id}/update_profile/`,
  },

  tasks: {
    getAll: 'project/tasks/',
    create: 'project/tasks/',
    getTags: 'project/tags/',
    getById: id => `project/tasks/${id}/`,
    update: id => `project/tasks/${id}/`,
    delete: id => `project/tasks/${id}/`,
    createTaskFile: 'project/files/',
    getTaskFiles: 'project/files/',
    deleteTaskFile: id => `project/files/${id}/`,
    getComments: "project/comments/",
    updateComments:id=> `project/comments/${id}/`,
    deleteComments:id=> `project/comments/${id}/`,
    getTaskFilesByTask: (taskId) => `project/task-files/${taskId}`,
    getTaskInstructionsByTask: (taskId) => `project/task-instructions/${taskId}`,
    getTaskCommentsByTask: (taskId) => `project/task-comments/${taskId}`,
    // Instructions endpoint larini to'g'irlang
    getTaskInstructions: 'project/instructions/',
    createTaskInstructions: 'project/instructions/',
    updateInstruction: id => `project/instructions/${id}/`,
    deleteTaskInstruction: id => `project/instructions/${id}/`,
  },

  projects: {
    getAll: "project/projects/",
    create: "project/projects/",
    getById: (id) => `project/projects/${id}/`,
    getByIdTasks: (id) => `project/projects/${id}/tasks/`,
    getByIdUsers: (id) => `project/projects/${id}/users/`,
    updateByIdUsers: (id) => `project/projects/${id}/users`,
    update: (id) => `project/projects/${id}/`,
    delete: (id) => `project/projects/${id}/`,
  },


  departments: {
    getAll: "department/departments/",
    getById: (id) => `department/departments/${id}/`,
    create: "department/departments/", // create endpointini qo'shdik
    update: (id) => `department/departments/${id}/`,
    delete: (id) => `department/departments/${id}/`,
  },

  boards: {
    getStatus: "board/status/",
    getAll: "board/list/",
    create: "board/list/",
    createStatus: (id) => `board/status/${id}/`,
    getById: (id) => `board/board/${id}/`,    // board detail/list uchun
    update: (id) => `board/board/${id}/`,
    delete: (id) => `board/board/${id}/`,
  },

  group: {
    getAll: "board/groups/",
    create: "board/groups/",
    getById: (id) => `board/groups/${id}/`,
    update: (id) => `board/groups/${id}/`,
    delete: (id) => `board/groups/${id}/`,
  },

  leads: {
    getAll: "board/leads/",
    create: "board/leads/",
    getById: (id) => `board/leads/${id}/`,
    // createStatus: (id) => `board/leads/${id}/`,
    update: (groupId, leadId) => `board/leads/${leadId}/?group=${groupId}`,
    delete: (groupId, leadId) => `board/leads/${leadId}/?group=${groupId}`,
  },

  status: {

    getAllstatus: (boardId) => `board/status/${boardId}`,
    create: (boardId) => `board/status/${boardId}`,
    // getById: (boardId, statusId) =>
    //   `board/leads/status/${statusId}/?board=${boardId}`,

    getAll: (boardId) => `board/status/${boardId}`,
    // create: (boardId) => `board/status/${boardId}`,
    getById: (boardId, statusId) =>
      `board/status/${statusId}/?board=${boardId}`,

    update: (boardId, statusId) => `board/status/${statusId}/?board=${boardId}`,
    delete: (boardId, statusId) => `board/status/${statusId}/?board=${boardId}`,
  },

  employees: {
    getAll: "employees/",
    getById: (id) => `users/${id}/`,
    create: "users/",
    update: (id) => `users/${id}/`,
    updateStatus: (id) => `users/${id}/`,
    delete: (id) => `users/${id}/`,
  },

  activities: {
    getAll: "user-activities/",
    getById: "user-activities/{id}/",
    create: "users/",
  },

  // controlData: {
  //   getByUserId: (userId) => `control-data/?user_id=${userId}/`,
  //   createForUser: (userId) => `control-data/?user_id=${userId}/`, // Faqat o'sha user uchun yaratish
  //   update: (userId) => `control-data/?user_id=${userId}`,
  // },

  controlData: {
    getAll: "control-data/",
    getAllEmployees: "control-data/all-employees/",
    getAvailableUsers: "control-data/available-users/",
    getByUserId: (userId) => `control-data/${userId}/`, // GET /control-data/{user_id}/
    create: "control-data/", // POST /control-data/
    update: (userId) => `control-data/${userId}/`, // PUT /control-data/{user_id}/
    partialUpdate: (userId) => `control-data/${userId}/`, // PATCH /control-data/{user_id}/
    delete: (userId) => `control-data/${userId}/`, // DELETE /control-data/{user_id}/
  },

  userProjects: {
    getAll: "user-projects/",
    getById: (userId) => `user-projects/${userId}/`,
  },

  notes: {
    getAll: "notes/",
    getById: (id) => `notes/${id}/`,
    create: "notes/",
    update: (id) => `notes/${id}/`,
    partialUpdate: (id) => `/notes/${id}/`,
    delete: (id) => `notes/${id}/`,
    getUserNotes: (userId) => `notes/user/${userId}/`,
  },
};

export default endpoints;