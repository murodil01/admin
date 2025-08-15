import api from "../base";
import endpoints from "../endpoint";

// export const getDepartments = () => api.get(endpoints.departments.getAll);
// export const getDepartmentById = (id) => api.get(endpoints.departments.getById(id));
// export const updateDepartment = (id, data) => api.put(endpoints.departments.update(id), data);
// export const deleteDepartment = (id) => api.delete(endpoints.departments.delete(id));


export const getDepartments = async () => {
    try {
        const res = await api.get(endpoints.departments.getAll);
        return res.data; // {count, next, previous, results} yoki to'g'ridan-to'g'ri array qaytishi mumkin
    } catch (error) {
        console.error("Departmentlarni olishda xatolik:", error);
        throw error; // Xatoni yuqoriga otish
    }
};

export const getDepartmentById = async (id) => {
    const res = await api.get(endpoints.departments.getById(id));
    return res.data;
};

export const createDepartment = async (data) => {
    const res = await api.post(endpoints.departments.create, data);
    return res.data;
};

export const updateDepartment = async (id, data) => {
    const res = await api.put(endpoints.departments.update(id), data);
    return res.data;
};

export const deleteDepartment = async (id) => {
    const res = await api.delete(endpoints.departments.delete(id));
    return res.data;
};

