import api from "../base";
import endpoints from "../endpoint";

// Barcha gruppalarni olish (boardId bilan filtrlangan)
export const getGroups = (boardId) => {
  return api.get(endpoints.group.getAll, {
    params: { board: boardId }, // Agar API query params orqali boardId kutsa
  });
};

// ID bo'yicha group olish (boardId bilan tekshirish mumkin)
export const getGroupById = (id, boardId) => {
  return api.get(endpoints.group.getById(id), {
    params: { board: boardId },
  });
};

// Yangi group yaratish
export const createGroup = (name, boardId) => {
  return api.post(endpoints.group.create, {
    name,
    board: boardId,
  });
};

// Group yangilash (boardId bilan)
export const updateGroup = (id, data, boardId) => {
  return api.patch(endpoints.group.update(id), data, {
    params: { board: boardId }, // boardId ni qo'shish
  });
};

// Group o'chirish (boardId bilan)
export const deleteGroup = (id, boardId) => {
  return api.delete(endpoints.group.delete(id), {
    params: { board: boardId },
  });
};
