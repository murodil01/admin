import api from "../base";
import endpoints from "../endpoint";

export const getDepartments = () => api.get(endpoints.department.getAll);

export const getDepartmentById = (id) => api.get(endpoints.department.getById(id));
