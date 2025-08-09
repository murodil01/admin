import api from "../base";
import endpoints from "./projectService";

export const getProjects = () => api.get(endpoints.projects.getAll);
export const getProjectById = (id) => api.get(endpoints.projects.getById(id));
export const createProject = (data) => api.post(endpoints.projects.create, data);
export const updateProject = (id, data) => api.put(endpoints.projects.update(id), data);
export const deleteProject = (id) => api.delete(endpoints.projects.delete(id));
