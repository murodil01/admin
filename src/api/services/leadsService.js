import api from "../base";
import endpoints from "../endpoint";

// Barcha leadlarni olish (agar groupId berilsa, shu groupga tegishlilarni oladi)
export const getLeads = (groupId) => {
  let url = endpoints.leads.getAll || 'board/leads/';
  if (groupId) {
    url += `?group=${groupId}`;
  }
  return api.get(url);
};

// Lead yaratish
export const createLeads = (data) => {
  return api.post(endpoints.leads.create, data);
};

// Lead yangilash - optimallashtirilgan versiya
export const updateLeads = async (leadId, data) => {
  try {
    const normalizedData = { ...data };
    
    // Status uchun aniq konvertatsiya
    if (normalizedData.status !== undefined && normalizedData.status !== null) {
      if (typeof normalizedData.status === "object") {
        // Agar obyekt bo'lsa, id ni string sifatida olish
        normalizedData.status = normalizedData.status.id ? String(normalizedData.status.id) : null;
      } else {
        // Agar string bo'lsa, string sifatida qoldirish
        normalizedData.status = String(normalizedData.status);
      }
    }
    
    // Person_detail uchun ham xuddi shunday
    if (normalizedData.person_detail && typeof normalizedData.person_detail === "object") {
      normalizedData.person_detail = normalizedData.person_detail.id ? String(normalizedData.person_detail.id) : null;
    }
    
    const url = `board/leads/${leadId}/`;
    console.log("📤 Sending to backend:", url, JSON.stringify(normalizedData, null, 2));
    
    const response = await api.patch(url, normalizedData);
    console.log("✅ Backend response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error updating lead:", err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

// Lead o'chirish
export const deleteLeads = (groupId, leadId) => {
  if (!leadId) return Promise.reject(new Error("Lead ID mavjud emas"));
  
  let url = `board/leads/${leadId}/`;
  if (groupId) {
    url += `?group=${groupId}`;
  }
  return api.delete(url);
};

// Status yangilash (agar kerak bo'lsa)
export const updateStatus = async (statusId, data) => {
  try {
    // normalize status
    if (data.status && typeof data.status === "object") {
      data.status = data.status.id ?? data.status;
    }
    
    const url = `board/status/${statusId}/`;
    console.log("Updating status:", url, data);

    const res = await api.patch(url, data);
    return res.data;
  } catch (err) {
    console.error("Error updating status:", err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
};

// KERAKSIZ FUNKSIYALAR OLIB TASHLANDI:
// - getLeads() - chunki groups endpointidan leads_group olish kifoya
// - getLeadsById() - keraksiz
// - createAllStatus() - keraksiz duplicate



// import api from "../base";
// import endpoints from "../endpoint";

// // Barcha leadlarni olish (agar groupId berilsa, shu groupga tegishlilarni oladi)
// export const getLeads = (groupId) => {
//   let url = endpoints.leads.getAll || 'board/leads/';
//   if (groupId) {
//     url += `?group=${groupId}`;
//   }
//   return api.get(url);
// };

// // ID bo‘yicha lead olish
// export const getLeadsById = (id) => {
//   return api.get(endpoints.leads.getById(id));
// };

// // Yangi lead yaratish
// export const createLeads = (data) => {
//   return api.post(endpoints.leads.create, data);
// };

// export const updateStatus = async (statusId, data) => {
//   try {
//     // normalize status (agar object bo‘lsa id olib qolamiz)
//     if (data.status && typeof data.status === "object") {
//       data.status = data.status.id ?? data.status;
//     }
//     const url = endpoints.board?.updateStatus
//       ? endpoints.board.updateStatus(statusId)
//       : `board/status/${statusId}/`;

//     console.log("🔄 Updating status:", url, data);

//     const res = await api.patch(url, data); // PATCH – faqat o‘zgarayotgan fieldlar
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ Error updating status:",
//       err?.response?.status,
//       err?.response?.data || err.message
//     );
//     throw err;
//   }
// };
// export const updateLeads = async (...args) => {
//   let groupId = null;
//   let leadId;
//   let data;

//   if (args.length === 2) {
//     [leadId, data] = args;
//   } else if (args.length === 3) {
//     [groupId, leadId, data] = args;
//   } else {
//     throw new Error("Invalid arguments for updateLeads");
//   }

//   try {
//     // normalize data
//     if (data.status && typeof data.status === "object") data.status = data.status.id ?? data.status;
//     if (data.person && typeof data.person === "object") data.person = data.person.id ?? data.person;

//     let url = `board/leads/${leadId}/`;
//     if (groupId) {
//       url += `?group=${groupId}`;
//     }

//     console.log("Updating lead:", url, data);
//     const res = await api.patch(url, data); // PATCH is safer than PUT for partial updates
//     return res.data;
//   } catch (err) {
//     console.error("Error updating lead:", err?.response?.status, err?.response?.data || err.message);
//     throw err;
//   }
// };

// // Lead o‘chirish
// export const deleteLeads = (groupId, leadId) => {
//   if (!leadId)
//     return Promise.reject(new Error("Lead ID mavjud emas"));
//   let url = `board/leads/${leadId}/`;
//   if (groupId) {
//     url += `?group=${groupId}`;
//   }
//   return api.delete(url);
// };

// export const createAllStatus = (boardId, data) => {
//   return api.patch(endpoints.status.createStatus(boardId), data);
// }