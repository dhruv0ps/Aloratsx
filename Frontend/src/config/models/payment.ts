import { ApprovedDealer } from "./dealer";
import { Invoice } from "./Invoice";

export interface PaymentBase {
    paymentMode: string;
    amount: number;
    txn_id: string;
    link: string;
    sender_name: string;
    sender_email: string;
    institution_name: string;
    finance_id: string;
    denominations?: { value: number, count: number }[];
    useCreditMemo: boolean;
    dealer: ApprovedDealer | null;
    checkNumber? : string;
    chequeDate ? : string;
    cardHolderName?: string,
    expiryDate?: string,
    cardNumber?: string,
}
export interface PaymentForm extends PaymentBase {
    creditMemoCode: string;
    selectedInvoices: {
        id: string;
        amount: number;
    }[]
}

export interface PaymentData {
    _id: string,
    dealer: ApprovedDealer,
    totalAmount: number;
    txn_id: string;
    link: string;
    sender_name: string;
    sender_email: string;
    institution_name: string;
    finance_id: string;
    paymentDetails: {
        invoice: Invoice;
        amount: number;
    }[]
    denominations?: { value: number, count: number }[];
    mode: string;
    paymentType: string;
    creditMemo: CreditMemoData,
    createdAt: string,
    updatedAt: string,
}

export interface CreditMemoBase {
    amount: number;
    reason: string;
    status: string;
    date: string;
}

export interface CreditMemoForm extends CreditMemoBase {
    creditMemoId: string;
    dealer: string;
}

export interface CreditMemoData extends CreditMemoBase {
    _id: string;
    creditMemoId: string;
    dealer: ApprovedDealer;
    createdAt: string;
    updatedAt: string;
}

