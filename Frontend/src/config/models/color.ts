export interface Color {
    _id?: string;
    name: string;
    hexCode: string;
    status: string;
}

export interface FormData {
    colorName: string;
    colorValue: string;
    submittedColors: Color[];
    deletedColors: Color[];
}