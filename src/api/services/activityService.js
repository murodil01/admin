// src/api/services/activityService.js
import api from "../base";
import endpoints from "../endpoint";

export const getActivities = async (page = 1, filters = {}) => {
    try {
        const params = {
            page_num: page,  // Changed back to page_num to match your URL structure
        };

        console.log('Building API params. Page:', page, 'Filters:', filters); // Debug log

        if (filters) {
            // Department filter - Send as department IDs
            if (filters.selectedDepartments && filters.selectedDepartments.length > 0) {
                params["departments"] = filters.selectedDepartments.join(",");
                console.log('Adding department filter:', params["departments"]);
            }

            // Status filter
            if (filters.status && filters.status !== '') {
                params.status = filters.status;
                console.log('Adding status filter:', params.status);
            }

            // Task count filters - Server-side filtering for ALL pages
            if (filters.taskFilters) {
                const { taskFilters } = filters;
                console.log('Processing task filters:', taskFilters);

                // Active tasks filter
                if (taskFilters.activeMin !== '' && taskFilters.activeMin !== null && !isNaN(taskFilters.activeMin)) {
                    params.active_min = parseInt(taskFilters.activeMin);
                }
                if (taskFilters.activeMax !== '' && taskFilters.activeMax !== null && !isNaN(taskFilters.activeMax)) {
                    params.active_max = parseInt(taskFilters.activeMax);
                }

                // Review tasks filter
                if (taskFilters.reviewMin !== '' && taskFilters.reviewMin !== null && !isNaN(taskFilters.reviewMin)) {
                    params.review_min = parseInt(taskFilters.reviewMin);
                }
                if (taskFilters.reviewMax !== '' && taskFilters.reviewMax !== null && !isNaN(taskFilters.reviewMax)) {
                    params.review_max = parseInt(taskFilters.reviewMax);
                }

                // Completed tasks filter
                if (taskFilters.completedMin !== '' && taskFilters.completedMin !== null && !isNaN(taskFilters.completedMin)) {
                    params.completed_min = parseInt(taskFilters.completedMin);
                }
                if (taskFilters.completedMax !== '' && taskFilters.completedMax !== null && !isNaN(taskFilters.completedMax)) {
                    params.completed_max = parseInt(taskFilters.completedMax);
                }
            }
        }

        console.log('Final API params:', params); // Debug log

        const res = await api.get(endpoints.activities.getAll, {
            params: params
        });

        console.log('API Response:', res.data); // Debug log
        return res.data;
    } catch (error) {
        console.error('Error fetching activities:', error);
        console.error('Error details:', error.response?.data);
        throw error;
    }
};

export const createActivities = async (data) => {
    const res = await api.post(endpoints.activities.create, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.data;
};