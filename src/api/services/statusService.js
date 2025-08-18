import api from "../base";
import status from "../endpoint";

// Barcha statuslarni olish
export const getStatuses = async (boardId) => {
  const res = await api.get(status.getAll(boardId));
  return res.data;
};

// ID bo'yicha status olish
export const getStatusById = async (boardId, statusId) => {
  const res = await api.get(status.getById(boardId, statusId));
  return res.data;
};

// Yangi status yaratish
export const createStatus = async (boardId, data) => {
  const res = await api.post(status.create(boardId), data);
  return res.data;
};

// Statusni yangilash
export const updateStatus = async (boardId, statusId, data) => {
  const res = await api.patch(status.update(boardId, statusId), data);
  return res.data;
};

// Statusni o'chirish
export const deleteStatus = async (boardId, statusId) => {
  const res = await api.delete(status.delete(boardId, statusId));
  return res.data;
};
