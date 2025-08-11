import request from "../request";
import endpoint from "../endpoint";

export const getEmployees = () => {
    return request({
        url: endpoint.employees.getAll,
        method: "GET",
    });
};

export const addEmployee = (data) => {
    return request({
        url: endpoint.employees.create, // endpoint ichida create bo'lishi kerak
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" }
    });
};