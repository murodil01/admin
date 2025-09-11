import api from "../base";
import endpoints from "../endpoint";

export const getProjects = async (page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    
    // Handle each filter parameter
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        // For department_name array, append each value separately
        value.forEach(item => {
          params.append(key, item);
        });
      } else if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    console.log('API request URL:', `${endpoints.projects.getAll}?${params.toString()}`);
    const response = await api.get(`${endpoints.projects.getAll}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('getProjects error:', error);
    throw error;
  }
};

export const getProjectById = async (id) => {
    const res = await api.get(endpoints.projects.getById(id));
    return res.data;
};

export const createProject = async (data) => {
    const res = await api.post(endpoints.projects.create, data);
    return res.data;
};

export const updateProject = async (id, data) => {
    const res = await api.put(endpoints.projects.update(id), data);
    return res.data;
};

export const deleteProject = async (id) => {
    const res = await api.delete(endpoints.projects.delete(id));
    return res.data;
};

export const getProjectMembers = (projectId) => 
  api.get(endpoints.projects.getMembers(projectId));