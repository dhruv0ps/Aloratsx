import { OrderWithData } from "./order";

interface EmbeddedProduct {
    parentName: string;
    childSKU: string;
    childName: string;
    quantity: number;
    description: string;
    checked: boolean;
}

interface OrderDetails {
    dealerName: string;
    purchaseOrderNumber: string;
    products: EmbeddedProduct[];
}

export interface PackingSlip {
    _id: string;
    packingID: string;
    orderDetails: OrderDetails;
    order: OrderWithData;
    phase: 'Draft' | 'Finalized' | 'Completed';
    receivedSign?: string;
    createdAt: Date;
    updatedAt: Date;
}