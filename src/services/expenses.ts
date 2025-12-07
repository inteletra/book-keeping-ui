import { api } from './api';
import { ExpenseStatus } from '../shared/expenses';
import type { Expense, CreateExpenseDto } from '../shared/expenses';

export const expensesService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<Expense[] | { data: Expense[]; meta: any }> => {
    const queryParams = params ? `?page=${params.page}&limit=${params.limit}` : '';
    const response = await api.get(`/expenses${queryParams}`);
    return response.data;
  },

  getOne: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseDto): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateExpenseDto>): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: ExpenseStatus): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
