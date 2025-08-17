import api from "../base";
import endpoints from "../endpoint";

// Barcha leadlarni olish
export const getLeads = () => {
  return api.get(endpoints.leads.getAll);
};

// ID bo‘yicha lead olish
export const getLeadsById = (id) => {
  return api.get(endpoints.leads.getById(id));
};

// Yangi lead yaratish
export const createLeads = (data) => {
  return api.post(endpoints.leads.create, data);
};

// Lead yangilash
export const updateLeads = (id, data) => {
  return api.put(endpoints.leads.update(id), data);
};

// Lead o‘chirish
export const deleteLeads = (id) => {
  return api.delete(endpoints.leads.delete(id));
};