// import axios from "axios";

// export const usaAxios = () => {
//   const request = ({ url, method, body, params }) => {
//     return axios({
//       url: `${import.meta.env.VITE_BASE_URL}/${url}`,
//       method,
//       data: body,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       params,
//     });
//   };
//   return request;
// };


import { useCallback } from "react";
import api from "../api/base";

const useAxios = () => {
  const request = useCallback(async (method, url, data = null, config = {}) => {
    try {
      const response = await api({ method, url, data, ...config });
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  return { request };
};

export default useAxios;