export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum ExpenseCategory {
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  UTILITIES = 'UTILITIES',
  RENT = 'RENT',
  SALARY = 'SALARY',
  OTHER = 'OTHER',
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  taxAmount: number;
  date: string;
  category?: string;
  vendor?: string;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  taxAmount?: number;
  date: string;
  category?: string;
  vendor?: string;
}
