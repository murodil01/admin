import api from "../base";
import endpoints from "../endpoint";

export const getEmployees = async (page = 1, filters = null) => {
    try {
        const params = {
            page_num: page
        };

        if (filters) {
            // Department filter
            if (filters.selectedDepartments && filters.selectedDepartments.length > 0) {
                params["department__name"] = filters.selectedDepartments.join("");
            }

            // Role filter
            if (filters.selectedRoles && filters.selectedRoles.length > 0) {
                params.role = filters.selectedRoles.join(",");
            }

            // Status filter
            if (filters.status && filters.status !== '') {
                params.status = filters.status;
            }
        }

        const res = await api.get(endpoints.employees.getAll, {
            params: params
        });

        return res.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const getEmployeeById = async (id) => {
    const res = await api.get(endpoints.employees.getById(id));
    return res.data;
};

export const createEmployees = async (formData) => {
    try {
        const res = await api.post(endpoints.employees.create, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error.response?.data);
        throw error;
    }
};

export const updateEmployees = async (id, data) => {
    const res = await api.patch(endpoints.employees.update(id), data);
    return res.data;
};

export const updateEmployeeStatus = async (id, status) => {
    const res = await api.patch(
        endpoints.employees.updateStatus(id),
        { status },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return res.data;
};

export const deleteEmployee = async (id) => {
    const res = await api.delete(endpoints.employees.delete(id));
    return res.data;
};