import type { Domain } from "./domain.type";

export interface Server {
    id: number;
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
    domains: Domain[];
}
