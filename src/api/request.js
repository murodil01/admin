import axiosInstance from "./axios";

/**
 * Universal request function
 * @param {string} url - endpoint
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method - HTTP metodi
 * @param {object} body - Yuboriladigan data
 * @param {object} params - URL query params
 * @returns Promise
 */
const request = async ({ url, method = "GET", body = {}, params = {} }) => {
  return axiosInstance({
    url,
    method,
    data: body,
    params,
  });
};

export default request;
