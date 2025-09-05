import api from "../base";
import endpoints from "../endpoint";

export const getProjects = async (page = 1) => {
  const res = await api.get(`${endpoints.projects.getAll}?page_num=${page}`);
  return res.data;
};

export const getProjectById = async (id) => {
    const res = await api.get(endpoints.projects.getById(id));
    return res.data;
};

export const createProject = async (data) => {
    const res = await api.post(endpoints.projects.create, data);
    return res.data;
};

export const updateProject = async (id, data) => {
    const res = await api.put(endpoints.projects.update(id), data);
    return res.data;
};

export const deleteProject = async (id) => {
    const res = await api.delete(endpoints.projects.delete(id));
    return res.data;
};

export const getProjectMembers = (projectId) => 
  api.get(endpoints.projects.getMembers(projectId));