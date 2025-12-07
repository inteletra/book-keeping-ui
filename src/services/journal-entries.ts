import { api } from './api';

export interface JournalLine {
    id: string;
    accountCode: string;
    accountName: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    entryNumber: string;
    date: string;
    description?: string;
    reference?: string;
    status: 'DRAFT' | 'POSTED' | 'VOID';
    lines: JournalLine[];
    createdAt: string;
}

export interface CreateJournalLineDto {
    accountCode: string;
    accountName: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    description?: string;
}

export interface CreateJournalEntryDto {
    date: Date | string;
    description?: string;
    reference?: string;
    lines: CreateJournalLineDto[];
}

export const journalEntriesService = {
    getAll: async (): Promise<JournalEntry[]> => {
        const response = await api.get('/journal-entries');
        return response.data;
    },

    create: async (dto: CreateJournalEntryDto): Promise<JournalEntry> => {
        const response = await api.post('/journal-entries', dto);
        return response.data;
    },

    post: async (id: string): Promise<JournalEntry> => {
        const response = await api.patch(`/journal-entries/${id}/post`);
        return response.data;
    },

    void: async (id: string): Promise<JournalEntry> => {
        const response = await api.patch(`/journal-entries/${id}/void`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/journal-entries/${id}`);
    },
};
