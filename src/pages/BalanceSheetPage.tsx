import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports';
import { formatCurrency } from '../utils/format';
import { Calendar, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const BalanceSheetPage = () => {
    const [asOfDate, setAsOfDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const { data: balanceSheet, isLoading } = useQuery({
        queryKey: ['balance-sheet', asOfDate],
        queryFn: () => reportsService.getBalanceSheet(asOfDate),
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-AE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) return <div className="text-white">Loading...</div>;

    if (!balanceSheet) return <div className="text-white">No data available</div>;

    const { assets, liabilities, equity, summary } = balanceSheet;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white">Balance Sheet</h1>
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

            {/* Balance Check Alert */}
            {!summary.isBalanced && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <XCircle className="text-red-400" size={24} />
                    <div>
                        <p className="text-red-400 font-medium">Balance Sheet is OUT OF BALANCE!</p>
                        <p className="text-red-300 text-sm">
                            Assets ({formatCurrency(summary.totalAssets)}) ≠
                            Liabilities + Equity ({formatCurrency(summary.totalLiabilitiesAndEquity)})
                        </p>
                    </div>
                </div>
            )}

            {summary.isBalanced && (
                <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={24} />
                    <p className="text-green-400 font-medium">Balance Sheet is BALANCED</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets Section */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="bg-gray-950 px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">Assets</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {assets.accounts.length === 0 ? (
                                <p className="text-gray-500 italic">No asset accounts found.</p>
                            ) : (
                                <table className="w-full">
                                    <tbody>
                                        {assets.accounts.map((account: any) => (
                                            <tr key={account.accountCode} className="border-b border-gray-800/50 last:border-0">
                                                <td className="py-2 text-gray-400 font-mono text-sm">{account.accountCode}</td>
                                                <td className="py-2 text-gray-300">{account.accountName}</td>
                                                <td className="py-2 text-right text-white font-mono">
                                                    {formatCurrency(account.debit - account.credit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Total Assets</span>
                                <span className="text-lg font-bold text-green-400 font-mono">
                                    {formatCurrency(assets.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liabilities & Equity Section */}
                <div className="space-y-6">
                    {/* Liabilities */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="bg-gray-950 px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">Liabilities</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {liabilities.accounts.length === 0 ? (
                                <p className="text-gray-500 italic">No liability accounts found.</p>
                            ) : (
                                <table className="w-full">
                                    <tbody>
                                        {liabilities.accounts.map((account: any) => (
                                            <tr key={account.accountCode} className="border-b border-gray-800/50 last:border-0">
                                                <td className="py-2 text-gray-400 font-mono text-sm">{account.accountCode}</td>
                                                <td className="py-2 text-gray-300">{account.accountName}</td>
                                                <td className="py-2 text-right text-white font-mono">
                                                    {formatCurrency(account.credit - account.debit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Total Liabilities</span>
                                <span className="text-lg font-bold text-white font-mono">
                                    {formatCurrency(liabilities.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Equity */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="bg-gray-950 px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">Equity</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {equity.accounts.length === 0 ? (
                                <p className="text-gray-500 italic">No equity accounts found.</p>
                            ) : (
                                <table className="w-full">
                                    <tbody>
                                        {equity.accounts.map((account: any) => (
                                            <tr key={account.accountCode} className="border-b border-gray-800/50 last:border-0">
                                                <td className="py-2 text-gray-400 font-mono text-sm">{account.accountCode}</td>
                                                <td className="py-2 text-gray-300">
                                                    {account.accountName}
                                                    {account.accountCode === 'RE-CURRENT' && (
                                                        <span className="ml-2 text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                                                            Calculated
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 text-right text-white font-mono">
                                                    {formatCurrency(account.credit - account.debit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Total Equity</span>
                                <span className="text-lg font-bold text-white font-mono">
                                    {formatCurrency(equity.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total Liabilities & Equity */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total Liabilities & Equity</span>
                        <span className="text-lg font-bold text-green-400 font-mono">
                            {formatCurrency(summary.totalLiabilitiesAndEquity)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
