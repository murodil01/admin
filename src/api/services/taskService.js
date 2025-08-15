import api from "../base";
import endpoints from "../endpoint";


export const getTasks = () => api.get(endpoints.tasks.getAll);
export const getTaskById = (id) => api.get(endpoints.tasks.getById(id));
export const createTask = (data) => api.post(endpoints.tasks.create, data);
export const updateTask = (id, data) => api.put(endpoints.tasks.update(id), data);
export const deleteTask = (id) => api.delete(endpoints.tasks.delete(id));
export const updateTaskType = (id, tasks_type) => api.patch(endpoints.tasks.update(id), { tasks_type });
export const getTaskTags = () => api.get(endpoints.tasks.getTags);
export const getProjectTaskById = (id) => api.get(endpoints.projects.getByIdTasks(id));
export const getFiles = () => api.get(endpoints.files.getTaskFiles)
export const getProjectUsers = (id) => api.get(endpoints.projects.getByIdUsers(id));