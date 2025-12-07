import { api } from './api';

export interface InboxItem {
  id: string;
  originalName: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED' | 'CONVERTED';
  type: 'RECEIPT' | 'INVOICE' | 'OTHER';
  createdAt: string;
  size: number;
}

export const inboxService = {
  getAll: async (): Promise<InboxItem[]> => {
    const response = await api.get('/inbox');
    return response.data;
  },

  upload: async (file: File): Promise<InboxItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inbox/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inbox/${id}`);
  },
};
