import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { accountsService } from '../services/accounts';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AccountType } from '@bookkeeping/shared';
import clsx from 'clsx';

export const AccountsPage = () => {
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: accountsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete account "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const getTypeColor = (type: AccountType) => {
        const colors = {
            [AccountType.ASSET]: 'text-green-400 bg-green-900/30',
            [AccountType.LIABILITY]: 'text-red-400 bg-red-900/30',
            [AccountType.EQUITY]: 'text-blue-400 bg-blue-900/30',
            [AccountType.REVENUE]: 'text-purple-400 bg-purple-900/30',
            [AccountType.EXPENSE]: 'text-orange-400 bg-orange-900/30',
        };
        return colors[type] || 'text-gray-400 bg-gray-900/30';
    };

    if (isLoading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Chart of Accounts</h1>
                    <p className="text-gray-400 mt-1">Manage your accounting structure</p>
                </div>
                <Link
                    to="/accounts/new"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    New Account
                </Link>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {accounts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No accounts found.</p>
                        <Link to="/accounts/new" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
                            Create your first account
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Subtype</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Balance</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-white font-mono text-sm">{account.code}</td>
                                        <td className="px-4 py-3 text-gray-300">{account.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                getTypeColor(account.type)
                                            )}>
                                                {account.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">{account.subType.replace(/_/g, ' ')}</td>
                                        <td className="px-4 py-3 text-right text-white font-mono">
                                            {account.currency} {Number(account.balance).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                account.isActive ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-400"
                                            )}>
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/accounts/${account.id}/edit`}
                                                    className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors"
                                                    title="Edit account"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                {!account.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(account.id, account.name)}
                                                        className="p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
                                                        title="Delete account"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
