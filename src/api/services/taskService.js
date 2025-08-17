//////////////////////////////////////////////////////////////////////taskService.js
import api from "../base";
import endpoints from "../endpoint";

export const getTasks = () => api.get(endpoints.tasks.getAll);
export const getTaskById = (id) => api.get(endpoints.tasks.getById(id));
export const createTask = (data) => api.post(endpoints.tasks.create, data);
export const updateTask = (id, data) => api.put(endpoints.tasks.update(id), data);
export const deleteTask = (id) => api.delete(endpoints.tasks.delete(id));
export const updateTaskType = (id, tasks_type) => api.patch(endpoints.tasks.update(id), { tasks_type });
export const getTaskTags = () => api.get(endpoints.tasks.getTags);
export const getProjectTaskById = (id) => api.get(endpoints.projects.getByIdTasks(id));
// export const getTaskFiles = () => api.get(endpoints.tasks.getTaskFiles)
export const getProjectUsers = (id) => api.get(endpoints.projects.getByIdUsers(id));
// export const getInst = () => api.get(endpoints.tasks.getInstruction)



export const getTaskFiles = () => api.get(endpoints.tasks.getTaskFiles);
export const uploadTaskFile = (formData) =>
  api.post(endpoints.tasks.createTaskFile, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteTaskFile = (id) => api.delete(endpoints.tasks.deleteTaskFile(id));


// Instructions/Checklist API functions 
// export const getInst = (taskId) => 
//   api.get(endpoints.tasks.getTaskInstructions, { params: { task: taskId } });
export const getTaskInstructions = (taskId) =>
  api.get(endpoints.tasks.getTaskInstructions, { params: { task: taskId } });

export const createChecklistItem = (data) =>
  api.post(endpoints.tasks.getInstruction, data);

export const createInstruction = (instructionData) => api.post(endpoints.tasks.createTaskInstructions, instructionData);//editTask

export const updateInstruction = (id, data) =>
  api.patch(`${endpoints.tasks.getInstruction}${id}/`, data);

export const updateTaskInstruction = (id, instructionData) => api.put(endpoints.tasks.updateInstruction(id), instructionData);

export const deleteInstruction = (id) => api.delete(endpoints.tasks.deleteTaskInstruction(id));

export const deleteChecklistItem = (id) =>
  api.delete(`${endpoints.tasks.getInstruction}${id}/`);

export const getCommentTask = async (taskId) => {
  try {
    // Make sure you're using the correct endpoint
    // const response = await api.get(`/project/comments/?task=${taskId}`);
    // return response;
    return await api.get(`${endpoints.tasks.getComments}?task=${taskId}`);
  } catch (error) {
    console.error('API Error in getCommentTask:', error);
    throw error;
  }
};

export const createComment = async (commentData) => {
  try {
    // const response = await api.post('/project/comments/', commentData);
    // return response;
    return await api.post(endpoints.tasks.getComments, commentData);
  } catch (error) {
    console.error('API Error in createComment:', error);
    throw error;
  }
};