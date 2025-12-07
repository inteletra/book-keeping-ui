import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { vendorBillsService, VendorBillStatus } from '../services/vendor-bills';
import type { VendorBill } from '../services/vendor-bills';
import { accountsService } from '../services/accounts';
import { formatCurrency } from '../utils/format';
import { Plus, CheckCircle, DollarSign } from 'lucide-react';

export const VendorBillsPage = () => {
    const queryClient = useQueryClient();
    const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAccountId, setPaymentAccountId] = useState('');

    const { data: bills, isLoading } = useQuery({
        queryKey: ['vendor-bills'],
        queryFn: vendorBillsService.getAll,
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    // Filter for Bank/Cash accounts for payment
    const paymentAccounts = accounts?.filter(a => a.type === 'ASSET' && (a.subType === 'CASH' || a.subType === 'BANK')) || [];

    const postMutation = useMutation({
        mutationFn: vendorBillsService.post,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-bills'] });
        },
    });

    const payMutation = useMutation({
        mutationFn: ({ id, accountId }: { id: string, accountId: string }) =>
            vendorBillsService.recordPayment(id, accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-bills'] });
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
        },
    });

    const handlePost = (id: string) => {
        if (confirm('Are you sure you want to post this bill? This will update the General Ledger.')) {
            postMutation.mutate(id);
        }
    };

    const openPaymentModal = (bill: VendorBill) => {
        setSelectedBill(bill);
        setIsPaymentModalOpen(true);
    };

    const handlePay = () => {
        if (selectedBill && paymentAccountId) {
            payMutation.mutate({ id: selectedBill.id, accountId: paymentAccountId });
        }
    };

    const getStatusColor = (status: VendorBillStatus) => {
        switch (status) {
            case VendorBillStatus.DRAFT: return 'bg-gray-800 text-gray-300';
            case VendorBillStatus.OPEN: return 'bg-blue-900/30 text-blue-400';
            case VendorBillStatus.PAID: return 'bg-green-900/30 text-green-400';
            case VendorBillStatus.VOID: return 'bg-red-900/30 text-red-400';
            default: return 'bg-gray-800 text-gray-300';
        }
    };

    if (isLoading) return <div className="text-center py-8 text-gray-500">Loading bills...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Vendor Bills</h1>
                    <p className="text-gray-400">Manage bills and payments</p>
                </div>
                <Link
                    to="/vendor-bills/new"
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    New Bill
                </Link>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-950 text-gray-400 text-sm">
                            <th className="p-4 font-medium">Bill #</th>
                            <th className="p-4 font-medium">Vendor</th>
                            <th className="p-4 font-medium">Issue Date</th>
                            <th className="p-4 font-medium">Due Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Amount</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {bills?.map(bill => (
                            <tr key={bill.id} className="hover:bg-gray-800/50 transition-colors group">
                                <td className="p-4 font-mono text-white">{bill.billNumber}</td>
                                <td className="p-4 text-gray-300">{bill.vendorName}</td>
                                <td className="p-4 text-gray-400">{new Date(bill.issueDate).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-400">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bill.status)}`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-white font-bold">
                                    {formatCurrency(bill.totalAmount)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {bill.status === VendorBillStatus.DRAFT && (
                                            <button
                                                onClick={() => handlePost(bill.id)}
                                                className="p-1 text-blue-400 hover:text-blue-300"
                                                title="Post to Ledger"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {bill.status === VendorBillStatus.OPEN && (
                                            <button
                                                onClick={() => openPaymentModal(bill)}
                                                className="p-1 text-green-400 hover:text-green-300"
                                                title="Record Payment"
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {bills?.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No bills found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedBill && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Record Payment</h2>
                        <p className="text-gray-400 mb-4">
                            Paying Bill <span className="text-white font-mono">{selectedBill.billNumber}</span> for <span className="text-white">{formatCurrency(selectedBill.totalAmount)}</span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Pay from Account</label>
                            <select
                                value={paymentAccountId}
                                onChange={(e) => setPaymentAccountId(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="">Select Account</option>
                                {paymentAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={!paymentAccountId || payMutation.isPending}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {payMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
