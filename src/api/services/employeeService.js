import api from "../base";
import endpoints from "../endpoint";

// Updated getEmployees function to handle filters
export const getEmployees = async (page = 1, filters = null) => {
    try {
        const params = {
            page_num: page
        };

        // Add filter parameters if they exist
        if (filters) {
            if (filters.fullName && filters.fullName.trim()) {
                params.search = filters.fullName.trim(); // or 'full_name' depending on your backend
            }

            if (filters.phoneNumber && filters.phoneNumber.trim()) {
                params.phone_number = filters.phoneNumber.trim();
            }

            if (filters.selectedDepartments && filters.selectedDepartments.length > 0) {
                // Option 1: If backend accepts comma-separated department IDs
                params.department_ids = filters.selectedDepartments.join(',');

                // Option 2: If backend accepts multiple department_id parameters
                // You might need to handle this differently based on your backend
                // For now, using comma-separated approach
            }

            if (filters.status && filters.status !== '') {
                params.status = filters.status;
            }
        }

        console.log('Fetching employees with params:', params);

        const res = await api.get(endpoints.employees.getAll, {
            params: params
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