
import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllPendingDealers = async () => {
    return await axiosRequest.get<any>(`${apiUrl.tempdealer}`)
}
const createTempDealer = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.tempdealer}/add`, body)
}
const updateTempDealer = async (id: string, body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.tempdealer}/${id}`, body)
}
const getTempDealerbyId = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.tempdealer}/${id}`)
}
const getAllApprovedDealers = async () => {
    return await axiosRequest.get<any>(`${apiUrl.approveddealer}`)
}
const createApprovedDealer = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.approveddealer}/add`, body)
}
const updateApprovedDealer = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.approveddealer}/${id}`, body)
}
const getApprovedDealerbyId = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.approveddealer}/${id}`)
}
const getTransactionByDealer = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.transaction}/dealer/${id}`)
}
export const dealerApis = {
    getAllPendingDealers,
    createTempDealer,
    updateTempDealer,
    getTempDealerbyId,
    getAllApprovedDealers,
    createApprovedDealer,
    updateApprovedDealer,
    getApprovedDealerbyId,
    getTransactionByDealer
}
