import api from "../base";
import endpoints from "../endpoint";

export const getEvents = async () => {
    const res = await api.get(endpoints.calendar.all);
    return res.data; 
};

export const createEvent = async (data) => {
    const res = await api.post(endpoints.calendar.all, data);
    return res.data;
};

export const getEventById = async (id) => {
    const res = await api.get(endpoints.calendar.eventById(id));
    return res.data;
};

export const updateEvent = async (id, data) => {
    const res = await api.put(endpoints.calendar.eventById(id), data);
    return res.data;
};

export const deleteEvent = async (id) => {
    const res = await api.delete(endpoints.calendar.eventById(id));
    return res.data;
};

// export const getProjectMembers = (projectId) => 
//   api.get(endpoints.projects.getMembers(projectId));