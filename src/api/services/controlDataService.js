import api from "../base";
import endpoints from "../endpoint";

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
        // console.log('API Response:', response.data); // Debug uchun

        return response.data; // To'g'ridan-to'g'ri response.data ni qaytaramiz

    } catch (error) {
        console.error(`Error fetching control data for user ${userId}:`, error);
        throw error;
    }
};

export const updateControlData = async (id, data) => {
    try {
        const dataToSend = {
            ...data,
            printl: data.pinfl ? parseInt(data.pinfl) : null
        };

        delete dataToSend.pinfl;
        delete dataToSend.id;
        delete dataToSend.employee;
        delete dataToSend.user_info;  // user_info yangilanishda o'zgartirilmaydi

        const response = await api.patch(
            endpoints.controlData.update(id),
            dataToSend
        );

        return response.data;
    } catch (error) {
        console.error('Update error:', error.response?.data || error.message);
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
                role: userInfo.role
            },
            printl: data.pinfl ? parseInt(data.pinfl) : null
        };

        delete dataToSend.pinfl;
        delete dataToSend.id;
        delete dataToSend.employee;

        const response = await api.post(
            endpoints.controlData.createForUser(userInfo), // User ID ni endpointga qo'shamiz
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