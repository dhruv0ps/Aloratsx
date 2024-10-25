import { axiosRequest } from '../apiConfig/axiosRequest';
import { apiUrl } from '../apiConfig/apiUrl';


const addLogs = async (data: any) => {
    return await axiosRequest.post<any>(`${apiUrl.addLogs}`, data); 
};

export const logApi ={
addLogs
}