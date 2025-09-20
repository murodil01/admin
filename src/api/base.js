import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL;

// axios instance
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Content-Type'ni dinamik ravishda o'rnatish
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token'ni qayta yuklash funksiyasi
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor - Token yangilanishini boshqarish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Agar refresh jarayoni davomida bo'lsa, navbatga qo'yish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      console.log("Refresh token available:", refreshToken ? "Yes" : "No");
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          
          localStorage.setItem("token", access);
         

          // API default headers'ni yangilash
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          processQueue(null, access);
          
          // Original request'ni yangi token bilan qayta yuborish
          originalRequest.headers.Authorization = `Bearer ${access}`;
          console.log("Retrying original request with new token");
          return api(originalRequest);
          
        } catch (refreshError) {
            console.error("Refresh token error:", refreshError);
            console.error("Refresh failed:", refreshError);
            console.error("Refresh error details:", {
              status: refreshError.response?.status,
              data: refreshError.response?.data
            });
          processQueue(refreshError, null);
          
          // Refresh ham muvaffaqiyatsiz bo'lsa, tokenlarni tozalash
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          
           // Login sahifasiga yo'naltirish
           if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        console.log("No refresh token, redirecting to login");
        // Refresh token yo'q bo'lsa
        localStorage.removeItem("token");
        if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;