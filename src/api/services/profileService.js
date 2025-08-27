// profileService.js
import api from "../base";
import endpoints from "../endpoint";

const API_BASE = "https://prototype-production-2b67.up.railway.app"; // sizning backend host

// Login qilingan user profilini olish
export const getMyProfile = async () => {
    const url = endpoints.users.me;

    try {
        const res = await api.get(url);
        let data = res.data;

        if (data.profile_picture && data.profile_picture.startsWith("/")) {
            data.profile_picture = `${API_BASE}${data.profile_picture}`;
        }
        return data;
    } catch (error) {
        console.error("❌ Profilni olishda xatolik:", error.response?.data || error.message);
        throw error;
    }
};

// Profilni yangilash (faqat ruxsat etilgan fieldlar bilan)
export const updateMyProfile = async (data) => {
    try {
        // Avval me dan id olamiz
        const me = await getMyProfile();
        const id = me.id;

        const url = endpoints.users.updateProfile(id);

        let res;
        const allowedFields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "birth_date",
            "address",
            "tg_username",
            "password",
            "password1",
            "profile_picture",
        ];

        if (data.profile_picture instanceof File) {
            // Agar fayl bo'lsa → FormData
            const formData = new FormData();
            allowedFields.forEach((key) => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            res = await api.patch(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } else {
            // Oddiy JSON
            const jsonData = {};
            allowedFields.forEach((key) => {
                if (data[key] !== null && data[key] !== undefined) {
                    jsonData[key] = data[key];
                }
            });

            res = await api.patch(url, jsonData);
        }

        return res.data;
    } catch (error) {
        console.error("❌ Profilni yangilashda xatolik:", error);
        throw error;
    }
};