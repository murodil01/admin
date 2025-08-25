import api from "../base";
import endpoints from "../endpoint";

export const getControlDataByUserId = async (userId) => {
    try {
        // Ensure userId is a string
        const userIdString = String(userId);
        console.log('🔍 SERVICE DEBUG: getControlDataByUserId called with:', {
            originalUserId: userId,
            userIdString: userIdString,
            type: typeof userId
        });

        // Use the correct endpoint based on Swagger - /control-data/{user_id}/
        const response = await api.get(endpoints.controlData.getByUserId(userIdString));

        console.log('API Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers,
            url: endpoints.controlData.getByUserId(userIdString)
        });

        if (!response.data) {
            throw new Error('API dan ma\'lumot qaytmadi');
        }

        // Return the data as is - don't force it into an array
        return response.data;
    } catch (error) {
        console.error(`Error fetching control data for user ${userId}:`, {
            error: error,
            response: error.response?.data,
            status: error.response?.status,
            requestUrl: endpoints.controlData.getByUserId
        });
        throw error;
    }
};

export const updateControlData = async (userId, data) => {
    let cleanData;
    const userIdString = String(userId);
    try {
        console.log('🔍 SERVICE DEBUG: updateControlData called with:', {
            originalUserId: userId,
            userIdString: userIdString,
            type: typeof userId
        });

        // Clean data object - INCLUDE user_id for updates
        cleanData = {
            user_id: userIdString, // ✅ Add user_id to the request body
            accept_reason: data.accept_reason || "",
            expertise_level: data.expertise_level || "",
            strengths: data.strengths || "",
            weaknesses: data.weaknesses || "",
            biography: data.biography || "",
            trial_period: data.trial_period || "",
            work_hours: data.work_hours || "",
            contact_type: data.contact_type || "",
            assigned_devices: data.assigned_devices || "",
            access_level: data.access_level || "",
            serial_number: data.serial_number || "",
            pinfl: data.pinfl ? String(data.pinfl) : "", // Keep as string
        };

        console.log("Updating control data with ID:", userIdString);
        console.log("Data being sent:", cleanData);

        if (data.passport_picture instanceof File) {
            const formData = new FormData();

            // Add the file
            formData.append('passport_picture', data.passport_picture);

            // Add all other fields INCLUDING user_id
            Object.entries(cleanData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, value);
                }
            });

            const response = await api.patch(
                endpoints.controlData.partialUpdate(userIdString),
                formData
                // Don't set Content-Type header - let browser set it with boundary
            );
            console.log("Update successful:", response.data);
            return response.data;
        }

        // Regular update without file using PUT method
        const response = await api.put(endpoints.controlData.update(userIdString), cleanData);

        console.log("Update successful:", response.data);
        return response.data;
    } catch (error) {
        console.error('Update error:', {
            error: error.response?.data || error.message,
            userId: String(userId),
            sentData: cleanData,
            requestUrl: endpoints.controlData.update(userIdString)
        });
        throw error;
    }
};

export const createControlDataForUser = async (userId, data) => {
    let cleanData;
    try {
        // Ensure userId is a string
        const userIdString = String(userId);
        console.log('🔍 SERVICE DEBUG: createControlDataForUser called with:', {
            originalUserId: userId,
            userIdString: userIdString,
            type: typeof userId
        });

        // Clean data for creation - INCLUDE user_id
        cleanData = {
            user_id: userIdString, // ✅ Add user_id to the request body
            accept_reason: data.accept_reason || "",
            expertise_level: data.expertise_level || "",
            strengths: data.strengths || "",
            weaknesses: data.weaknesses || "",
            biography: data.biography || "",
            trial_period: data.trial_period || "",
            work_hours: data.work_hours || "",
            contact_type: data.contact_type || "",
            assigned_devices: data.assigned_devices || "",
            access_level: data.access_level || "",
            serial_number: data.serial_number || "",
            pinfl: data.pinfl ? String(data.pinfl) : "", // Keep as string
        };

        console.log("Creating control data for user:", userIdString);
        console.log("Clean data being sent:", cleanData);

        // Check if we have a file to upload
        if (data.passport_picture instanceof File) {
            const formData = new FormData();

            // Add the file
            formData.append('passport_picture', data.passport_picture);

            // Add all other fields INCLUDING user_id
            Object.entries(cleanData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, value);
                }
            });

            // Create with file using FormData
            const response = await api.post(endpoints.controlData.create, formData);
            console.log('CREATE with file response:', response.data);
            return response.data;
        }

        // Regular creation without file
        const response = await api.post(endpoints.controlData.create, cleanData);
        console.log('CREATE response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating control data:', {
            error: error.response?.data || error.message,
            userId,
            sentData: cleanData
        });
        throw error;
    }
};

export const uploadControlDataFile = async (userId, file) => {
    try {
        // Ensure userId is a string
        const userIdString = String(userId);
        console.log('🔍 SERVICE DEBUG: uploadControlDataFile called with:', {
            originalUserId: userId,
            userIdString: userIdString,
            type: typeof userId,
            fileName: file.name
        });

        const formData = new FormData();
        formData.append('passport_picture', file);
        // Also include user_id in file uploads
        formData.append('user_id', userIdString);

        const response = await api.patch(endpoints.controlData.partialUpdate(userIdString), formData);
        return response.data;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};