import api from "../base";
import endpoints from "../endpoint";

export const getControlData = async () => {
    try {
        const response = await api.get(endpoints.controlData.getAll);
        console.log('GET Control Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching control data:', error);
        throw error;
    }
};

export const getControlDataById = async (id) => {
    try {
        const response = await api.get(endpoints.controlData.getById(id));
        console.log(`GET Control Data by ID ${id} Response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching control data with ID ${id}:`, error);
        throw error;
    }
};

export const updateControlData = async (id, data, isFormData = false) => {
    try {
        const config = {
            headers: isFormData ? {
                'Content-Type': 'multipart/form-data',
            } : {}
        };

        // PUT o'rniga PATCH ishlatamiz, chunki faqat o'zgartirilgan maydonlarni yuborish yaxshi amaliyot
        const response = await api.patch(endpoints.controlData.getById(id), data, config);
        console.log(`UPDATE Control Data ${id} Response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating control data with ID ${id}:`, error);
        throw error;
    }
};

export const createControlData = async (data, isFormData = false) => {
    try {
        const config = {
            headers: isFormData ? {
                'Content-Type': 'multipart/form-data',
            } : {}
        };

        const response = await api.post(endpoints.controlData.getAll, data, config);
        console.log('CREATE Control Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating control data:', error);
        throw error;
    }
};

// Fayl yuklash uchun alohida funksiya
export const uploadControlDataFile = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', id);

        const response = await api.post(
            `${endpoints.controlData.getAll}upload/`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );

        console.log('File upload response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}