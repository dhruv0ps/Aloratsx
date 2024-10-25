
import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllPendingOrders = async () => {
    return await axiosRequest.get<any>(`${apiUrl.getOrder}/pending`)
}
const createOrderRequest = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.order}`, body)
}
const updateOrder = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.order}/${id}`, body)
}
const getAllApprovedOrders = async () => {
    return await axiosRequest.get<any>(`${apiUrl.getOrder}/approved`)
}
const getOrderbyId = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.order}/${id}`)
}

export const orderApis = {
    getAllPendingOrders,
    getAllApprovedOrders,
    createOrderRequest,
    updateOrder,
    getOrderbyId
}

