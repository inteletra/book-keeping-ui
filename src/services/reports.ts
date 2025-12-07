import { api } from './api';

export interface ProfitLossReport {
    period: {
        startDate: string;
        endDate: string;
    };
    revenue: {
        accounts: Array<{
            accountCode: string;
            accountName: string;
            amount: number;
        }>;
        total: number;
    };
    expenses: {
        accounts: Array<{
            accountCode: string;
            accountName: string;
            amount: number;
        }>;
        total: number;
    };
    netProfit: number;
}

export interface DashboardStats {
    monthlyIncome: number;
    monthlyPendingIncome: number;
    monthlyExpenses: number;
    netProfit: number;
}

export interface CashFlowStatement {
    period: {
        startDate: string;
        endDate: string;
    };
    operating: {
        netIncome: number;
        adjustments: Array<{
            accountCode: string;
            accountName: string;
            amount: number;
        }>;
        total: number;
    };
    investing: {
        activities: Array<{
            accountCode: string;
            accountName: string;
            amount: number;
        }>;
        total: number;
    };
    financing: {
        activities: Array<{
            accountCode: string;
            accountName: string;
            amount: number;
        }>;
        total: number;
    };
    summary: {
        cashAtBeginning: number;
        cashAtEnd: number;
        netChange: number;
        discrepancy: number;
    };
}

export interface VatReport {
    period: {
        startDate: string;
        endDate: string;
    };
    sales: {
        standardRated: {
            taxableAmount: number;
            vatAmount: number;
            totalAmount: number;
        };
        total: {
            taxableAmount: number;
            vatAmount: number;
            totalAmount: number;
        };
    };
    expenses: {
        standardRated: {
            taxableAmount: number;
            vatAmount: number;
            totalAmount: number;
        };
        total: {
            taxableAmount: number;
            vatAmount: number;
            totalAmount: number;
        };
    };
    netVatPayable: number;
}

export const reportsService = {
    getProfitLoss: async (startDate?: string, endDate?: string): Promise<ProfitLossReport> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get<ProfitLossReport>(`/reports/profit-loss?${params.toString()}`);
        return response.data;
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/reports/dashboard-stats');
        return response.data;
    },

    getBalanceSheet: async (asOfDate?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (asOfDate) params.append('asOfDate', asOfDate);
        const response = await api.get(`/reports/balance-sheet?${params.toString()}`);
        return response.data;
    },

    getCashFlowStatement: async (startDate: string, endDate: string): Promise<CashFlowStatement> => {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        const response = await api.get<CashFlowStatement>(`/reports/cash-flow?${params.toString()}`);
        return response.data;
    },

    getVatReport: async (startDate: string, endDate: string): Promise<VatReport> => {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        const response = await api.get<VatReport>(`/reports/vat-return?${params.toString()}`);
        return response.data;
    },
};
