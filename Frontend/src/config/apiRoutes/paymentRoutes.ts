
import { apiUrl } from '../apiConfig/apiUrl';
import { axiosRequest } from '../apiConfig/axiosRequest';

const validateMemo = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.creditMemo}-validate`, body);
};

const createPayment = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.payment}`, body);
};

const invoicesByDealer = async (id: string) => {
    return await axiosRequest.get<any>(`${apiUrl.unpaidinv}/${id}`);
};

const getPagedPayements = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.payment}/all`, body);
};

export const paymentApis = {
    validateMemo,
    createPayment,
    invoicesByDealer,
    getPagedPayements
};