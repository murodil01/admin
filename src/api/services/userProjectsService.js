import api from "../base";
import endpoints from "../endpoint";

export const getUserProjects = async () => {
    const res = await api.get(endpoints.userProjects.getAll);
    return res.data;
};

export const getUserProjectsById = async (id) => {
    const res = await api.get(endpoints.userProjects.getById(id));
    return res.data;
};