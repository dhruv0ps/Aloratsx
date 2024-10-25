import { axiosRequest } from '../apiConfig/axiosRequest';
import { apiUrl } from '../apiConfig/apiUrl';

const getAllUsers = async () => {
    return await axiosRequest.get<any>(apiUrl.user);
}

const getUserById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.user}/${id}`);
}

const createUser = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.user, body);
}

const updateUser = async (id: string, body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.user}/${id}`, body);
}
export const userApi = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
}