import api from "../base";
import endpoints from "../endpoint";

export const getControlData = async () => {
    const res = await api.get(endpoints.controlData.getAll);
    return res.data;
};

export const getControlDataById = async (id) => {
    const res = await api.get(endpoints.controlData.getById(id));
    return res.data;
};

export const updateControlData = async (id, data) => {
    const res = await api.put(endpoints.controlData.getById(id), data, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const createControlData = async (data) => {
    const res = await api.post(endpoints.controlData.getAll, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};