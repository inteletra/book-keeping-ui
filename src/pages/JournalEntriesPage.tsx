import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { journalEntriesService } from '../services/journal-entries';
import type { JournalEntry } from '../services/journal-entries';
import { formatCurrency } from '../utils/format';

export const JournalEntriesPage = () => {
    const queryClient = useQueryClient();

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['journal-entries'],
        queryFn: journalEntriesService.getAll,
    });

    const postMutation = useMutation({
        mutationFn: journalEntriesService.post,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        },
    });

    const voidMutation = useMutation({
        mutationFn: journalEntriesService.void,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: journalEntriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        },
    });

    const getStatusBadge = (status: JournalEntry['status']) => {
        const styles = {
            DRAFT: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
            POSTED: 'bg-green-400/10 text-green-400 border-green-400/20',
            VOID: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (isLoading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Journal Entries</h1>
                    <p className="text-gray-400 mt-1">Manual double-entry bookkeeping</p>
                </div>
                <Link
                    to="/journal-entries/new"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    <span>New Entry</span>
                </Link>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {entries.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No journal entries yet.</p>
                        <Link to="/journal-entries/new" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
                            Create your first entry
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Entry #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lines</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {entries.map((entry) => {
                                    const totalDebit = entry.lines
                                        .filter(l => l.type === 'DEBIT')
                                        .reduce((sum, l) => sum + Number(l.amount), 0);

                                    return (
                                        <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 text-white font-mono text-sm">{entry.entryNumber}</td>
                                            <td className="px-4 py-3 text-gray-300 text-sm">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300 text-sm">
                                                {entry.description || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-sm">
                                                {entry.lines.length} lines • {formatCurrency(totalDebit)}
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {entry.status === 'DRAFT' && (
                                                        <>
                                                            <button
                                                                onClick={() => postMutation.mutate(entry.id)}
                                                                className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                                                title="Post Entry"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteMutation.mutate(entry.id)}
                                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {entry.status === 'POSTED' && (
                                                        <button
                                                            onClick={() => voidMutation.mutate(entry.id)}
                                                            className="p-2 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors"
                                                            title="Void Entry"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
