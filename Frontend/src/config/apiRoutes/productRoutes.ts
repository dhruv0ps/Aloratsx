
import { apiUrl } from "../apiConfig/apiUrl";
import { axiosRequest } from "../apiConfig/axiosRequest";


const getAllProducts = async (config = {}) => {
    return await axiosRequest.get<any>(`${apiUrl.product}`, config);
  };
const deleteChildProduct = async (productId: string, childSKU: string) => {
    return await axiosRequest.del<any>(`${apiUrl.product}/${productId}/child/${childSKU}`);
}
const getProductById = async (param: any) => {
    return await axiosRequest.get<any>(`${apiUrl.product}/${param}`)
}
const updateProduct = async (param: any, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.product}/${param}`, body)
}
const createProduct = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.product}`, body)
}
const AddColor = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.color, body)
}
const GetColors = async () => {
    return await axiosRequest.get<any>(apiUrl.color)
}
const UpdateColors = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.color}/${id}`, body)
}
const AddCategory = async (body: any) => {
    return await axiosRequest.post<any>(apiUrl.Category, body)
}
const GetCategories = async () => {
    return await axiosRequest.get<any>(apiUrl.Category)
}
const UpdateCategories = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.Category}/${id}`, body)
}
const AddsubCategory = async (id: any, body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.subcategory}/${id}`, body)
}
const GetsubCategories = async (id: any) => {
    return await axiosRequest.get<any>(`${apiUrl.subcategory}/${id}`)
}
const UpdatesubCategories = async (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.subcategory}/${id}`, body)
}
const bulkUpload = async (body: any) => {
    return await axiosRequest.post<any>(`${apiUrl.product}bulk`, body)
}

const addRawmaterial = async (body : any) => {
    return await axiosRequest.post<any>(`${apiUrl.rawmaterial}`,body)

}
const getRawmaterial = async () => {
    return await axiosRequest.get<any>(`${apiUrl.rawmaterial}`)
}
const updateRawmaterial = async  (id: string, body: any) => {
    return await axiosRequest.put<any>(`${apiUrl.rawmaterial}/${id}`,body)
}
const deleteRawMaterial = async (id: string) => {
    return await axiosRequest.del(`${apiUrl.rawmaterial}/${id}`)
}
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
const deleteTag = async (id: string) => {
    return await axiosRequest.del<any>(`${apiUrl.tag}/${id}`);
};
export const productApis = {
    AddColor,
    GetColors,
    UpdateColors,
    GetCategories,
    AddCategory,
    UpdateCategories,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteChildProduct,
    getProductById,
    bulkUpload,
    AddsubCategory,
    GetsubCategories,
    UpdatesubCategories,
    addRawmaterial,
    updateRawmaterial,
    getRawmaterial,
    deleteRawMaterial,
    getAllTags,
    createTag,
    updateTag,
    getTagById,
    deleteTag,
}