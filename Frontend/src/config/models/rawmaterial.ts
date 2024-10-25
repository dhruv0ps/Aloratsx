export interface RawMaterial {
    _id?: string;            // Optional ID for the raw material
    material: string;       // The name of the raw material
    description: string;    // Description of the raw material
    image: string;          // URL or path to the image of the raw material
    measuringUnit: string;  // The unit of measurement for the raw material
}

export interface RawMaterialQuantity extends RawMaterial {
    quantity: number;       // The quantity of the raw material
}

// Type union for RawMaterial, allowing it to be either a basic raw material or one with a quantity
export type RawMaterialType = RawMaterial | RawMaterialQuantity;