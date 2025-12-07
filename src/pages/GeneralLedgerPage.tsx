import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ledgerService, type LedgerFilters } from '../services/ledger';
import { accountsService } from '../services/accounts';
import { formatCurrency } from '../utils/format';
import { Filter } from 'lucide-react';
import clsx from 'clsx';

export const GeneralLedgerPage = () => {
    const [filters, setFilters] = useState<LedgerFilters>({
        accountId: '',
        dateFrom: '',
        dateTo: '',
        sourceType: '',
    });

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['ledger-entries', filters],
        queryFn: () => ledgerService.getEntries(filters),
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    // Calculate running balance
    let runningBalance = 0;
    const entriesWithBalance = entries.map(entry => {
        runningBalance += entry.debit - entry.credit;
        return { ...entry, runningBalance };
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-AE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getSourceTypeBadge = (sourceType: string) => {
        const colors = {
            INVOICE: 'bg-blue-900/30 text-blue-400',
            EXPENSE: 'bg-orange-900/30 text-orange-400',
            JOURNAL_ENTRY: 'bg-purple-900/30 text-purple-400',
            MANUAL: 'bg-gray-900/30 text-gray-400',
        };
        return colors[sourceType as keyof typeof colors] || colors.MANUAL;
    };

    if (isLoading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">General Ledger</h1>
                <p className="text-gray-400 mt-1">Complete transaction history across all accounts</p>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} className="text-gray-400" />
                    <h2 className="text-white font-medium">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Account</label>
                        <select
                            value={filters.accountId}
                            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Accounts</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.code} - {acc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">From Date</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">To Date</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Source Type</label>
                        <select
                            value={filters.sourceType}
                            onChange={(e) => setFilters({ ...filters, sourceType: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Types</option>
                            <option value="INVOICE">Invoice</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="JOURNAL_ENTRY">Journal Entry</option>
                            <option value="MANUAL">Manual</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {entriesWithBalance.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No ledger entries found.</p>
                        <p className="text-sm mt-2">Entries will appear here when invoices are paid, expenses are created, or journal entries are posted.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Account</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Source</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Debit</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Credit</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {entriesWithBalance.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-300 text-sm">{formatDate(entry.date)}</td>
                                        <td className="px-4 py-3 text-white font-mono text-sm">
                                            {entry.account.code} - {entry.account.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-sm">{entry.description}</td>
                                        <td className="px-4 py-3 text-gray-400 text-sm font-mono">{entry.reference || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                getSourceTypeBadge(entry.sourceType)
                                            )}>
                                                {entry.sourceType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-mono">
                                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-mono">
                                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                        </td>
                                        <td className={clsx(
                                            "px-4 py-3 text-right font-mono font-medium",
                                            entry.runningBalance >= 0 ? "text-green-400" : "text-red-400"
                                        )}>
                                            {formatCurrency(Math.abs(entry.runningBalance))}
                                            {entry.runningBalance < 0 ? ' CR' : ' DR'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {entriesWithBalance.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-white font-medium mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Total Debits</p>
                            <p className="text-2xl font-bold text-green-400">
                                {formatCurrency(entries.reduce((sum, e) => sum + e.debit, 0))}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Credits</p>
                            <p className="text-2xl font-bold text-red-400">
                                {formatCurrency(entries.reduce((sum, e) => sum + e.credit, 0))}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Net Balance</p>
                            <p className={clsx(
                                "text-2xl font-bold",
                                runningBalance >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                                {formatCurrency(Math.abs(runningBalance))}
                                {runningBalance < 0 ? ' CR' : ' DR'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
