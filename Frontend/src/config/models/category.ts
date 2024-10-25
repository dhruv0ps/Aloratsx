export interface Category {
    _id?: string;
    name: string;
    description: string;
    image: string;
    status: 'ACTIVE' | 'DELETED';
}

export interface subCategory {
    _id?: string;
    name: string
    category: Category,
    image?: string,
    status: string
}