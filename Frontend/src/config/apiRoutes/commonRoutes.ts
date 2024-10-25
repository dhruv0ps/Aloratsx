
import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllTaxSlabs = async () => {
    return await axiosRequest.get<any>(`${apiUrl.taxslab}`)
}
const createTaxSlab = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.taxslab}/add`, body)
}
const updateTaxSlab = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.taxslab}/${id}`, body)
}
export const commonApis = {
    getAllTaxSlabs,
    createTaxSlab,
    updateTaxSlab
}
