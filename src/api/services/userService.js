import api from "../base";
import endpoints from "../endpoint";

export const getUsers = () => api.get(endpoints.users.getAll);

export const getUserById = (id) => api.get(endpoints.users.getById(id));

export const updateUser = (id, data) => api.put(endpoints.users.update(id), data);

export const deleteUser = async (id) => {
    try {
        console.log('Deleting user with ID:', id);
        const res = await api.delete(endpoints.employees.delete(id));
        console.log('Delete response:', res);
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