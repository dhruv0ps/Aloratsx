export interface Address{
    unit: string;
    buzzCode?: string;
    street: string;
    province: string;
    postalCode: string;
    city: string;
    isDefault: boolean;
}
export interface BaseCustomer {
    firstName: string;
  lastName: string;
  phoneNumber?: string;
  cell: string;
  emailId: string;
  emailId2?: string;
  businessName: string;
  customerCategory?: string;
  addresses: Address[];
}