import api from "../base";
import endpoints from "../endpoint";

export const getEmployees = async (page = 1) => {
    try {
        const res = await api.get(endpoints.employees.getAll, {
            params: {
                page_num: page // Backend 'page' parametrini kutayotgan bo'lishi mumkin
            }
        });
        return res.data;
    } catch (error) {
        console.error('Xodimlarni olishda xato:', error);
        throw error;
    }
};

export const getEmployeeById = async (id) => {
    const res = await api.get(endpoints.employees.getById(id));
    return res.data;
};

export const createEmployees = async (formData) => {
    try {
        // FormData-ni tekshirish
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value); // Debug uchun
        }

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
    console.log("Yuborilayotgan ma'lumot:", data); // Ma'lumotlarni ko'rish
    console.log("Endpoint:", endpoints.employees.update(id)); // Endpointni ko'rish
    const res = await api.put(endpoints.employees.update(id), data);
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