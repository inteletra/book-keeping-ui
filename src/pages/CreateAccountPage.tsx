import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accounts';
import { AccountType, AccountSubType, type CreateAccountDto } from '@bookkeeping/shared';
import { ArrowLeft } from 'lucide-react';

const accountSubTypes: Record<AccountType, AccountSubType[]> = {
    [AccountType.ASSET]: [
        AccountSubType.CURRENT_ASSET,
        AccountSubType.FIXED_ASSET,
        AccountSubType.OTHER_ASSET,
    ],
    [AccountType.LIABILITY]: [
        AccountSubType.CURRENT_LIABILITY,
        AccountSubType.LONG_TERM_LIABILITY,
    ],
    [AccountType.EQUITY]: [
        AccountSubType.EQUITY,
        AccountSubType.RETAINED_EARNINGS,
    ],
    [AccountType.REVENUE]: [
        AccountSubType.OPERATING_REVENUE,
        AccountSubType.OTHER_REVENUE,
    ],
    [AccountType.EXPENSE]: [
        AccountSubType.COST_OF_GOODS_SOLD,
        AccountSubType.OPERATING_EXPENSE,
        AccountSubType.OTHER_EXPENSE,
    ],
};

export const CreateAccountPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<CreateAccountDto>({
        code: '',
        name: '',
        type: AccountType.ASSET,
        subType: AccountSubType.CURRENT_ASSET,
        description: '',
    });

    const { data: existingAccount } = useQuery({
        queryKey: ['account', id],
        queryFn: () => accountsService.getOne(id!),
        enabled: isEditMode,
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    useEffect(() => {
        if (existingAccount) {
            setFormData({
                code: existingAccount.code,
                name: existingAccount.name,
                type: existingAccount.type,
                subType: existingAccount.subType as AccountSubType,
                parentId: existingAccount.parentId,
                currency: existingAccount.currency,
                description: existingAccount.description,
            });
        }
    }, [existingAccount]);

    const createMutation = useMutation({
        mutationFn: isEditMode
            ? (data: CreateAccountDto) => accountsService.update(id!, data)
            : accountsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            navigate('/accounts');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleTypeChange = (type: AccountType) => {
        setFormData({
            ...formData,
            type,
            subType: accountSubTypes[type][0],
        });
    };

    const availableParents = accounts.filter(
        (acc) => acc.type === formData.type && (!isEditMode || acc.id !== id)
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/accounts')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditMode ? 'Edit Account' : 'New Account'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isEditMode ? 'Update account details' : 'Create a new account in your chart of accounts'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Account Code *
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="e.g., 1110"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Account Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="e.g., Cash"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Account Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            >
                                {Object.values(AccountType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Subtype *
                            </label>
                            <select
                                value={formData.subType}
                                onChange={(e) => setFormData({ ...formData, subType: e.target.value as AccountSubType })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            >
                                {accountSubTypes[formData.type].map((subType) => (
                                    <option key={subType} value={subType}>
                                        {subType.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Parent Account
                            </label>
                            <select
                                value={formData.parentId || ''}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">None (Top Level)</option>
                                {availableParents.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.code} - {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Currency
                            </label>
                            <input
                                type="text"
                                value={formData.currency || 'AED'}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="AED"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            rows={3}
                            placeholder="Optional description..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/accounts')}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {createMutation.isPending
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Account' : 'Create Account')}
                    </button>
                </div>
            </form>
        </div>
    );
};
