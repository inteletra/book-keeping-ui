import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Trash2, ArrowLeft } from 'lucide-react';
import { journalEntriesService } from '../services/journal-entries';
import type { CreateJournalLineDto } from '../services/journal-entries';

export const CreateJournalEntryPage = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');
    const [lines, setLines] = useState<CreateJournalLineDto[]>([
        { accountCode: '', accountName: '', type: 'DEBIT', amount: 0 },
        { accountCode: '', accountName: '', type: 'CREDIT', amount: 0 },
    ]);
    const [error, setError] = useState('');

    const createMutation = useMutation({
        mutationFn: journalEntriesService.create,
        onSuccess: () => {
            navigate('/journal-entries');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create journal entry');
        },
    });

    const addLine = (type: 'DEBIT' | 'CREDIT') => {
        setLines([...lines, { accountCode: '', accountName: '', type, amount: 0 }]);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    const updateLine = (index: number, field: keyof CreateJournalLineDto, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate debits = credits
        const totalDebit = lines
            .filter(l => l.type === 'DEBIT')
            .reduce((sum, l) => sum + Number(l.amount), 0);
        const totalCredit = lines
            .filter(l => l.type === 'CREDIT')
            .reduce((sum, l) => sum + Number(l.amount), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            setError('Debits must equal credits');
            return;
        }

        createMutation.mutate({
            date,
            description: description || undefined,
            reference: reference || undefined,
            lines,
        });
    };

    const totalDebit = lines
        .filter(l => l.type === 'DEBIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
    const totalCredit = lines
        .filter(l => l.type === 'CREDIT')
        .reduce((sum, l) => sum + Number(l.amount), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/journal-entries')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">New Journal Entry</h1>
                    <p className="text-gray-400 mt-1">Create a manual journal entry</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g., ADJ-001"
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Entry description"
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="font-medium text-white">Journal Lines</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => addLine('DEBIT')}
                                className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                + Debit
                            </button>
                            <button
                                type="button"
                                onClick={() => addLine('CREDIT')}
                                className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                + Credit
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase w-32">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase w-32">Account Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Account Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase w-40">Amount</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {lines.map((line, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${line.type === 'DEBIT'
                                                ? 'bg-blue-600/20 text-blue-400'
                                                : 'bg-purple-600/20 text-purple-400'
                                                }`}>
                                                {line.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={line.accountCode}
                                                onChange={(e) => updateLine(index, 'accountCode', e.target.value)}
                                                placeholder="1000"
                                                className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-white text-sm"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={line.accountName}
                                                onChange={(e) => updateLine(index, 'accountName', e.target.value)}
                                                placeholder="Account Name"
                                                className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-white text-sm"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={line.amount}
                                                onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-white text-sm"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {lines.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(index)}
                                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-950 border-t border-gray-800">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right font-medium text-white">
                                        Totals:
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-400">Debit:</span>
                                                <span className="text-white font-mono">${totalDebit.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-purple-400">Credit:</span>
                                                <span className="text-white font-mono">${totalCredit.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-800">
                                                <span className={isBalanced ? 'text-green-400' : 'text-red-400'}>
                                                    {isBalanced ? 'Balanced ✓' : 'Out of Balance'}
                                                </span>
                                                <span className={isBalanced ? 'text-green-400' : 'text-red-400'}>
                                                    ${Math.abs(totalDebit - totalCredit).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/journal-entries')}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isBalanced || createMutation.isPending}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};
