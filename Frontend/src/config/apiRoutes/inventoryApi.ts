import { axiosRequest } from '../apiConfig/axiosRequest';
import { apiUrl } from '../apiConfig/apiUrl';

const getAllInventory = async (filters: any) => {
    return await axiosRequest.post<any>(`${apiUrl.getinventory}`, filters);
}
const getInventoryById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.inventory}/${id}`);
}
const createInventory = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.inventory, body);
}
const updateInventory = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.inventory}/${id}`, body);
}
const getAllInvLocations = async () => {
    return await axiosRequest.get<any>(`${apiUrl.invLocations}`);
}
const createInvLocations = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.invLocations}`, body);
}
const getInvLocationById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.invLocations}/${id}`);
}
const updateInvLocation = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.invLocations}/${id}`, body);
}
const getAllLogs = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.logs}`, body)
}
const getDamagedProducts = async () => {
    return await axiosRequest.get<any>(`${apiUrl.damagedInventory}`);
}
const addDamagedProduct = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.damagedInventory}`, body);
}
const updateDamagedProduct = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.damagedInventory}/${id}`, body);
}
const getInventoryByLocation = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.invByLoc}/${id}`);
}
const moveInventory = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.invMove}`, body);
}

const markAsComplete = async (id : any , body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.inventory}/mark-completed/${id}`, body)
} 

export const inventoryApi = {
    getAllInventory,
    getInventoryById,
    markAsComplete,
    createInventory,
    updateInventory,
    getAllInvLocations,
    createInvLocations,
    getInvLocationById,
    updateInvLocation,
    addDamagedProduct,
    updateDamagedProduct,
    getDamagedProducts,
    moveInventory,
    getInventoryByLocation,
    getAllLogs
}