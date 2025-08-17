import api from "../base";
import endpoints from "../endpoint";

// Barcha leadlarni olish (agar groupId berilsa, shu groupga tegishlilarni oladi)
export const getLeads = (groupId) => {
  if (groupId) {
    // Agar API shunday ishlasa: /leads?group=groupId
    return api.get(`${endpoints.leads.getAll}?group=${groupId}`);
  }
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

// Lead yangilash (boardId va leadId bilan)
export const updateLeads = (boardId, leadId, data) => {
  if (!boardId || !leadId) {
    return Promise.reject(new Error("Board ID yoki Lead ID mavjud emas"));
  }
  return api.patch(endpoints.leads.update(boardId, leadId), data);
};


// Lead o‘chirish
export const deleteLeads = (id) => {
  return api.delete(endpoints.leads.delete(id));
};
