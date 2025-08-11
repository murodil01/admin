import api from "../base";
import endpoints from "../endpoint";

export const login = (data) => api.post(endpoints.auth.login, data);
export const register = (data) => api.post(endpoints.auth.register, data);
export const getMe = () => api.get(endpoints.auth.me);