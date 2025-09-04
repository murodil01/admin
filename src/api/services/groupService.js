import api from "../base";
import endpoints from "../endpoint";

// Barcha gruppalarni olish (boardId bilan filtrlangan)
export const getGroups = (boardId) => {
  // Agar boardId mavjud bo'lsa, query params orqali filter qiling
  if (boardId) {
    return api.get(`${endpoints.group.getAll}?board=${boardId}`);
  }
  return api.get(endpoints.group.getAll);
};

// Alternative method - agar API query params ni qo'llab-quvvatlamasa
export const getGroupsByBoard = async (boardId) => {
  try {
    const response = await api.get(endpoints.group.getAll);
    
    // Frontend da filter qilish
    if (boardId && response.data && Array.isArray(response.data)) {
      const filteredGroups = response.data.filter(group => group.board === boardId);
      return { ...response, data: filteredGroups };
    }
    
    return response;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
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