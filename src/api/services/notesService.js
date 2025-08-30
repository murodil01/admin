import api from "../base";
import endpoints from "../endpoint";

export const getNotesAll = async () => {
    const res = await api.get(endpoints.notes.getAll);
    return res.data;
};

export const createNote = async (text, targetUserId) => {
    try {
        // Use the correct field names that the backend expects
        const payload = {
            message: text,
            recipient: targetUserId
        };

        const res = await api.post(endpoints.notes.create, payload);
        return res.data;

    } catch (error) {
        console.error("Create note error details:", error.response?.data);
        throw error;
    }
};

export const getUserNotes = async (userId) => {
    const res = await api.get(endpoints.notes.getUserNotes(userId));
    return res.data;
};

export const updateNote = async (id, text) => {
    try {
        const res = await api.patch(endpoints.notes.partialUpdate(id), {
            message: text
        });
        return res.data;
    } catch (error) {
        console.error("Update note error details:", error.response?.data);
        throw error;
    }
};

export const deleteNote = async (id) => {
    try {
        const res = await api.delete(endpoints.notes.delete(id));

        return res.data;
    } catch (error) {
        console.error("Delete note error details:", error.response?.data);
        throw error;
    }
};

export const getCurrentUser = async () => {
    const res = await api.get(endpoints.users.me);
    return res.data;
};