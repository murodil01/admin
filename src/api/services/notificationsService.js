import api from "../base";
import endpoints from "../endpoint";

export const getNotificationsAll = async () => {
    const res = await api.get(endpoints.notifications.getAll);
    return res.data;
};

export const createNotifications = async (text) => {
    const res = await api.post(endpoints.notifications.create, {
        message: text
    });
    return res.data;
};

export const updateNotifications = async (id, text) => {
    const res = await api.patch(endpoints.notifications.update(id), {
        message: text
    });
    return res.data;
};

export const deleteNotifications = async (id) => {
    const res = await api.delete(endpoints.notifications.delete(id));
    return res.data;
};