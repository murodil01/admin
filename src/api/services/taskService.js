import api from "../base";
import endpoints from "../endpoint";

export const getTasks = () => api.get(endpoints.tasks.getAll);
export const getTaskById = (id) => api.get(endpoints.tasks.getById(id));

// Task yaratish - FormData bilan ishlaydi
export const createTask = (formData) => {
  return api.post(endpoints.tasks.create, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Task yangilash - JSON yoki FormData bilan ishlaydi
export const updateTask = (id, data) => {
  // Agar data FormData bo'lsa, multipart/form-data ishlatamiz
  if (data instanceof FormData) {
    return api.patch(endpoints.tasks.update(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Oddiy JSON uchun
  return api.put(endpoints.tasks.update(id), data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// export const updateTask = (id, data) => api.put(endpoints.tasks.update(id), data);
export const deleteTask = (id) => api.delete(endpoints.tasks.delete(id));
export const updateTaskType = (id, tasks_type) =>
  api.patch(endpoints.tasks.update(id), { tasks_type });
export const getTaskTags = () => api.get(endpoints.tasks.getTags);
export const getProjectTaskById = (id) =>
  api.get(endpoints.projects.getByIdTasks(id));
export const getProjectUsers = (id) =>
  api.get(endpoints.projects.getByIdUsers(id));
export const updateProjectUsers = (id) =>
  api.patch(endpoints.projects.updateByIdUsers(id));

export const getTaskFiles = () => api.get(endpoints.tasks.getTaskFiles);
export const uploadTaskFile = (formData) =>
  api.post(endpoints.tasks.createTaskFile, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteTaskFile = (id) =>
  api.delete(endpoints.tasks.deleteTaskFile(id));

// Instructions/Checklist API functions - TO'G'IRLANGAN VERSIYA
export const getTaskInstructions = (taskId) =>
  api.get(endpoints.tasks.getTaskInstructions, { params: { task: taskId } });

// Bu funksiya nomi noto'g'ri edi - to'g'irlaymiz
export const createChecklistItem = (data) =>
  api.post(endpoints.tasks.createTaskInstructions, data);

export const createInstruction = (instructionData) =>
  api.post(endpoints.tasks.createTaskInstructions, instructionData);

// Bu funksiyalar noto'g'ri endpoint ishlatgan edi
export const updateInstruction = (id, data) =>
  api.patch(endpoints.tasks.updateInstruction(id), data);

export const updateTaskInstruction = (id, instructionData) =>
  api.put(endpoints.tasks.updateInstruction(id), instructionData);

export const deleteInstruction = (id) =>
  api.delete(endpoints.tasks.deleteTaskInstruction(id));

export const deleteChecklistItem = (id) =>
  api.delete(endpoints.tasks.deleteTaskInstruction(id));

export const getTaskInstructionsByTask = (taskId) =>
  api.get(endpoints.tasks.getTaskInstructionsByTask(taskId));

// Task files API functions
export const getTaskFilesByTask = (taskId) =>
  api.get(endpoints.tasks.getTaskFilesByTask(taskId));

// Comments API functions
export const getTaskCommentsByTask = async (taskId) =>
  api.get(endpoints.tasks.getTaskCommentsByTask(taskId));

export const createComment = async (commentData) => {
  try {
    return await api.post(endpoints.tasks.getComments, commentData);
  } catch (error) {
    console.error("API Error in createComment:", error);
    throw error;
  }
};
