import { api } from './api';
import type { CreateInvoiceDto } from '@bookkeeping/shared';
import { InvoiceStatus, Currency } from '@bookkeeping/shared';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
    taxAmount: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    status: InvoiceStatus;
    customerName: string;
    customerId?: string;
    total: number;
    subtotal?: number;
    taxTotal?: number;
    currency: Currency;
    items?: InvoiceItem[];
    notes?: string;
}

export const invoicesService = {
    findAll: async (params?: { page?: number; limit?: number }): Promise<Invoice[] | { data: Invoice[]; meta: any }> => {
        const queryParams = params ? `?page=${params.page}&limit=${params.limit}` : '';
        const response = await api.get<Invoice[] | { data: Invoice[]; meta: any }>(`/invoices${queryParams}`);
        return response.data;
    },

    findOne: async (id: string): Promise<Invoice> => {
        const response = await api.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },

    create: async (data: CreateInvoiceDto): Promise<Invoice> => {
        const response = await api.post<Invoice>('/invoices', data);
        return response.data;
    },

    update: async (id: string, data: CreateInvoiceDto): Promise<Invoice> => {
        const response = await api.patch<Invoice>(`/invoices/${id}`, data);
        return response.data;
    },

    markAsPaid: async (id: string): Promise<Invoice> => {
        const response = await api.patch<Invoice>(`/invoices/${id}/mark-paid`);
        return response.data;
    },

    recordPayment: async (id: string, data: { amount: number; date: string; method: string; accountId: string; reference: string }): Promise<Invoice> => {
        const response = await api.post<Invoice>(`/invoices/${id}/pay`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/invoices/${id}`);
    },
};
