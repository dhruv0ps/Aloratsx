import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllPackingSlips = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.packingSlip}/paged`, body);
};
const getPackingSlipById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.packingSlip}/${id}`);
};
const getPackingSlipBypackingId = async (id: any) => {
    return await axiosRequest.get<any>(`${apiUrl.packingSlip}/${id}`);
};

const getPackingSlipByOrderId = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.order}/po`, body);
}
const updatePackingSlip = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.packingSlip}/${id}`, body);
};
export const packingSlipApis = {
    getAllPackingSlips,
    getPackingSlipById,
    getPackingSlipBypackingId,
    getPackingSlipByOrderId,
    updatePackingSlip,
};
