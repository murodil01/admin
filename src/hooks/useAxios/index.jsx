import axios from "axios";

export const usaAxios = () => {
  const request = ({ url, method, body, params }) => {
    return axios({
      url: `${import.meta.env.VITE_BASE_URL}/${url}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params,
    });
  };
  return request;
};
