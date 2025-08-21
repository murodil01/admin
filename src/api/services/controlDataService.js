import api from "../base";
import endpoints from "../endpoint";
import { getUserById } from "./userService";

// export const getControlData = async () => {
//     try {
//         const response = await api.get(endpoints.controlData.getAll);
//         console.log('GET Control Data Response:', response.data);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching control data:', error);
//         throw error;
//     }
// };

export const getControlDataByUserId = async (userId) => {
    try {
        const response = await api.get(endpoints.controlData.getByUserId(userId));
        console.log("controlData id:", response.data);

        console.log('API Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });

        // Javob strukturasi tekshiriladi
        if (!response.data) {
            throw new Error('API dan ma\'lumot qaytmadi');
        }

        // Agar ma'lumotlar massiv bo'lsa
        if (Array.isArray(response.data)) {
            console.log('Qaytgan ma\'lumotlar soni:', response.data.length);
            return response.data;
        }

        // Agar bitta obyekt qaytsa
        if (typeof response.data === 'object' && response.data !== null) {
            console.log('Qaytgan obyekt:', response.data);
            return [response.data]; // Massivga o'rab qaytarish
        }

        throw new Error('Noto\'g\'ri javob formati');

    } catch (error) {
        console.error(`Error fetching control data for user ${userId}:`, {
            error: error,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

export const updateControlData = async (controlDataId, data) => {
    let dataToSend;
    try {
        // Create clean dataToSend object with only allowed fields
        dataToSend = {
            accept_reason: data.accept_reason,
            expertise_level: data.expertise_level,
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            biography: data.biography,
            trial_period: data.trial_period,
            work_hours: data.work_hours,
            contact_type: data.contact_type,
            assigned_devices: data.assigned_devices,
            access_level: data.access_level,
            serial_number: data.serial_number,
            pinfl: data.pinfl ? parseInt(data.pinfl) : null,
            // user_info: {
            //     id: user.id,
            //     first_name: user.first_name,
            //     last_name: user.last_name,
            //     email: user.email,
            //     role: user.role,
            //     full_name: user.full_name,
            // },
        };

        console.log("Updating control data with ID:", controlDataId);
        console.log("Data being sent:", dataToSend);

        if (data.passport_picture instanceof File) {
            const formData = new FormData();
            formData.append('passport_picture', data.passport_picture);

            // Append only the cleaned fields
            Object.entries(dataToSend).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const response = await api.patch(
                endpoints.controlData.update(controlDataId),
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            console.log("Update successful:", response.data);
            return response.data;
        }

        // Regular update without file
        const response = await api.patch(
            endpoints.controlData.update(controlDataId),
            dataToSend
        );

        console.log("Update successful:", response.data);
        return response.data;
    } catch (error) {
        console.error('Update error:', {
            error: error.response?.data || error.message,
            controlDataId,
            sentData: dataToSend
        });
        throw error;
    }
};

export const createControlDataForUser = async (userId, data) => {
    try {
        const dataToSend = {
            user_id: userId, // Send user_id directly
            accept_reason: data.accept_reason,
            expertise_level: data.expertise_level,
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            biography: data.biography,
            trial_period: data.trial_period,
            work_hours: data.work_hours,
            contact_type: data.contact_type,
            assigned_devices: data.assigned_devices,
            access_level: data.access_level,
            serial_number: data.serial_number,
            pinfl: data.pinfl ? parseInt(data.pinfl) : null,
        };

        const response = await api.post(
            endpoints.controlData.createForUser,
            dataToSend
        );

        console.log('CREATE response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating control data:', {
            error: error.response?.data || error.message
        });
        throw error;
    }
};

export const uploadControlDataFile = async (controlDataId, file) => {
    try {
        const formData = new FormData();
        formData.append('passport_picture', file);

        // Mavjud update endpointidan foydalanamiz
        const response = await api.patch(
            endpoints.controlData.update(controlDataId),
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response.data;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};