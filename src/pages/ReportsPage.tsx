import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export const ReportsPage = () => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['profit-loss', dateRange],
        queryFn: () => reportsService.getProfitLoss(dateRange.startDate, dateRange.endDate),
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Loading report...</div>;
    }

    if (!report) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Profit & Loss</h1>
                    <p className="text-gray-400 mt-1">Financial performance overview</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="bg-transparent text-white text-sm focus:outline-none"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="bg-transparent text-white text-sm focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(report.revenue.total)}</h3>
                </div>

                {/* Expenses Card */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(report.expenses.total)}</h3>
                </div>

                {/* Net Profit Card */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${report.netProfit >= 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            <DollarSign size={24} />
                        </div>
                        <span className={`text-sm font-medium ${report.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {report.revenue.total > 0 ? ((report.netProfit / report.revenue.total) * 100).toFixed(1) : 0}% Margin
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Net Profit</p>
                    <h3 className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {formatCurrency(report.netProfit)}
                    </h3>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Section */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-gray-950 px-6 py-4 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white">Revenue</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {report.revenue.accounts.length === 0 ? (
                            <p className="text-gray-500 italic">No revenue activity.</p>
                        ) : (
                            <table className="w-full">
                                <tbody>
                                    {report.revenue.accounts.map((account) => (
                                        <tr key={account.accountCode} className="border-b border-gray-800/50 last:border-0">
                                            <td className="py-2 text-gray-400 font-mono text-sm">{account.accountCode}</td>
                                            <td className="py-2 text-gray-300">{account.accountName}</td>
                                            <td className="py-2 text-right text-white font-mono">
                                                {formatCurrency(account.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total Revenue</span>
                            <span className="text-lg font-bold text-green-400 font-mono">
                                {formatCurrency(report.revenue.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-gray-950 px-6 py-4 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white">Expenses</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {report.expenses.accounts.length === 0 ? (
                            <p className="text-gray-500 italic">No expense activity.</p>
                        ) : (
                            <table className="w-full">
                                <tbody>
                                    {report.expenses.accounts.map((account) => (
                                        <tr key={account.accountCode} className="border-b border-gray-800/50 last:border-0">
                                            <td className="py-2 text-gray-400 font-mono text-sm">{account.accountCode}</td>
                                            <td className="py-2 text-gray-300">{account.accountName}</td>
                                            <td className="py-2 text-right text-white font-mono">
                                                {formatCurrency(account.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total Expenses</span>
                            <span className="text-lg font-bold text-red-400 font-mono">
                                {formatCurrency(report.expenses.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
