import api from "../base";
import endpoints from "../endpoint";

export const getUserProjects = async (params = {}) => {
    const res = await api.get(endpoints.userProjects.getAll, { params });
    return res.data;
};

export const getUserProjectsById = async (userId, params = {}) => {
    const res = await api.get(endpoints.userProjects.getById(userId), { params });
    console.log("Projects:", res);;
    return res.data;
};