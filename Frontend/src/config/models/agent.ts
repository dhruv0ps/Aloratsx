import { OrderWithData } from "./order";

export interface BaseAgent {
    name: string;
    number: string;
    commission: number;
    email: string;
    status: 'ACTIVE' | 'DELETED';
}


export interface AgentWithData extends BaseAgent {
    _id: string;
    linkedOrders: OrderWithData[]
}