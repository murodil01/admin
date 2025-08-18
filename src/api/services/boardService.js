import api from "../base";
import endpoints from "../endpoint";

// Barcha boardlarni olish
export const getBoards = () => api.get(endpoints.boards.getAll);

// ID bo'yicha bitta boardni olish
export const getBoardById = async (id) => {
  try {
    // Use the correct endpoint: /board/status/{board_id}/
    const response = await api.get(`board/status/${id}/`);
    
    // The response should be an array of status objects
    if (Array.isArray(response.data)) {
      return { statuses: response.data };
    }
    
    // If the response is an object with statuses property
    if (response.data && response.data.statuses) {
      return response.data;
    }
    
    throw new Error("Invalid board data format");
  } catch (error) {
    console.error(`Error fetching board with ID ${id}:`, error);
    throw error;
  }
};
export const createBoard = (id, data) =>
  api.put(endpoints.boards.update(id), data);

// edit qilish
export const updateBoard = (id, data) =>
  api.patch(endpoints.boards.update(id), data);

// Boardni o'chirish
export const deleteBoard = (id) => api.delete(endpoints.boards.delete(id));



export const getStatusesByBoard = async (boardId) => {
  try {
    const res = await api.get(endpoints.status.getByBoardId(boardId));
    return res.data; // kutilyapti: array yoki { statuses: [...] } — backendga qarab o'zgartiring
  } catch (err) {
    console.error(`Error fetching statuses for board ${boardId}:`, err);
    throw err;
  }
};

// Create status for a board
export const createStatusForBoard = async (boardId, data) => {
  try {
    const res = await api.post(endpoints.status.createForBoard(boardId), data);
    return res.data;
  } catch (err) {
    console.error(`Error creating status for board ${boardId}:`, err);
    throw err;
  }
};

// Status detail
export const getStatusById = async (id) => {
  try {
    const res = await api.get(endpoints.status.getById(id));
    return res.data;
  } catch (err) {
    console.error(`Error fetching status ${id}:`, err);
    throw err;
  }
};

// Update status (PUT or PATCH — swagger supports both; PATCH used here)
export const updateStatus = async (id, data) => {
  try {
    const res = await api.patch(endpoints.status.update(id), data);
    return res.data;
  } catch (err) {
    console.error(`Error updating status ${id}:`, err);
    throw err;
  }
};

export const deleteStatus = async (id) => {
  try {
    const res = await api.delete(endpoints.status.delete(id));
    return res.data;
  } catch (err) {
    console.error(`Error deleting status ${id}:`, err);
    throw err;
  }
};