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

// Lead yangilash (group va leadId bilan)
// Lead yangilash
export const updateLeads = (groupId, leadId, data) => {
  if (!groupId || !leadId)
    return Promise.reject(new Error("Group ID yoki Lead ID mavjud emas"));
  return api.patch(endpoints.leads.update(groupId, leadId), data);
};

// Lead o‘chirish
export const deleteLeads = (groupId, leadId) => {
  if (!groupId || !leadId)
    return Promise.reject(new Error("Group ID yoki Lead ID mavjud emas"));
  return api.delete(endpoints.leads.delete(groupId, leadId));
};
