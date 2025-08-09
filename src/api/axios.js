import axios from "axios";

// 1. Axios instansiyasini yaratish
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // .env fayldan API bazaviy URL
  timeout: 10000, // 10 soniya ichida javob bo'lmasa, to‘xtaydi
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor – tokenni qo‘shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor – 401, 500, va boshqalarni tutish
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token muddati tugagan yoki noto‘g‘ri
        console.warn("Token muddati tugagan yoki noto‘g‘ri");
        localStorage.removeItem("token");
        window.location.href = "/login"; // Login sahifaga redirect
      }
    }

    return Promise.reject(error);
  }
);

// 4. Tayyor axios instansiyani eksport qilish
export default axiosInstance;
