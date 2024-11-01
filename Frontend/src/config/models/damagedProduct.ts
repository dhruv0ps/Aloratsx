// import { Child } from "./Child";
import { Product } from "./product";

export interface DamagedProductFormData {
    product: string;
    child: string;
    quantity: number;
    comments: string;
    location?: string;
}

export interface DamagedProduct {
    _id: string;
    product: Product;
    // child: Child;
    quantity: number;
    comments: string;
    location: Location;
    createdAt: Date;
    updatedAt: Date;
}

