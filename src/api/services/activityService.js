import api from "../base";
import endpoints from "../endpoint";

export const getActivities = async (page = 1, filters = {}) => {
    try {
        const params = {
            page_num: page
        };

        if (filters) {
            // Department filter
            if (filters.selectedDepartments && filters.selectedDepartments.length > 0) {
                params["department__name"] = filters.selectedDepartments.join(",");
            }

            // Status filter
            if (filters.status && filters.status !== '') {
                params.status = filters.status;
            }

            // Task count filters
            if (filters.taskFilters) {
                const { taskFilters } = filters;

                // Active tasks filter
                if (taskFilters.activeMin !== '') {
                    params.active_min = taskFilters.activeMin;
                }
                if (taskFilters.activeMax !== '') {
                    params.active_max = taskFilters.activeMax;
                }

                // Review tasks filter
                if (taskFilters.reviewMin !== '') {
                    params.review_min = taskFilters.reviewMin;
                }
                if (taskFilters.reviewMax !== '') {
                    params.review_max = taskFilters.reviewMax;
                }

                // Completed tasks filter
                if (taskFilters.completedMin !== '') {
                    params.completed_min = taskFilters.completedMin;
                }
                if (taskFilters.completedMax !== '') {
                    params.completed_max = taskFilters.completedMax;
                }
            }
        }

        const res = await api.get(endpoints.activities.getAll, {
            params: params
        });

        return res.data;
    } catch (error) {
        console.error('Error fetching activities:', error);
        throw error;
    }
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