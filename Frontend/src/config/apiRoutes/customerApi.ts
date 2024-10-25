import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const createCustomer = async (body: any) => {
     return await axiosRequest.post<any>(`${apiUrl.customer}`,body)
}

export const customerApi = {
    createCustomer
}