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
        console.log("controlData id:", response);

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

export const updateControlData = async (id, data) => {
    let dataToSend;
    try {
        const user = await getUserById(data.user_id || data.user_info?.id);
        // Create clean dataToSend object with only allowed fields
        dataToSend = {
            id: data.id,
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
            user_info: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
            },
        };

        console.log("Cleaned data being sent:", dataToSend);

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
                endpoints.controlData.update(id),
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            return response.data;
        }

        // Regular update without file
        const response = await api.patch(
            endpoints.controlData.update(id),
            dataToSend
        );
        return response.data;
    } catch (error) {
        console.error('Update error:', {
            error: error.response?.data || error.message,
            id,
            sentData: dataToSend
        });
        throw error;
    }
};

export const createControlDataForUser = async (userInfo, data) => {
    try {
        const dataToSend = {
            ...data,
            user_info: {  // user_info strukturasini to'g'ri shaklda yuboramiz
                id: userInfo.id,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                email: userInfo.email,
                role: userInfo.role,
                full_name: userInfo.full_name,
            },
            pinfl: data.pinfl ? parseInt(data.pinfl) : null
        };

        delete dataToSend.pinfl;
        delete dataToSend.id;
        delete dataToSend.employee;

        const response = await api.post(
            endpoints.controlData.createForUser(userInfo.id), // User ID ni endpointga qo'shamiz
            dataToSend
        );

        // console.log('CREATE for user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating for user:', {
            userInfo,
            error: error.response?.data || error.message
        });
        throw error;
    }
};

export const uploadControlDataFile = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append('passport_picture', file);

        // Mavjud update endpointidan foydalanamiz
        const response = await api.patch(
            endpoints.controlData.update(id),
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