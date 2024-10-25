import { Category, subCategory } from "./category";
import { Child, ChildWithData } from "./Child";

export interface Product {
    _id: string;
    name: string;
    category: Category;
    subCategory: subCategory;
    ID: string;
    children: Child[];
    createdAt: string;
    updatedAt: string;
    Description: string;
    __v: number;
}

export interface ProductFormState {
    name: string;
    category: string;
    // subCategory: string;
    ID: string;
    children: Child[];
    heroImage: File | null;
    heroImageUrl: string;
    Description: string;
}

export interface ProductFormWithData extends Omit<ProductFormState, 'children'> {
    children: ChildWithData[]
}

export interface ProductWithData extends Omit<Product, 'children'> {
    children: ChildWithData[]
}

export interface UploadResult {
    addedProducts: number;
    skippedProducts: number;
    errors: Array<{
        row: number;
        sku: string;
        error: string;
    }>;
};