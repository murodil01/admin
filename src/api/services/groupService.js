import api from "../base";
import endpoints from "../endpoint";

// Barcha gruppalarni olish (boardId bilan filtrlangan)
export const getGroups = (boardId) => {
  console.log("getGroups chaqirildi, boardId:", boardId);
  return api.get(endpoints.group.getAll, {
    params: { board: boardId } // Agar API query params orqali boardId kutsa
  });
};

// ID bo'yicha group olish (boardId bilan tekshirish mumkin)
export const getGroupById = (id, boardId) => {
  console.log("getGroupById chaqirildi, id:", id, "boardId:", boardId);
  return api.get(endpoints.group.getById(id), {
    params: { board: boardId }
  });
};

// Yangi group yaratish
export const createGroup = (name, boardId) => {
  console.log("createGroup chaqirildi, boardId:", boardId);
  return api.post(endpoints.group.create, {
    name,
    board: boardId
  });
};

// Group yangilash (boardId bilan)
export const updateGroup = (id, data, boardId) => {
  console.log("updateGroup chaqirildi, id:", id, "boardId:", boardId);
  return api.put(endpoints.group.update(id), { ...data, board: boardId });
};

// Group o'chirish (boardId bilan)
export const deleteGroup = (id, boardId) => {
  console.log("deleteGroup chaqirildi, id:", id, "boardId:", boardId);
  return api.delete(endpoints.group.delete(id), {
    params: { board: boardId }
  });
};
