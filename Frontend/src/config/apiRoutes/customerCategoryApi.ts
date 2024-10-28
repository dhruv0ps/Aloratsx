import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";


const createCustomercateory = async(body : any) => {
    return await axiosRequest.post<any>(`${apiUrl.customerCategory}/add`,body)
}

const getCustomercategories = async() => {
    return await axiosRequest.get<any>(`${apiUrl.customerCategory}`)
}

const updateCustomercateory = async(id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.customerCategory}/${id}`,body)
}

const activteCategory = async (id : string) => {
    return await axiosRequest.del<any>(`${apiUrl.customerCategory}/activate/${id}`)
}

export const customerCategoryApi = {
    createCustomercateory,
    getCustomercategories,
    updateCustomercateory,
    activteCategory
}