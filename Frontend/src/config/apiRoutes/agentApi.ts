import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllAgents = async () => {
    return await axiosRequest.get<any>(`${apiUrl.agent}`);
};

const createAgent = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.agent}/add`, body);
};

const updateAgent = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.agent}/${id}`, body);
};

const getAgentById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.agent}/${id}`);
};

export const agentApis = {
    getAllAgents,
    createAgent,
    updateAgent,
    getAgentById,
};
