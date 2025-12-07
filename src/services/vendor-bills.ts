import { api } from './api';

export enum VendorBillStatus {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    PAID = 'PAID',
    VOID = 'VOID',
}

export interface VendorBillItem {
    id?: string;
    description: string;
    amount: number;
    taxRate: number;
    taxAmount: number;
    accountId: string;
    account?: {
        id: string;
        name: string;
        code: string;
    };
}

export interface VendorBill {
    id: string;
    billNumber: string;
    vendorName: string;
    issueDate: string;
    dueDate: string;
    status: VendorBillStatus;
    totalAmount: number;
    taxAmount: number;
    items: VendorBillItem[];
}

export interface CreateVendorBillDto {
    billNumber: string;
    vendorName: string;
    issueDate: string;
    dueDate: string;
    items: Omit<VendorBillItem, 'id' | 'account'>[];
    totalAmount: number;
    taxAmount: number;
}

export const vendorBillsService = {
    getAll: async () => {
        const response = await api.get<VendorBill[]>('/vendor-bills');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<VendorBill>(`/vendor-bills/${id}`);
        return response.data;
    },

    create: async (data: CreateVendorBillDto) => {
        const response = await api.post<VendorBill>('/vendor-bills', data);
        return response.data;
    },

    post: async (id: string) => {
        const response = await api.post<VendorBill>(`/vendor-bills/${id}/post`);
        return response.data;
    },

    recordPayment: async (id: string, paymentAccountId: string) => {
        const response = await api.post<VendorBill>(`/vendor-bills/${id}/pay`, { paymentAccountId });
        return response.data;
    },
};
