export interface taxSlab {
    _id?: string;
    name: string;
    hst: number;
    gst: number;
    qst: number;
    pst: number;
    status: string;
}

export interface TaxFormData extends taxSlab {
    submittedSlabs: taxSlab[];
    deletedSlabs: taxSlab[];
}