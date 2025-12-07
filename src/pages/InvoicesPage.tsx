
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { invoicesService } from '../services/invoices';
import { accountsService } from '../services/accounts';
import { Plus, FileText, Edit, Trash, DollarSign } from 'lucide-react';
import { InvoiceStatus } from '@bookkeeping/shared';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';

export const InvoicesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        accountId: '',
        reference: '',
    });

    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: invoicesService.findAll,
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll,
    });

    // Filter for Asset accounts (Cash, Bank, etc.)
    const assetAccounts = accounts?.filter(a => a.type === 'ASSET') || [];

    const deleteMutation = useMutation({
        mutationFn: invoicesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const payMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) =>
            invoicesService.recordPayment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setIsPaymentModalOpen(false);
            setSelectedInvoice(null);
            setPaymentData({
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                method: 'Bank Transfer',
                accountId: '',
                reference: '',
            });
        },
    });

    const markAsSentMutation = useMutation({
        mutationFn: (id: string) => invoicesService.update(id, { status: InvoiceStatus.SENT }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });

    const handleDelete = (id: string, invoiceNumber: string) => {
        if (confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const openPaymentModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        setPaymentData({
            ...paymentData,
            amount: invoice.balanceDue || invoice.total, // Default to full balance
        });
        setIsPaymentModalOpen(true);
    };

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInvoice && paymentData.accountId) {
            payMutation.mutate({ id: selectedInvoice.id, data: paymentData });
        }
    };

    if (isLoading) return <div className="text-white">{t('loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">{t('invoices')}</h1>
                <Link
                    to="/invoices/new"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('create_invoice')}</span>
                </Link>
            </div>

            {invoices?.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">{t('no_invoices')}</h3>
                    <p className="text-gray-400 mt-1">{t('create_first_invoice')}</p>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-950 text-gray-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">{t('number')}</th>
                                    <th className="px-6 py-4 font-medium">{t('client')}</th>
                                    <th className="px-6 py-4 font-medium">{t('date')}</th>
                                    <th className="px-6 py-4 font-medium text-right">{t('amount')}</th>
                                    <th className="px-6 py-4 font-medium text-right">Paid</th>
                                    <th className="px-6 py-4 font-medium text-right">Balance</th>
                                    <th className="px-6 py-4 font-medium">{t('status')}</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {invoices?.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-gray-300">{invoice.customerName}</td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {new Date(invoice.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium text-right">
                                            {formatCurrency(invoice.total)}
                                        </td>
                                        <td className="px-6 py-4 text-green-400 font-medium text-right">
                                            {formatCurrency(invoice.amountPaid || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-red-400 font-medium text-right">
                                            {formatCurrency(invoice.balanceDue ?? invoice.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                                invoice.status === InvoiceStatus.PAID && "bg-green-900/30 text-green-400",
                                                invoice.status === InvoiceStatus.PARTIALLY_PAID && "bg-blue-900/30 text-blue-400",
                                                invoice.status === InvoiceStatus.SENT && "bg-yellow-900/30 text-yellow-400",
                                                invoice.status === InvoiceStatus.DRAFT && "bg-gray-800 text-gray-400",
                                            )}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {invoice.status === InvoiceStatus.DRAFT && (
                                                    <button
                                                        onClick={() => markAsSentMutation.mutate(invoice.id)}
                                                        className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                                        title="Mark as Sent"
                                                        disabled={markAsSentMutation.isPending}
                                                    >
                                                        Mark as Sent
                                                    </button>
                                                )}
                                                {invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.DRAFT && (
                                                    <button
                                                        onClick={() => openPaymentModal(invoice)}
                                                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-950/50 rounded-lg transition-colors"
                                                        title="Record Payment"
                                                    >
                                                        <DollarSign size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 rounded-lg transition-colors"
                                                    title="Edit invoice"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors"
                                                    title="Delete invoice"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Record Payment</h2>
                        <p className="text-gray-400 mb-4">
                            Payment for Invoice <span className="text-white font-mono">{selectedInvoice.invoiceNumber}</span>
                        </p>

                        <form onSubmit={handlePay} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    max={selectedInvoice.balanceDue ?? selectedInvoice.total}
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={paymentData.date}
                                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                                <select
                                    value={paymentData.method}
                                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Deposit To</label>
                                <select
                                    required
                                    value={paymentData.accountId}
                                    onChange={(e) => setPaymentData({ ...paymentData, accountId: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">Select Account</option>
                                    {assetAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
                                <input
                                    type="text"
                                    value={paymentData.reference}
                                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    placeholder="e.g. Transaction ID"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={payMutation.isPending}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {payMutation.isPending ? 'Processing...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
