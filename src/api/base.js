import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
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
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response, // ✅ butun response qaytadi
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;