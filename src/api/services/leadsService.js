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

export const updateStatus = async (statusId, data) => {
  try {
    // normalize status (agar object bo‘lsa id olib qolamiz)
    if (data.status && typeof data.status === "object") {
      data.status = data.status.id ?? data.status;
    }
    const url = endpoints.board?.updateStatus
      ? endpoints.board.updateStatus(statusId)
      : `board/status/${statusId}/`; 

    console.log("🔄 Updating status:", url, data);

    const res = await api.patch(url, data); // PATCH – faqat o‘zgarayotgan fieldlar
    return res.data;
  } catch (err) {
    console.error(
      "❌ Error updating status:",
      err?.response?.status,
      err?.response?.data || err.message
    );
    throw err;
  }
};
export const updateLeads = async (groupId, leadId, data) => {
  try {
    // normalize status
    if (data.status && typeof data.status === "object") data.status = data.status.id ?? data.status;

    const url = endpoints.leads.update
      ? endpoints.leads.update(groupId, leadId)
      : `leads/${groupId}/${leadId}/`; // fallback

    console.log("Updating lead:", url, data);
    const res = await api.patch(url, data); // PATCH is safer than PUT for partial updates
    return res.data;
  } catch (err) {
    console.error("Error updating lead:", err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

// Lead o‘chirish
export const deleteLeads = (groupId, leadId) => {
  if (!groupId || !leadId)
    return Promise.reject(new Error("Group ID yoki Lead ID mavjud emas"));
  return api.delete(endpoints.leads.delete(groupId, leadId));
};
