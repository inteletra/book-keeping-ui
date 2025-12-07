import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingService } from '../services/banking';
import { accountsService } from '../services/accounts';
import { formatCurrency } from '../utils/format';
import { Upload, ArrowRightLeft } from 'lucide-react';
import type { Account } from '../services/accounts';

export const BankReconciliationPage = () => {
    const queryClient = useQueryClient();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedBankTx, setSelectedBankTx] = useState<string | null>(null);
    const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<string | null>(null);

    // Fetch Accounts
    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    // Filter for Bank Accounts (assuming code starts with 10 or 11 or user knows)
    // Ideally we filter by subtype, but for now list all assets
    const bankAccounts = useMemo(() => {
        if (!accounts) return [];
        return (accounts as Account[]).filter(a => a.type === 'ASSET');
    }, [accounts]);

    // Fetch Reconciliation Data
    const { data: reconData } = useQuery({
        queryKey: ['reconciliation', selectedAccountId],
        queryFn: () => bankingService.getReconciliationData(selectedAccountId),
        enabled: !!selectedAccountId,
    });

    // Mutations
    const uploadMutation = useMutation({
        mutationFn: (file: File) => bankingService.uploadStatement(selectedAccountId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliation', selectedAccountId] });
        },
    });

    const matchMutation = useMutation({
        mutationFn: ({ bankTxId, ledgerEntryId }: { bankTxId: string, ledgerEntryId: string }) =>
            bankingService.matchTransaction(bankTxId, ledgerEntryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliation', selectedAccountId] });
            setSelectedBankTx(null);
            setSelectedLedgerEntry(null);
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    const handleMatch = () => {
        if (selectedBankTx && selectedLedgerEntry) {
            matchMutation.mutate({ bankTxId: selectedBankTx, ledgerEntryId: selectedLedgerEntry });
        }
    };

    if (!accounts) return <div>Loading accounts...</div>;

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bank Reconciliation</h1>
                    <p className="text-gray-400">Match bank statement lines with system records</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Select Bank Account</option>
                        {bankAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                    </select>

                    {selectedAccountId && (
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                            >
                                <Upload size={18} />
                                {uploadMutation.isPending ? 'Uploading...' : 'Import Statement'}
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {selectedAccountId && reconData && (
                <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* Bank Transactions (Left) */}
                    <div className="col-span-5 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-950">
                            <h3 className="font-bold text-white">Bank Statement Lines</h3>
                            <p className="text-xs text-gray-500">{reconData.bankTransactions.length} unmatched items</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {reconData.bankTransactions.map(tx => (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedBankTx(tx.id === selectedBankTx ? null : tx.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedBankTx === tx.id
                                        ? 'bg-purple-900/30 border-purple-500'
                                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm text-gray-300">{tx.date.split('T')[0]}</span>
                                        <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                            {formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{tx.description}</p>
                                </div>
                            ))}
                            {reconData.bankTransactions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No unmatched transactions</div>
                            )}
                        </div>
                    </div>

                    {/* Actions (Center) */}
                    <div className="col-span-2 flex flex-col items-center justify-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">System Balance</p>
                            <p className="font-mono font-bold text-white">{formatCurrency(reconData.systemBalance)}</p>
                        </div>

                        <button
                            onClick={handleMatch}
                            disabled={!selectedBankTx || !selectedLedgerEntry || matchMutation.isPending}
                            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white flex items-center justify-center transition-all shadow-lg shadow-purple-900/20"
                        >
                            <ArrowRightLeft size={20} />
                        </button>

                        {/* Match Info */}
                        {selectedBankTx && selectedLedgerEntry && (
                            <div className="text-xs text-center text-gray-400">
                                Click to match
                            </div>
                        )}
                    </div>

                    {/* Ledger Entries (Right) */}
                    <div className="col-span-5 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-950">
                            <h3 className="font-bold text-white">System Ledger Entries</h3>
                            <p className="text-xs text-gray-500">{reconData.ledgerEntries.length} unmatched items</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {reconData.ledgerEntries.map(entry => {
                                // Calculate net amount for display (Debit - Credit)
                                // If Asset account: Debit is +, Credit is -
                                // Wait, LedgerEntry has debit and credit columns.
                                // We should display the signed amount or just debit/credit.
                                const amount = Number(entry.debit) - Number(entry.credit);

                                return (
                                    <div
                                        key={entry.id}
                                        onClick={() => setSelectedLedgerEntry(entry.id === selectedLedgerEntry ? null : entry.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedLedgerEntry === entry.id
                                            ? 'bg-purple-900/30 border-purple-500'
                                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm text-gray-300">{entry.date.split('T')[0]}</span>
                                            <span className={`font-mono font-bold ${amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                                {formatCurrency(amount)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{entry.description}</p>
                                    </div>
                                );
                            })}
                            {reconData.ledgerEntries.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No unmatched entries</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!selectedAccountId && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a bank account to start reconciliation
                </div>
            )}
        </div>
    );
};
