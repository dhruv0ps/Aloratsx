import { Address } from "./address";
import { AgentWithData } from "./agent";
import { ApprovedDealer as Dealer } from "./dealer";
import { Product } from "./product";
export interface OrderBase {
    purchaseOrderNumber: string;
    date: string;
    billTo: {
        companyName: string;
        address: Address;
    };
    shipTo: {
        companyName: string;
        address: Address;
    };
    agent: AgentWithData | null;
    totalBeforeTax: number;
    gst: number;
    hst: number;
    qst: number;
    pst: number;
    transportation: number;
    grandTotal: number;
}

export interface OrderFormState extends OrderBase {
    dealer: string;
    products: Array<{
        product: string;
        parentName: string;
        parent_id: string;
        childSKU: string;
        quantity: number;
        price: number;
    }>;
}

export interface OrderWithData extends OrderBase {
    _id: string;
    dealer: Dealer;
    products: Array<{
        product: Product;
        parentName: string;
        parent_id: string;
        childSKU: string;
        quantity: number;
        price: number;
    }>;

    phase: string,
    status: string,
    invoiceStatus: string,
    createdAt: string,
    updatedAt: string
}