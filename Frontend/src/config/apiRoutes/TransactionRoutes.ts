import axios from 'axios';
import { apiUrl } from '../apiConfig/apiUrl';
import { axiosRequest } from '../apiConfig/axiosRequest';

const getAllTransactions = async () => {
    return await axios.get<any>(`${apiUrl.transaction}`);
};

const addTransaction = async (data: any) => {
    return await axios.post(`${apiUrl.transaction}/create`, data);
};

const updateTransaction = async (data: any) => {
    return await axios.put(`${apiUrl.transaction}/update/${data}`);
}

const getAllDealers = async () => {
    return await axios.get<any>(`${apiUrl.approveddealer}`);
}

const getInvoiceList = async (data: any) => {
    return await axios.post<any>(`${apiUrl.invoice}/list`, data)
}

const getTransactionbyTransactionId = async (data: any) => {
    return await axios.post<any>(`${apiUrl.transaction}/id`, data)
}

const getTransactionsByDealer = async (id: any) => {
    return await axiosRequest.get<any>(`${apiUrl.transaction}/dealer/${id}`)
}
export const transactionApis = {
    getAllTransactions,
    getAllDealers,
    addTransaction,
    getInvoiceList,
    updateTransaction,
    getTransactionbyTransactionId,
    getTransactionsByDealer
};