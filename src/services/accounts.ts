import { api } from './api';
import { AccountType, type CreateAccountDto, type UpdateAccountDto } from '@bookkeeping/shared';

export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    subType: string;
    parentId?: string;
    parent?: Account;
    children?: Account[];
    currency: string;
    balance: number;
    isActive: boolean;
    isSystem: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export const accountsService = {
    getAll: async (): Promise<Account[]> => {
        const response = await api.get('/accounts');
        return response.data;
    },

    getHierarchy: async (): Promise<Account[]> => {
        const response = await api.get('/accounts/hierarchy');
        return response.data;
    },

    getByType: async (type: AccountType): Promise<Account[]> => {
        const response = await api.get(`/accounts/type/${type}`);
        return response.data;
    },

    getOne: async (id: string): Promise<Account> => {
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    },

    create: async (data: CreateAccountDto): Promise<Account> => {
        const response = await api.post('/accounts', data);
        return response.data;
    },

    update: async (id: string, data: UpdateAccountDto): Promise<Account> => {
        const response = await api.patch(`/accounts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`);
    },
};
