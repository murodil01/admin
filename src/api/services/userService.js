import api from "../base";
import endpoints from "../endpoint";

export const getUsers = () => api.get(endpoints.users.getAll);
export const getUserById = (id) => api.get(endpoints.users.getById(id));
export const updateUser = (id, data) => api.put(endpoints.users.update(id), data);
export const deleteUser = (id) => api.delete(endpoints.users.delete(id));