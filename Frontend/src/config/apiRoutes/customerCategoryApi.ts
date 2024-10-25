import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";


const createCustomercateory = async(body : any) => {
    return await axiosRequest.post<any>(`${apiUrl.customerCategory}/add`,body)
}

const getCustomercategories = async() => {
    return await axiosRequest.get<any>(`${apiUrl.customerCategory}`)
}

export const customerCategoryApi = {
    createCustomercateory,
    getCustomercategories
}