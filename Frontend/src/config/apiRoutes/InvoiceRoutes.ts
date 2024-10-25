
import { axiosRequest as axios } from '../apiConfig/axiosRequest';
import { apiUrl } from '../apiConfig/apiUrl';

const getAllOrders = async (data: any) => {
    return await axios.post<any>(`${apiUrl.order}/dealer`, data);
};

const getAllDealers = async () => {
    return await axios.get<any>(`${apiUrl.approveddealer}`);
};

const getAllInvoices = async (body: any) => {
    return await axios.post<any>(`${apiUrl.invoice}`, body);
};

const getInvoiceById = async (id: string) => {
    return await axios.get<any>(`${apiUrl.invoice}/${id}`);
};

const addInvoice = async (data: any) => {
    return await axios.post<any>(`${apiUrl.invoice}/add`, data);
};

const getAllTaxSlabs = async () => {
    return await axios.get<any>(apiUrl.taxslab);
}
const deleteInvoice = async (data: any) => {
    return await axios.post<any>(`${apiUrl.invoice}/delete`, data)
}
const updateInvoice = async (id: string, data: any) => {
    return await axios.put<any>(`${apiUrl.invoice}/${id}`, data)
}

export const invoiceApis = {
    getAllOrders,
    getAllDealers,
    getAllInvoices,
    addInvoice,
    getAllTaxSlabs,
    getInvoiceById,
    deleteInvoice,
    updateInvoice
};