// import { Child } from "./Child"
import { Product } from "./product"
import { Location } from "./supplier"

export interface Inventory {
    _id: string,
    product: Product,
    child: string,
    // childInfo: Child,
    quantity: number,
    location: Location,
    booked: number,
    damaged: number,
    createdAt: Date,
    updatedAt: Date,
}