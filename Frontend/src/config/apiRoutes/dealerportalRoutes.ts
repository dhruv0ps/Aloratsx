
import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

// const getAllTaxSlabs = async () => {
//     return await axiosRequest.get<any>(`${apiUrl.taxslab}`)
// }
const login = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.logindealer}/login`, body)
}
// const updateTaxSlab = async (id: string, body: any) => {
//     return await axiosRequest.put<any>(`${apiUrl.taxslab}/${id}`, body)
// }
const logout = async () => {
    return await axiosRequest.post<any>(`${apiUrl.logindealer}`, {} )
}
export const dealerportalApi = {
    // getAllTaxSlabs,
    login,
    logout
    // updateTaxSlab
}
