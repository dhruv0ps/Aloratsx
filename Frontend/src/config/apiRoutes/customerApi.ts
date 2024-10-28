import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const createCustomer = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.customer}`, body);
};

const getCustomers = async (params = {}) => {
    return await axiosRequest.get<any>(`${apiUrl.customer}`, params);
};

const getCustomerById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.customer}/${id}`);
};

const updateCustomer = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.customer}/${id}`, body);
};

const deleteCustomer = async (id: string) => {
    return await axiosRequest.del<any>(`${apiUrl.customer}/${id}`);
};

const activateCustomer = async (id: string) => {
    return await axiosRequest.patch<any>(`${apiUrl.customer}/${id}/activate`, {});
};


export const customerApi = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    activateCustomer,
};
