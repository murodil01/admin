import api from "../base";
import endpoints from "../endpoint";

// Barcha boardlarni olish
export const getBoards = () => api.get(endpoints.boards.getAll);

// ID bo'yicha bitta boardni olish
export const getBoardById = (id) => api.get(endpoints.boards.getById(id));

// Yangi board yaratish
export const createBoard = (name, boardId) => {
  return api.post(endpoints.boards.create, {
    name,
    board: boardId,
  });
};

export const updateBoard = (id, data) =>
  api.patch(endpoints.boards.update(id), data);

// Boardni o'chirish
export const deleteBoard = (id) => api.delete(endpoints.boards.delete(id));
