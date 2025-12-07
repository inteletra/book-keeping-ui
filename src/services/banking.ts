import { api } from './api';

export interface BankTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    reference?: string;
    status: 'PENDING' | 'MATCHED';
    accountId: string;
    matchedLedgerEntryId?: string;
}

export interface LedgerEntry {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    accountCode: string;
    accountName: string;
}

export interface ReconciliationData {
    bankTransactions: BankTransaction[];
    ledgerEntries: LedgerEntry[];
    systemBalance: number;
}

export const bankingService = {
    uploadStatement: async (accountId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountId', accountId);

        const response = await api.post<BankTransaction[]>('/banking/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getReconciliationData: async (accountId: string) => {
        const response = await api.get<ReconciliationData>(`/banking/reconcile/${accountId}`);
        return response.data;
    },

    matchTransaction: async (bankTxId: string, ledgerEntryId: string) => {
        const response = await api.post<BankTransaction>('/banking/match', {
            bankTxId,
            ledgerEntryId,
        });
        return response.data;
    },

    unmatchTransaction: async (bankTxId: string) => {
        const response = await api.post<BankTransaction>('/banking/unmatch', {
            bankTxId,
        });
        return response.data;
    },
};
