import { axiosRequest } from '../apiConfig/axiosRequest';
import { apiUrl } from '../apiConfig/apiUrl';

const postLogin = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.login, body);
}

const getCurrentUser = async () => {
    return await axiosRequest.get<any>(apiUrl.currentUser);
}

const postRegister = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.register, body);
}

const postLogout = async () => {
    return await axiosRequest.post<any>(apiUrl.logout, {});
}

export const authApis = {
    postLogin,
    getCurrentUser,
    postRegister,
    postLogout
}
