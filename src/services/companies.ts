import { api } from './api';

export interface Company {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    trn?: string;
    address?: string;
    currency: string;
    createdAt: string;
    defaultExpenseAccountId?: string;
    defaultIncomeAccountId?: string;
}

export interface UpdateCompanyDto {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    trn?: string;
    address?: string;
    defaultExpenseAccountId?: string;
    defaultIncomeAccountId?: string;
}

export const companiesService = {
    findAll: async (): Promise<Company[]> => {
        const response = await api.get<Company[]>('/companies');
        return response.data;
    },

    findOne: async (id: string): Promise<Company> => {
        const response = await api.get<Company>(`/companies/${id}`);
        return response.data;
    },

    update: async (id: string, data: UpdateCompanyDto): Promise<Company> => {
        const response = await api.patch<Company>(`/companies/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/companies/${id}`);
    },
};
