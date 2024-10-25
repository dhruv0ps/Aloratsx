import { RawMaterial } from "./rawmaterial";

export interface Variant {
    height: string;
    width: string;
    length: string;
    firmness: string;
    price: string;
    weight: string;
    color: string;
    childName: string;
    rawMaterials: RawMaterial[];
    tags: string[];
  }