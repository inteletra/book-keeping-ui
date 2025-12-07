import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports';
import { formatCurrency } from '../utils/format';
import { Calendar } from 'lucide-react';

export const CashFlowPage = () => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['cash-flow', dateRange],
        queryFn: () => reportsService.getCashFlowStatement(dateRange.startDate, dateRange.endDate),
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Loading Cash Flow Statement...</div>;
    }

    if (!report) return null;

    const SectionHeader = ({ title, total, color = 'text-white' }: { title: string, total: number, color?: string }) => (
        <div className="flex justify-between items-center bg-gray-950 px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <span className={`text-lg font-bold font-mono ${color}`}>{formatCurrency(total)}</span>
        </div>
    );

    const ActivityRow = ({ name, amount }: { name: string, amount: number }) => (
        <div className="flex justify-between items-center py-3 border-b border-gray-800/50 last:border-0">
            <span className="text-gray-300">{name}</span>
            <span className={`font-mono ${amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(amount)}
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cash Flow Statement</h1>
                    <p className="text-gray-400 mt-1">Cash inflows and outflows by activity</p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Beginning Cash</p>
                    <h3 className="text-xl font-bold text-white">{formatCurrency(report.summary.cashAtBeginning)}</h3>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Net Change</p>
                    <h3 className={`text-xl font-bold ${report.summary.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(report.summary.netChange)}
                    </h3>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Ending Cash</p>
                    <h3 className="text-xl font-bold text-white">{formatCurrency(report.summary.cashAtEnd)}</h3>
                </div>
                {Math.abs(report.summary.discrepancy) > 0.01 && (
                    <div className="bg-red-900/20 border border-red-800 p-4 rounded-xl">
                        <p className="text-red-400 text-xs mb-1">Discrepancy</p>
                        <h3 className="text-xl font-bold text-red-400">{formatCurrency(report.summary.discrepancy)}</h3>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Operating Activities */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <SectionHeader title="Operating Activities" total={report.operating.total} />
                    <div className="p-6">
                        <ActivityRow name="Net Income" amount={report.operating.netIncome} />
                        <div className="my-4 border-t border-gray-800"></div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Adjustments to reconcile Net Income to Cash:</h4>
                        {report.operating.adjustments.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No adjustments.</p>
                        ) : (
                            report.operating.adjustments.map((item, idx) => (
                                <ActivityRow key={idx} name={item.accountName} amount={item.amount} />
                            ))
                        )}
                    </div>
                </div>

                {/* Investing Activities */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <SectionHeader title="Investing Activities" total={report.investing.total} />
                    <div className="p-6">
                        {report.investing.activities.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No investing activities.</p>
                        ) : (
                            report.investing.activities.map((item, idx) => (
                                <ActivityRow key={idx} name={item.accountName} amount={item.amount} />
                            ))
                        )}
                    </div>
                </div>

                {/* Financing Activities */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <SectionHeader title="Financing Activities" total={report.financing.total} />
                    <div className="p-6">
                        {report.financing.activities.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No financing activities.</p>
                        ) : (
                            report.financing.activities.map((item, idx) => (
                                <ActivityRow key={idx} name={item.accountName} amount={item.amount} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
