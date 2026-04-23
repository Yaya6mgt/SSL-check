export interface ISslCheck {
    id: number;
    isValid: boolean;
    validTo: string;
    issuer: string;
    errorMessage: string | null;
    lastCheck: string;
    domainId: number;
    createdAt: string;
    updatedAt: string;
}

export const initialSslCheck: ISslCheck = {
    id: 0,
    isValid: false,
    validTo: '',
    issuer: '',
    errorMessage: null,
    lastCheck: '',
    domainId: 0,
    createdAt: '',
    updatedAt: ''
};