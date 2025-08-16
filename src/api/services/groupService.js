import api from "../base";
import endpoints from "../endpoint";

// Barcha gruppalarni olish
export const getGroups = () => api.get(endpoints.group.getAll);

// ID bo'yicha group olish
export const getGroupById = (id) => api.get(endpoints.group.getById(id));

// Yangi group yaratish
// data: { name: string, board: [boardId] }
export const createGroup = (data) => api.post(endpoints.group.create, data);

// Group yangilash
export const updateGroup = (id, data) =>
  api.put(endpoints.group.update(id), data);

// Group o'chirish
export const deleteGroup = (id) => api.delete(endpoints.group.delete(id));
