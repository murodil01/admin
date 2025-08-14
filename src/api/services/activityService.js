import api from "../base";
import endpoints from "../endpoint";

export const getActivities = async () => {
    const res = await api.get(endpoints.activities.getAll);
    return res.data; //  bu yerda count, next, previous, results bo‘ladi
};

// export const getEmployeeById = async (id) => {
//     const res = await api.get(endpoints.employees.getById(id));
//     return res.data;
// };

export const createActivities = async (data) => {
    const res = await api.post(endpoints.activities.create, data, {
        headers: {
            'Content-Type': 'application/json' // JSON formatida yuborish
        }
    });
    return res.data;
};

// export const updateEmployees = async (id, data) => {
//     const res = await api.put(endpoints.employees.update(id), data);
//     return res.data;
// };

// export const deleteEmployees = async (id) => {
//     const res = await api.delete(endpoints.employees.delete(id));
//     return res.data;
// };