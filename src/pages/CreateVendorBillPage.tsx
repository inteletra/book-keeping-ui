import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { vendorBillsService } from '../services/vendor-bills';
import type { CreateVendorBillDto } from '../services/vendor-bills';
import { accountsService } from '../services/accounts';
import { Plus, Trash2, Save } from 'lucide-react';

export const CreateVendorBillPage = () => {
    const navigate = useNavigate();
    const [billData, setBillData] = useState({
        billNumber: '',
        vendorName: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
    });

    const [items, setItems] = useState([
        { description: '', amount: 0, taxRate: 5, taxAmount: 0, accountId: '' }
    ]);

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    // Filter for Expense accounts
    const expenseAccounts = accounts?.filter(a => a.type === 'EXPENSE' || a.type === 'ASSET') || [];

    const createMutation = useMutation({
        mutationFn: vendorBillsService.create,
        onSuccess: () => {
            navigate('/vendor-bills');
        },
    });

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate tax if amount or rate changes
        if (field === 'amount' || field === 'taxRate') {
            const amount = Number(newItems[index].amount) || 0;
            const rate = Number(newItems[index].taxRate) || 0;
            newItems[index].taxAmount = Number((amount * rate / 100).toFixed(2));
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', amount: 0, taxRate: 5, taxAmount: 0, accountId: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateTotals = () => {
        const totalTax = items.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
        const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const total = subtotal + totalTax;
        return { subtotal, totalTax, total };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { totalTax, total } = calculateTotals();

        const dto: CreateVendorBillDto = {
            ...billData,
            items: items.map(item => ({
                description: item.description,
                amount: Number(item.amount),
                taxRate: Number(item.taxRate),
                taxAmount: Number(item.taxAmount),
                accountId: item.accountId,
            })),
            totalAmount: total,
            taxAmount: totalTax,
        };

        createMutation.mutate(dto);
    };

    const { subtotal, totalTax, total } = calculateTotals();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">New Vendor Bill</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bill Details */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Vendor Name</label>
                        <input
                            type="text"
                            required
                            value={billData.vendorName}
                            onChange={e => setBillData({ ...billData, vendorName: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Office Supplies Co."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Bill Number</label>
                        <input
                            type="text"
                            required
                            value={billData.billNumber}
                            onChange={e => setBillData({ ...billData, billNumber: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. INV-2024-001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Issue Date</label>
                        <input
                            type="date"
                            required
                            value={billData.issueDate}
                            onChange={e => setBillData({ ...billData, issueDate: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                        <input
                            type="date"
                            required
                            value={billData.dueDate}
                            onChange={e => setBillData({ ...billData, dueDate: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={item.description}
                                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
                                    <select
                                        required
                                        value={item.accountId}
                                        onChange={e => handleItemChange(index, 'accountId', e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">Select Account</option>
                                        {expenseAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={item.amount}
                                        onChange={e => handleItemChange(index, 'amount', e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 text-right"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">VAT %</label>
                                    <select
                                        value={item.taxRate}
                                        onChange={e => handleItemChange(index, 'taxRate', e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                    </select>
                                </div>
                                <div className="col-span-1 flex justify-end pb-2">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-4 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                    >
                        <Plus size={16} />
                        Add Item
                    </button>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-80 space-y-3">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>VAT</span>
                            <span>{totalTax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-800 pt-3 flex justify-between text-xl font-bold text-white">
                            <span>Total</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/vendor-bills')}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {createMutation.isPending ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
};
