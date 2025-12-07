import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '../services/invoices';
import { Currency, InvoiceStatus } from '@bookkeeping/shared';
import { Plus, Trash } from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

export const CreateInvoicePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        customerId: 'user-123',
        customerName: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: Currency.AED,
        status: InvoiceStatus.DRAFT,
        items: [
            { description: 'Service A', quantity: 1, unitPrice: 100, taxRate: 5 },
        ],
        notes: '',
    });

    const [isScanning, setIsScanning] = useState(false);

    // Fetch existing invoice if in edit mode
    const { data: existingInvoice } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoicesService.findOne(id!),
        enabled: isEditMode,
    });

    // Populate form when invoice data loads
    useEffect(() => {
        if (existingInvoice) {
            setFormData({
                customerId: existingInvoice.customerId || 'user-123',
                customerName: existingInvoice.customerName || '',
                date: existingInvoice.date?.split('T')[0] || formData.date,
                dueDate: existingInvoice.dueDate?.split('T')[0] || formData.dueDate,
                currency: existingInvoice.currency || Currency.AED,
                status: existingInvoice.status || InvoiceStatus.DRAFT,
                items: existingInvoice.items || formData.items,
                notes: existingInvoice.notes || '',
            });
        }
    }, [existingInvoice]);

    const createMutation = useMutation({
        mutationFn: isEditMode
            ? (data: any) => invoicesService.update(id!, data)
            : invoicesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            navigate('/invoices');
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64 = reader.result as string;
                const response = await api.post('/ocr/scan', { image: base64 });
                const { date, totalAmount, merchantName, currency, rawText, items: parsedItems } = response.data.data;

                // Parse date from raw text if not detected
                let parsedDate = formData.date;
                if (date) {
                    parsedDate = new Date(date).toISOString().split('T')[0];
                } else if (rawText) {
                    // Try to find date in rawText
                    const dateMatch = rawText.match(/Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
                    if (dateMatch) {
                        const [month, day, year] = dateMatch[1].split('/');
                        parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }

                // Use parsed items if available, otherwise create summary item
                const invoiceItems = parsedItems && parsedItems.length > 0
                    ? parsedItems
                    : [
                        {
                            description: `Expense at ${merchantName || 'Unknown Vendor'}`,
                            quantity: 1,
                            unitPrice: totalAmount || 0,
                            taxRate: 0, // Set to 0 since OCR extracts the final inclusive amount
                        },
                    ];

                setFormData((prev) => ({
                    ...prev,
                    date: parsedDate,
                    customerId: merchantName || prev.customerId,
                    currency: currency || prev.currency,
                    notes: rawText ? `Scanned Receipt from ${merchantName}\n\nExtracted Data:\n${rawText}` : `Scanned from ${merchantName}`,
                    items: invoiceItems,
                }));

                const itemCount = parsedItems?.length || 0;
                alert(`Receipt scanned!\n\nMerchant: ${merchantName}\nAmount: ${totalAmount} ${currency}\n${itemCount > 0 ? `\nParsed ${itemCount} line items!` : ''}\n\nCheck the form below.`);
            } catch (error: any) {
                console.error('OCR failed:', error);
                alert(`Failed to scan receipt: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsScanning(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 5 }],
        });
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
                </h1>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="receipt-upload"
                        disabled={isScanning}
                    />
                    <label
                        htmlFor="receipt-upload"
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors",
                            isScanning && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isScanning ? 'Scanning...' : 'Scan Receipt'}
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Client Name</label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                                placeholder="Enter client name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                {Object.values(Currency).map((curr) => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
                    <h3 className="text-lg font-medium text-white mb-2">Notes</h3>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes or scanned receipt details..."
                        rows={6}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">Items</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/invoices')}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {createMutation.isPending
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
                    </button>
                </div>
            </form>
        </div>
    );
};
