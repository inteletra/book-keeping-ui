import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ledgerService, type TrialBalanceEntry } from '../services/ledger';
import { formatCurrency } from '../utils/format';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

export const TrialBalancePage = () => {
    const [asOfDate, setAsOfDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const { data: trialBalance = [], isLoading } = useQuery({
        queryKey: ['trial-balance', asOfDate],
        queryFn: () => ledgerService.getTrialBalance(asOfDate),
    });

    // Calculate totals
    const totalDebits = trialBalance.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredits = trialBalance.reduce((sum, entry) => sum + entry.credit, 0);
    const difference = Math.abs(totalDebits - totalCredits);
    const isBalanced = difference < 0.01;

    // Group by account type
    const groupedByType = trialBalance.reduce((acc, entry) => {
        if (!acc[entry.accountType]) {
            acc[entry.accountType] = [];
        }
        acc[entry.accountType].push(entry);
        return acc;
    }, {} as Record<string, TrialBalanceEntry[]>);

    const accountTypeOrder = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-AE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white">Trial Balance</h1>
                    <p className="text-gray-400 mt-1">As of {formatDate(asOfDate)}</p>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-400">As of Date</label>
                    </div>
                    <input
                        type="date"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Balance Status Alert */}
            {!isBalanced && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <XCircle className="text-red-400" size={24} />
                    <div>
                        <p className="text-red-400 font-medium">Trial Balance is OUT OF BALANCE!</p>
                        <p className="text-red-300 text-sm">Difference: {formatCurrency(difference)}</p>
                    </div>
                </div>
            )}

            {isBalanced && trialBalance.length > 0 && (
                <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={24} />
                    <p className="text-green-400 font-medium">Trial Balance is BALANCED</p>
                </div>
            )}

            {/* Trial Balance Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {trialBalance.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No account activity found for the selected date.</p>
                        <p className="text-sm mt-2">Create some transactions to see the trial balance.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Account Name</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Debit</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {accountTypeOrder.map(type => {
                                    const entries = groupedByType[type];
                                    if (!entries || entries.length === 0) return null;

                                    const typeDebitTotal = entries.reduce((sum, e) => sum + e.debit, 0);
                                    const typeCreditTotal = entries.reduce((sum, e) => sum + e.credit, 0);

                                    return (
                                        <React.Fragment key={type}>
                                            <tr className="bg-gray-800/50">
                                                <td colSpan={4} className="px-4 py-2 text-sm font-bold text-purple-400 uppercase">
                                                    {type}
                                                </td>
                                            </tr>
                                            {entries.map((entry) => (
                                                <tr key={entry.accountCode} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-4 py-3 text-gray-300 font-mono text-sm">{entry.accountCode}</td>
                                                    <td className="px-4 py-3 text-white text-sm">{entry.accountName}</td>
                                                    <td className="px-4 py-3 text-right text-green-400 font-mono">
                                                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-red-400 font-mono">
                                                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-800/30">
                                                <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-400 text-right">
                                                    {type} Subtotal
                                                </td>
                                                <td className="px-4 py-2 text-right text-green-400 font-mono font-medium">
                                                    {typeDebitTotal > 0 ? formatCurrency(typeDebitTotal) : '-'}
                                                </td>
                                                <td className="px-4 py-2 text-right text-red-400 font-mono font-medium">
                                                    {typeCreditTotal > 0 ? formatCurrency(typeCreditTotal) : '-'}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-950 border-t-2 border-purple-600">
                                <tr>
                                    <td colSpan={2} className="px-4 py-4 text-lg font-bold text-white">
                                        TOTAL
                                    </td>
                                    <td className="px-4 py-4 text-right text-green-400 font-mono font-bold text-lg">
                                        {formatCurrency(totalDebits)}
                                    </td>
                                    <td className="px-4 py-4 text-right text-red-400 font-mono font-bold text-lg">
                                        {formatCurrency(totalCredits)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {trialBalance.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <p className="text-gray-400 text-sm mb-2">Total Debits</p>
                        <p className="text-3xl font-bold text-green-400">{formatCurrency(totalDebits)}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <p className="text-gray-400 text-sm mb-2">Total Credits</p>
                        <p className="text-3xl font-bold text-red-400">{formatCurrency(totalCredits)}</p>
                    </div>
                    <div className={clsx(
                        "bg-gray-900 rounded-xl border p-6",
                        isBalanced ? "border-green-800" : "border-red-800"
                    )}>
                        <p className="text-gray-400 text-sm mb-2">Difference</p>
                        <p className={clsx(
                            "text-3xl font-bold",
                            isBalanced ? "text-green-400" : "text-red-400"
                        )}>
                            {formatCurrency(difference)}
                        </p>
                        <p className={clsx(
                            "text-xs mt-2",
                            isBalanced ? "text-green-400" : "text-red-400"
                        )}>
                            {isBalanced ? '✓ Balanced' : '✗ Out of Balance'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
