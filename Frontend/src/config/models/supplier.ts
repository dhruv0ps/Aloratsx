import { Address } from "./address";

export interface Location {
  _id?: string;
  name: string;
  emailID: string;
  address: Address;
  pickupGoogleMapLink: string;
  status?: string
}