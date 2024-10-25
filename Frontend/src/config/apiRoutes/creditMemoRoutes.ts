import axios from 'axios';
import { apiUrl } from '../apiConfig/apiUrl';

const getAllCreditMemos = async () => {
    return await axios.get<any>(`${apiUrl.creditMemo}/all`);
};

const createCreditMemo = async (data: any) => {
    return await axios.post(`${apiUrl.creditMemo}/create`, data);
};

const updateCreditMemo = async (id: string, data: any) => {
    return await axios.put(`${apiUrl.creditMemo}/update/${id}`, data);
};

const getCreditMemoById = async (id: string) => {
    return await axios.post<any>(`${apiUrl.creditMemo}/id`, { id });
};

export const creditMemoApis = {
    getAllCreditMemos,
    createCreditMemo,
    updateCreditMemo,
    getCreditMemoById,
};