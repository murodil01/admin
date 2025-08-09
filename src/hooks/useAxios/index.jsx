import axios from "axios";

export const useAxios = () => {
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


// import { useState, useEffect } from "react";
// import { request } from "../api/request";

// export const useAxios = ({ url, method = "get", body = null, params = null }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await request({ url, method, body, params });
//         setData(res.data);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [url, method, body, params]);

//   return { data, loading, error };
// };
