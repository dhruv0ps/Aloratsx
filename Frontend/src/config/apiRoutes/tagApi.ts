import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";

const getAllTags = async () => {
    return await axiosRequest.get<any>(`${apiUrl.tag}`);
};

const createTag = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.tag}`, body);
};

const updateTag = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.tag}/${id}`, body);
};

const getTagById = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.tag}/${id}`);
};

export const tagApis = {
    getAllTags,
    createTag,
    updateTag,
    getTagById,
};
