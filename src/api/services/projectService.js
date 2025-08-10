import api from "../base";
import endpoints from "../endpoint";

export const getProjects = async () => {
    const res = await api.get(endpoints.projects.getAll);
    return res.data; //  bu yerda count, next, previous, results bo‘ladi
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
