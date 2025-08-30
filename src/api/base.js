import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true, // Enable credentials for all requests
    // headers: {
    //     "Content-Type": "application/json",
    // },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ Content-Type ni dinamik ravishda o'rnatish
        if (config.data instanceof FormData) {
            // FormData uchun Content-Type ni browser avtomatik o'rnatsin
            // multipart/form-data boundary bilan
            delete config.headers['Content-Type'];
        } else {
            // Oddiy JSON uchun
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;