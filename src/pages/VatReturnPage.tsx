import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports';
import { formatCurrency } from '../utils/format';
import { Calendar } from 'lucide-react';

export const VatReturnPage = () => {
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const quarter = Math.floor((today.getMonth() + 3) / 3);
        const start = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
        const end = new Date(today.getFullYear(), quarter * 3, 0);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['vat-return', dateRange],
        queryFn: () => reportsService.getVatReport(dateRange.startDate, dateRange.endDate),
    });

    const setQuarter = (q: number) => {
        const year = new Date().getFullYear();
        const start = new Date(year, (q - 1) * 3, 1);
        const end = new Date(year, q * 3, 0);
        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Loading VAT Return...</div>;
    }

    if (!report) return null;

    const VatBox = ({ number, title, amount, vat, isTotal = false }: { number: string, title: string, amount: number, vat: number, isTotal?: boolean }) => (
        <div className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-800 ${isTotal ? 'bg-gray-900/50 font-bold' : ''}`}>
            <div className="col-span-1 text-gray-500 font-mono">{number}</div>
            <div className="col-span-5 text-gray-300">{title}</div>
            <div className="col-span-3 text-right font-mono text-gray-400">{formatCurrency(amount)}</div>
            <div className="col-span-3 text-right font-mono text-white">{formatCurrency(vat)}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">VAT Return (VAT201)</h1>
                    <p className="text-gray-400 mt-1">UAE Federal Tax Authority Format</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(q => (
                            <button
                                key={q}
                                onClick={() => setQuarter(q)}
                                className="px-3 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                            >
                                Q{q}
                            </button>
                        ))}
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
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Net VAT Payable / (Refundable)</p>
                        <h2 className="text-3xl font-bold text-white">{formatCurrency(report.netVatPayable)}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${report.netVatPayable > 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                            {report.netVatPayable > 0 ? 'Payment Due' : 'Refund Due'}
                        </span>
                    </div>
                </div>
            </div>

            {/* VAT Return Form */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-950 border-b border-gray-800 text-sm font-medium text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1">Box</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-3 text-right">Amount (AED)</div>
                    <div className="col-span-3 text-right">VAT Amount (AED)</div>
                </div>

                {/* VAT on Sales */}
                <div className="bg-gray-800/30 px-4 py-2 text-xs font-bold text-gray-500 uppercase">VAT on Sales and All Other Outputs</div>
                <VatBox
                    number="1a"
                    title="Standard rated supplies"
                    amount={report.sales.standardRated.taxableAmount}
                    vat={report.sales.standardRated.vatAmount}
                />
                <VatBox
                    number="1b"
                    title="Supplies subject to VAT reverse charge provisions"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="1c"
                    title="Zero rated supplies"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="1d"
                    title="Exempt supplies"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="1e"
                    title="Goods imported into the UAE"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="1f"
                    title="Adjustments to goods imported into the UAE"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="1g"
                    title="Adjustments to goods imported into the UAE (Reverse Charge)"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="Total"
                    title="Total Output VAT"
                    amount={report.sales.total.taxableAmount}
                    vat={report.sales.total.vatAmount}
                    isTotal
                />

                {/* VAT on Expenses */}
                <div className="bg-gray-800/30 px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-4">VAT on Expenses and All Other Inputs</div>
                <VatBox
                    number="9"
                    title="Standard rated expenses"
                    amount={report.expenses.standardRated.taxableAmount}
                    vat={report.expenses.standardRated.vatAmount}
                />
                <VatBox
                    number="10"
                    title="Supplies subject to VAT reverse charge provisions"
                    amount={0}
                    vat={0}
                />
                <VatBox
                    number="Total"
                    title="Total Input VAT"
                    amount={report.expenses.total.taxableAmount}
                    vat={report.expenses.total.vatAmount}
                    isTotal
                />
            </div>
        </div>
    );
};
