export interface Invoice {
    value: string;
    label: string; 
}

export interface Transaction {
    transactionId: string;
    transactionDate: string;
    dealer: string;
    invoiceId:string;
    type:string;
    invoiceNumber:string;
    capturedAmount:number;
    invoiceTotalAmount:number;
    invoiceDueAmount:string;
}