import api from "../base";
import endpoints from "../endpoint";

export const getTasks = () => api.get(endpoints.tasks.getAll);
export const getTaskById = (id) => api.get(endpoints.tasks.getById(id));
export const createTask = (data) => api.post(endpoints.tasks.create, data);
export const updateTask = (id, data) => api.put(endpoints.tasks.update(id), data);
export const deleteTask = (id) => api.delete(endpoints.tasks.delete(id));
export const getProjectTaskById = (id) => api.get(endpoints.projects.getByIdTasks(id));