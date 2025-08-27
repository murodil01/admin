import api from "../base";
import endpoints from "../endpoint";

export const getusersAll = () => api.get(endpoints.users.getAllusers);
export const getMSalesUsers = () => api.get(endpoints.users.getSalesUsers);

export const getUsers = () => api.get(endpoints.users.getAll);

export const getUserById = (id) => api.get(endpoints.users.getById(id));

export const updateUser = (id, data) => api.put(endpoints.users.update(id), data);

export const deleteUser = async (id) => {
    try {
        const res = await api.delete(endpoints.employees.delete(id));
        return res.data;
    } catch (error) {
        console.error('Full delete error:', {
            message: error.message,
            config: error.config,
            response: error.response
        });
        throw error;
    }
};