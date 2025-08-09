import api from "../base";
import endpoints from "../endpoint";

export const getTasks = () => api.get(endpoints.projects.tasks.getAll);
export const getTaskById = (id) => api.get(endpoints.projects.tasks.getById(id));
export const createTask = (data) => api.post(endpoints.projects.tasks.create, data);
export const updateTask = (id, data) => api.put(endpoints.projects.tasks.update(id), data);
export const deleteTask = (id) => api.delete(endpoints.projects.tasks.delete(id));