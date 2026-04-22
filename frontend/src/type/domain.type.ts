export interface Domain {
    id: number;
    hostname: string;
    serverId: number;
    createdAt: string;
    updatedAt: string;
    checks: {
        id: number;
        isValid: boolean;
        validTo: string;
        issuer: string;
        errorMessage: string | null;
        lastCheck: string;
        domainId: number;
        createdAt: string;
        updatedAt: string;
    }[];
}