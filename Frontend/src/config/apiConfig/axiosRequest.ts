import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const axiosRequest = {
    get: <T>(url: string, params?: {}) => axios.get<T>(url, { params }).then(responseBody),
    post: <T>(url: string, body:{}, params?: {}, type: any = 'json') =>
        axios.post<T>(url, body,{ responseType: type, params }).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axios.interceptors.response.use(
    async response => {
        await sleep(1000);
        if (response.data.status === false) {
            toast.error(response.data.err)
            throw new Error(response.data.err);
        }
        return response;
    },
    async (error: AxiosError<any>) => {
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
        } else {
            const { data, status } = error.response;
            // console.log(data,"----")
            let errorMessage = 'An unexpected error occurred';

            if (data && data.err) {
                errorMessage = data.err;
            } else if (typeof data === 'string') {
                errorMessage = data;
            }

            switch (status) {
                case 400:
                    toast.error(errorMessage);
                    break;
                case 401:
                    toast.error('Unauthorized. Please log in again.');
                    localStorage.clear()
                    // window.location.reload()
                    break;
                case 404:
                    toast.error('Resource not found');
                    break;
                default:
                    toast.error(errorMessage);
            }
        }
        return Promise.reject(error);
    }
);

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}