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
// export const updateLeads = async (leadId, data) => {
//   try {
//     const normalizedData = { ...data };
    
//     // Status uchun aniq konvertatsiya
//     if (normalizedData.status !== undefined && normalizedData.status !== null) {
//       if (typeof normalizedData.status === "object" && normalizedData.status.id) {
//         normalizedData.status = String(normalizedData.status.id);
//       } else if (normalizedData.status !== null) {
//         normalizedData.status = String(normalizedData.status);
//       }
//     }
    
//     // Person uchun aniq konvertatsiya - FAQAT ID yuborish
//     if (normalizedData.person !== undefined) {
//       if (typeof normalizedData.person === "object" && normalizedData.person.id) {
//         normalizedData.person = String(normalizedData.person.id);
//       } else if (normalizedData.person !== null) {
//         normalizedData.person = String(normalizedData.person);
//       }
//     }

//     // Person_detail ni person ga o'tkazish (agar mavjud bo'lsa)
//     if (normalizedData.person_detail !== undefined) {
//       if (typeof normalizedData.person_detail === "object" && normalizedData.person_detail.id) {
//         normalizedData.person = String(normalizedData.person_detail.id);
//       } else if (normalizedData.person_detail !== null) {
//         normalizedData.person = String(normalizedData.person_detail);
//       }
//       // person_detail ni o'chirish, chunki backend person ni kutadi
//       delete normalizedData.person_detail;
//     }
    
//     const url = `board/leads/${leadId}/`;
//     console.log("🔤 Sending to backend:", url, JSON.stringify(normalizedData, null, 2));
    
//     const response = await api.patch(url, normalizedData);
//     console.log("✅ Backend response:", response.data);
//     return response.data;
//   } catch (err) {
//     console.error("❌ Error updating lead:", err?.response?.status, err?.response?.data || err.message);
//     throw err;
//   }
// };

// Lead o'chirish

// leadsService.js dagi updateLeads funksiyasiga debug log qo'shing

export const updateLeads = async (leadId, data) => {
  try {
    console.log("🔄 leadsService.updateLeads called:", leadId, "Data:", data);
    
    const normalizedData = { ...data };
    
    // Status uchun aniq konvertatsiya
    if (normalizedData.status !== undefined && normalizedData.status !== null) {
      const originalStatus = normalizedData.status;
      if (typeof normalizedData.status === "object" && normalizedData.status.id) {
        normalizedData.status = String(normalizedData.status.id);
      } else if (normalizedData.status !== null) {
        normalizedData.status = String(normalizedData.status);
      }
      console.log("📋 Status converted:", originalStatus, "→", normalizedData.status);
    }
    
    // Person uchun aniq konvertatsiya - FAQAT ID yuborish
    if (normalizedData.person !== undefined) {
      const originalPerson = normalizedData.person;
      if (typeof normalizedData.person === "object" && normalizedData.person.id) {
        normalizedData.person = String(normalizedData.person.id);
      } else if (normalizedData.person !== null) {
        normalizedData.person = String(normalizedData.person);
      }
      console.log("👤 Person converted:", originalPerson, "→", normalizedData.person);
    }

    // Person_detail ni person ga o'tkazish (agar mavjud bo'lsa)
    if (normalizedData.person_detail !== undefined) {
      const originalPersonDetail = normalizedData.person_detail;
      if (typeof normalizedData.person_detail === "object" && normalizedData.person_detail.id) {
        normalizedData.person = String(normalizedData.person_detail.id);
      } else if (normalizedData.person_detail !== null) {
        normalizedData.person = String(normalizedData.person_detail);
      }
      delete normalizedData.person_detail;
      console.log("🔄 Person_detail converted to person:", originalPersonDetail, "→", normalizedData.person);
    }
    
    const url = `board/leads/${leadId}/`;
    console.log("📤 Final request URL:", url);
    console.log("📋 Final payload:", JSON.stringify(normalizedData, null, 2));
    
    const response = await api.patch(url, normalizedData);
    console.log("✅ Backend response:", response.data);
    
    return response.data;
  } catch (err) {
    console.error("❌ updateLeads error:", {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      message: err.message
    });
    throw err;
  }
};



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

// Leadlarni boshqa groupga ko'chirish
export const moveLeadsToGroup = async (targetGroupId, leadIds) => {
  try {
    const payload = {
      group: targetGroupId,
      leads: leadIds
    };

    const response = await api.patch(endpoints.leads.moveTo, payload);
    return response.data;
  } catch (error) {
    console.error('Move leads error:', error);
    throw error;
  }
};