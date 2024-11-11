import { Address } from "./address";
import { taxSlab } from "./taxslab";

export interface Dealerbase {
    username: string;
    email: string;
    mobile: string;
    designation: string;
    company: string;
    address: Address;
    totalOpenBalance: number;
    totalBalance: number;
    paidAmount: number;
    customercategory: string;
}

export interface DealerForm extends Dealerbase {
    province: string; // Use string when handling form data with just the province ID
}

export interface Dealer extends Dealerbase {
    _id: string;
    createdAt: string;
    updatedAt: string;
    province: taxSlab; // Use taxSlab type for the full province object in Dealer
    name: string;
    id: string;
}

export interface ApprovedDealerBase {
    contactPersonName: string;
    contactPersonCell: string;
    contactPersonEmail: string;
    designation: string;
    companyName: string;
    address: Address;
    priceDiscount: number;
    emailId: string;
    password: string;
    creditDueDays: number;
    creditDueAmount: number;
    totalOpenBalance: number;
    totalBalance: number;
    paidAmount: number;
    customercategory?: string;
}

export interface FormDataApprovedDealer extends ApprovedDealerBase {
    province: string | taxSlab; // Allow province to be either string or taxSlab
}

export interface ApprovedDealer extends ApprovedDealerBase {
    _id: string;
    createdAt: string;
    updatedAt: string;
    province: taxSlab; // Use taxSlab for the full province object in ApprovedDealer
    status: string;
}
