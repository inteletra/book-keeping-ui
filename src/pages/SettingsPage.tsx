import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesService, type UpdateCompanyDto } from '../services/companies';
import { accountsService } from '../services/accounts';
import { AccountType } from '@bookkeeping/shared';
import { Save, Building2, CreditCard } from 'lucide-react';

export const SettingsPage = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateCompanyDto>({});
    const [companyId, setCompanyId] = useState<string | null>(null);

    // Fetch Company
    const { data: companies } = useQuery({
        queryKey: ['my-company'],
        queryFn: companiesService.findAll,
    });

    // Fetch Accounts
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.findAll,
    });

    useEffect(() => {
        if (companies && companies.length > 0) {
            const company = companies[0];
            setCompanyId(company.id);
            setFormData({
                name: company.name,
                email: company.email,
                phone: company.phone,
                website: company.website,
                trn: company.trn,
                address: company.address,
                defaultExpenseAccountId: company.defaultExpenseAccountId,
                defaultIncomeAccountId: company.defaultIncomeAccountId,
            });
        }
    }, [companies]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateCompanyDto) => companiesService.update(companyId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-company'] });
            alert('Settings updated successfully!');
        },
        onError: (error: any) => {
            alert(`Failed to update settings: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (companyId) {
            updateMutation.mutate(formData);
        }
    };

    const expenseAccounts = accounts.filter(a => a.type === AccountType.EXPENSE);
    const incomeAccounts = accounts.filter(a => a.type === AccountType.INCOME);

    if (!companies) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your company profile and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Profile */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Building2 size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Company Profile</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">TRN (Tax Registration Number)</label>
                            <input
                                type="text"
                                value={formData.trn || ''}
                                onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                            <input
                                type="text"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                            <textarea
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Default Accounts */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Default Accounts</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Default Expense Account</label>
                            <select
                                value={formData.defaultExpenseAccountId || ''}
                                onChange={(e) => setFormData({ ...formData, defaultExpenseAccountId: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">Select Account</option>
                                {expenseAccounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.code} - {account.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Used for uncategorized expenses.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Default Income Account</label>
                            <select
                                value={formData.defaultIncomeAccountId || ''}
                                onChange={(e) => setFormData({ ...formData, defaultIncomeAccountId: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">Select Account</option>
                                {incomeAccounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.code} - {account.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Used for uncategorized income.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
