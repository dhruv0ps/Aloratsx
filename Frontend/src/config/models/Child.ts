// import { Color } from "./color"; // Consider removing if not used
import { Tag} from "./tag"; // Ensure this interface is properly defined
import { RawMaterial } from "./rawmaterial";
interface Size {
    L: number; // Length
    W: number; // Width
    H: number; // Height
}

interface Weight {
    value: number; // Weight value
    unit: 'lb' | 'kg'; // Weight unit
}

interface ChildBase {
    SKU: string; // Stock Keeping Unit
    name: string; // Product name
    // color: Color; // Uncomment if color is needed
    selling_price: number; // Selling price
    cost_price: number; // Cost price
    product_size?: Size; // Optional product size
    weight: Weight; // Product weight
    status: string; // Stock status
    imageUrl: string; // URL for the image
    stock: number; // Available stock
    isActive: boolean; // Active status
    description: string; // Product description
    tags: Tag[]; // Tags for the product
    rawMaterials: RawMaterial[]; 
    childName? : string
}

export interface Child extends ChildBase {
    image: File | null; // Optional image file for the child
}

export interface ChildWithData extends Omit<ChildBase, 'color'> { 
    // color: Color; // Uncomment if color is needed
    image: {
        filename: string; // Name of the image file
        path: string; // Path to the image file
    } | null; // Optional image data
}
