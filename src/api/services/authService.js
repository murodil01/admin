import api from "../base";
import endpoints from "../endpoint";

export const login = (data) => api.post(endpoints.auth.login, data);
export const getMe = () => api.get(endpoints.auth.me);

export const refreshTokens = (refreshToken) => 
  api.post(endpoints.auth.refresh, { refreshToken });

export const logout = (refreshToken) => 
  api.post(endpoints.auth.logout, { refreshToken });