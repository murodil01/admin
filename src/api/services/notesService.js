import api from "../base";
import endpoints from "../endpoint";

export const getNotesAll = async () => {
    const res = await api.get(endpoints.notes.getAll);
    return res.data;
};

export const createNote = async (text) => {
    const res = await api.post(endpoints.notes.create, {
        message: text
    });
    return res.data;
};

export const updateNote = async (id, text) => {
    const res = await api.patch(endpoints.notes.update(id), {
        message: text
    });
    return res.data;
};

export const deleteNote = async (id) => {
    const res = await api.delete(endpoints.notes.delete(id));
    return res.data;
};