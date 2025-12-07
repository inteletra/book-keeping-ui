import { api } from './api';
import { LedgerSourceType } from '@bookkeeping/shared';

export interface LedgerEntry {
    id: string;
    account: {
        id: string;
        code: string;
        name: string;
    };
    debit: number;
    credit: number;
    date: string;
    description: string;
    reference?: string;
    sourceType: LedgerSourceType;
    sourceId?: string;
    postedBy: {
        id: string;
        fullName: string;
    };
    createdAt: string;
}

export interface LedgerFilters {
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
    sourceType?: string;
}

export const ledgerService = {
    getEntries: async (filters: LedgerFilters): Promise<LedgerEntry[]> => {
        const params = new URLSearchParams();
        if (filters.accountId) params.append('accountId', filters.accountId);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.sourceType) params.append('sourceType', filters.sourceType);

        const response = await api.get(`/ledger?${params.toString()}`);
        return response.data;
    },

    getAccountLedger: async (accountId: string): Promise<LedgerEntry[]> => {
        const response = await api.get(`/ledger/account/${accountId}`);
        return response.data;
    },

    getTrialBalance: async (asOfDate?: string): Promise<TrialBalanceEntry[]> => {
        const params = new URLSearchParams();
        if (asOfDate) params.append('asOfDate', asOfDate);

        const response = await api.get(`/ledger/trial-balance?${params.toString()}`);
        return response.data;
    },
};

export interface TrialBalanceEntry {
    accountCode: string;
    accountName: string;
    accountType: string;
    debit: number;
    credit: number;
}
