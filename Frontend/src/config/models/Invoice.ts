import { Address } from "./address";
import { FormDataApprovedDealer } from "./dealer";
import { OrderWithData } from "./order";

interface EmbeddedDealer {
    dealer: FormDataApprovedDealer;
    dealerName: string;
    dealerAddress: Address;
}

interface EmbeddedProduct {
    parentName?: string;
    childSKU: string;
    childName?: string;
    quantity: number;
    description?: string;
    price: number;
}

interface TaxSlab {
    name?: string;
    gst: number;
    hst: number;
    qst: number;
    pst: number;
}

export interface Invoice {
    _id: string,
    invoiceNumber: string;
    dealer: EmbeddedDealer;
    taxSlab: TaxSlab;
    order: OrderWithData;
    purchaseOrderNumber: string;
    products: EmbeddedProduct[];
    dueDate: Date;
    type: string;
    subtotal?: number;
    paidAmount: number;
    totalAmount: number;
    dueAmount: number;
    invoiceStatus: 'unpaid' | 'partially paid' | 'fully paid';
    createdAt: Date;
    updatedAt: Date;
}
